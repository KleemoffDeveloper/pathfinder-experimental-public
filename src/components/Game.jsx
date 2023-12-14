import { useState } from "react";
import SeedPreview from "./SeedPreview";
import Gameplay from "./Gameplay";

export default function Game() {
  const [gameplayActive, setGameplay] = useState(false);
  const [seed, setSeed] = useState();

  return (
    <div className="game grid place-items-center w-full min-h-full">
      <div className="modal sm:border rounded px-3 pt-3 pb-1 w-full">
        {gameplayActive ? (
          <Gameplay
            gameInfo={{
              ...seed,
              maxChoices: 3,
            }}
          />
        ) : (
          <SeedPreview
            image={
              "https://pathfinder-prototype.netlify.app/assets/on-galaxys-edge-variant-4-61f553b7.png"
            }
            title={"On Galaxy's Edge"}
            plot={
              "You are an intergalactic space traveler who has discovered teleportation technology."
            }
            setGameplay={setGameplay}
            setSeed={setSeed}
          />
        )}
      </div>
    </div>
  );
}
