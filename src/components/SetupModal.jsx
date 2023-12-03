import OpenAI from "openai";
import { useState } from "react";

export default function SetupModal() {
  const [isLoading, setLoading] = useState();

  return (
    <div className="modal sm:border w-full rounded grid gap-5 text-center p-5">
      <h1 className="text-5xl font-bold">Setup</h1>
      <form
        className="setup grid gap-5 place-items-center text-left"
        onSubmit={async (e) => {
          e.preventDefault();

          if (isLoading) {
            return;
          }

          // grab all input values
          const inputs = document.body
            .querySelector(".setup")
            .querySelectorAll("input");

          const username = inputs[0].value;
          const apikey = inputs[1].value;

          // make sure they're working
          if (username.length < 3) {
            return;
          }

          const openai = new OpenAI({
            apiKey: apikey,
            dangerouslyAllowBrowser: true,
          });

          setLoading(true);

          let badRequest = false;
          const request = await openai.chat.completions
            .create({
              messages: [
                {
                  role: "system",
                  content: `You are a nice robot.`,
                },
                {
                  role: "user",
                  content: `Hello.`,
                },
              ],
              temperature: 0.6,
              max_tokens: 5,
              model: "gpt-3.5-turbo",
            })
            .catch((error) => {
              setLoading(false);
              badRequest = true;
            });

          if (badRequest) return;

          // save to local storage
          localStorage.setItem(
            "pathfinder-ver1",
            JSON.stringify({ username: username, apikey: apikey })
          );

          window.open(window.location, "_self");
        }}
      >
        <p>
          In order to use this app, you must provide your own OpenAI API key.
          Your data will be saved locally on your own device but you can remove
          this data in <u>Settings</u> later.
        </p>
        <div className="grid w-full gap-2">
          <input type="text" placeholder="Enter a username" required />
        </div>
        <div className="grid w-full gap-2">
          <input type="password" placeholder="OpenAI API Key" required />
        </div>
        {isLoading ? (
          <img
            src="https://www.svgrepo.com/show/448500/loading.svg"
            className="loading bg-slate-100 rounded-full p-1"
          />
        ) : null}
        {/* confirm that their api key is real by sending a request to OpenAI */}
        <button className="w-max">Submit</button>
      </form>
    </div>
  );
}
