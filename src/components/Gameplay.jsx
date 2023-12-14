import { useEffect, useState } from "react";
import { systemInstructions } from "../assets/prompt-engineering/prompt-controller";
import storyNode from "./api";

export default function Gameplay({ gameInfo }) {
  const [initialized, setInitialized] = useState(false);
  const [choicesCount, setChoicesCount] = useState(0);
  const [messages, setMessages] = useState([
    { role: "system", content: `${systemInstructions.prompt}` },
  ]);
  const [story, setStory] = useState([]);
  const [currentMessage, setCurrentMessage] = useState({});

  // We set the generating state to tell JSX that we are loading a response
  const [generating, setGenerating] = useState(false);
  async function generate(m_messages) {
    setGenerating(true);

    // Returns a story node with an image url
    const node = await storyNode(m_messages, setMessages);

    console.log(node);

    // This is so players can view their entire story and go back to previous choices
    // It might be a good idea to monetize this feature
    setStory([...story, node]);

    // This is either a story node or an error
    setCurrentMessage(node);

    // Only needed for the very first request
    if (!initialized && !node.error) setInitialized(true);

    setGenerating(false);
  }

  return (
    <div className="gameplay grid gap-5 p-5">
      {/* Progress Bar */}
      <div className="progress flex gap-3">
        {/* Text Percentage */}
        <p>{((choicesCount / gameInfo.maxChoices) * 100).toFixed()}%</p>
        {/* Fill Percentage */}
        <div className="progress-bar w-full border overflow-hidden">
          <div
            className="fill bg-slate-200 h-full"
            style={{
              width: `${(choicesCount / gameInfo.maxChoices) * 100}%`,
            }}
          ></div>
          {/* Story Nodes, allows players to revisit previous choices */}
          <div></div>
        </div>
      </div>
      {/* Seed Info and Image */}
      <div>
        <h1 className="text-5xl font-bold my-5">{gameInfo.title}</h1>
        <img
          src={
            currentMessage.image_url ? currentMessage.image_url : gameInfo.image
          }
          style={{ maxWidth: "100%" }}
          className="rounded-xl border-4 border-white w-full"
        />
      </div>
      {/* Current Scenario in the story */}
      <div>
        {currentMessage.plot
          ? currentMessage.plot
          : currentMessage.end
          ? "Conclusion: " + currentMessage.end
          : gameInfo.plot}
      </div>
      {/* Initialize the story, this must be successful at least once */}
      {!initialized && !generating ? (
        <div>
          <button
            onClick={() => {
              generate([
                ...messages,
                { role: "user", content: `${gameInfo.plot}` },
              ]);
            }}
          >
            Begin Your Journey
          </button>
        </div>
      ) : null}
      {/*  */}
      {currentMessage.choices && !generating ? (
        <div className="choices grid gap-10">
          {currentMessage.choices.map((choice, index) => (
            <div
              key={crypto.randomUUID()}
              className="choice border rounded-xl flex gap-5 py-1 px-5 items-center"
              onClick={() => {
                // Update progress bar
                let count = choicesCount + 1;
                setChoicesCount(count);

                // Set the messages state and generate.
                let m_messages;
                if (count < gameInfo.maxChoices) {
                  m_messages = [...messages, { role: "user", content: choice }];
                } else {
                  m_messages = [
                    ...messages,
                    { role: "user", content: `${choice} <end/>` },
                  ];
                }
                // Generate a new response to progress through the story
                generate(m_messages);
              }}
            >
              <b>{index + 1}.</b>
              <p>{choice}</p>
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
