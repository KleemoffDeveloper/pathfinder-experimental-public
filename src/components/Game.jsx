import { useEffect, useState } from "react";

function ActiveStory({ image, title, plot, setGameplay }) {
  return (
    <div className="active-story grid gap-10 p-5">
      <p className="font-semibold">Playing...</p>
      <div className="grid grid-flow-col w-full gap-5">
        <img src={image} className="shadow shadow-slate-100" />
        <div className="grid">
          <h1 className="text-4xl font-semibold">{title}</h1>
          <p>{plot}</p>
        </div>
      </div>
      <button onClick={() => setGameplay(true)}>Start Adventure</button>
    </div>
  );
}

function Gameplay({ gameInfo }) {
  const [initialized, setInitialized] = useState(false);

  const [choicesCount, setChoicesCount] = useState(0);
  const [plot, setPlot] = useState(gameInfo.plot);
  const [choices, setChoices] = useState();

  const [messages, setMessages] = useState([
    {
      role: "system",
      content: `We are playing an adventure game. Label the plot and choices. The plot of the story is ${gameInfo.plot}. Give me 3 choices to progress through the story.`,
    },
    { role: "user", content: "Start the game." },
  ]);

  const [generating, setGenerating] = useState(false);

  const filteredResponse = (response) =>
    response.split("\n").filter((e) => e && e !== "Choices:");

  async function generate() {
    setGenerating(true);

    let m_error;

    console.log("generating...");

    const request = await fetch(
      "https://pathfinder-game-api.onrender.com/response",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(messages),
      }
    )
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        return data;
      })
      .catch((error) => (m_error = true));

    if (m_error) {
      setGenerating(false);
      return;
    }

    // Updating the context for ChatGPT
    setMessages([...messages, request.choices[0].message]);

    const filtered = filteredResponse(request.choices[0].message.content);

    let m_plot = filtered
      .find((e) => e.substring(0, 4) === "Plot")
      .substring(5)
      .trim();

    let m_choices = filtered.filter(
      (e) =>
        e.includes("1.") ||
        e.includes("2.") ||
        e.includes("3.") ||
        (e.includes("Choice ") && e.length > 10)
    );

    setPlot(m_plot);
    setChoices(m_choices);

    setGenerating(false);
  }

  // Automatically updates the state on change
  useEffect(() => {}, [choices]);

  return (
    <div className="gameplay grid gap-5">
      <div className="progress flex gap-3">
        <p>{((choicesCount / gameInfo.maxChoices) * 100).toFixed()}%</p>
        <div className="progress-bar w-full border overflow-hidden">
          <div
            className="fill bg-slate-200 h-full"
            style={{
              width: `${(choicesCount / gameInfo.maxChoices) * 100}%`,
            }}
          ></div>
        </div>
      </div>
      <div>
        <h1 className="text-5xl font-bold">{gameInfo.title}</h1>
      </div>
      <div>{plot ? plot : gameInfo.plot}</div>
      {!initialized ? (
        <div>
          <button
            onClick={() => {
              generate();
              setInitialized(true);
            }}
          >
            Begin Your Journey
          </button>
        </div>
      ) : null}
      {choices && !generating ? (
        <div className="choices grid gap-10">
          {choices.map((choice, index) => (
            <div
              key={crypto.randomUUID()}
              className="choice border rounded-xl flex gap-5 py-1 px-5 items-center"
              onClick={() => {
                // Update progress bar
                let count = choicesCount + 1;
                setChoicesCount(count);

                // Set the messages state and generate.
                if (count < gameInfo.maxChoices)
                  setMessages([...messages, { role: "user", content: choice }]);
                else
                  setMessages([
                    ...messages,
                    {
                      role: "user",
                      content:
                        "Create a conclusion to the story. Label it as [Conclusion].",
                    },
                  ]);

                // Generate a new response to progress through the story
                generate();
              }}
            >
              <b>{index + 1}.</b>
              <p>{choice.split(":")[1]}</p>
            </div>
          ))}
        </div>
      ) : generating ? (
        <div className="flex gap-3 items-center">
          {" "}
          <img
            src="https://www.svgrepo.com/show/274034/loading.svg"
            className="loading w-10"
          />
          <b>Generating...</b>
        </div>
      ) : null}
    </div>
  );
}

export default function Game() {
  const [settings, toggleSettings] = useState();
  const [gameplayActive, setGameplay] = useState(false);

  return (
    <div className="game grid place-items-center w-full min-h-full">
      <div className="modal sm:border rounded px-8 pt-8 pb-1 w-full">
        {gameplayActive ? (
          <Gameplay
            gameInfo={{
              image:
                "https://pathfinder-prototype.netlify.app/assets/on-galaxys-edge-variant-4-61f553b7.png",
              title: "On Galaxy's Edge",
              plot: "You are an intergalactic space traveler who has discovered teleportation technology.",
              maxChoices: 3,
            }}
          />
        ) : (
          <ActiveStory
            image={
              "https://pathfinder-prototype.netlify.app/assets/on-galaxys-edge-variant-4-61f553b7.png"
            }
            title={"On Galaxy's Edge"}
            plot={
              "You are an intergalactic space traveler who has discovered teleportation technology."
            }
            setGameplay={setGameplay}
          />
        )}
        {/*  */}
        {/*  */}
        <div className="options grid grid-flow-col my-5">
          <b
            className="cursor-pointer"
            onClick={() => toggleSettings(!settings)}
          >
            Settings
          </b>
        </div>
        <div className="settings-options">
          {settings ? (
            <div className="settings bg-slate-100/20 rounded-xl p-5 my-2 grid grid-flow-col justify-start gap-5 items-center">
              <button
                onClick={() => {
                  localStorage.removeItem("pathfinder-ver1");
                  window.open(window.location, "_self");
                }}
              >
                Delete Profile
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
