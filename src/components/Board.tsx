import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from "framer-motion";
import type { GameState, Group } from "../game/types";
import { SolvedRow } from "./SolvedRow";
import { Tile } from "./Tile";

interface BoardProps {
  state: GameState;
  shakeWords: string[];
  /** How many unsolved groups to show after a loss (staggered). */
  revealedLossCount: number;
  inputLocked: boolean;
  onToggle: (word: string) => void;
}

function unsolvedGroups(state: GameState): Group[] {
  return state.puzzle.groups
    .map((group, index) => ({ group, index }))
    .filter(({ index }) => !state.solved.includes(index))
    .sort((a, b) => a.group.difficulty - b.group.difficulty)
    .map(({ group }) => group);
}

export function Board({
  state,
  shakeWords,
  revealedLossCount,
  inputLocked,
  onToggle,
}: BoardProps) {
  const { puzzle, board, selected, solved, status } = state;
  const playing = status === "playing";
  const reducedMotion = useReducedMotion();

  const solvedGroups = solved.map((index) => puzzle.groups[index]!);
  const lossGroups =
    status === "lost" ? unsolvedGroups(state).slice(0, revealedLossCount) : [];

  return (
    <LayoutGroup>
      <div className="mx-auto flex w-full max-w-[390px] flex-col gap-2">
        <AnimatePresence initial={false}>
          {solvedGroups.map((group) => (
            <SolvedRow key={`solved-${group.category}`} group={group} />
          ))}
        </AnimatePresence>

        {status === "lost" ? (
          <AnimatePresence initial={false}>
            {lossGroups.map((group) => (
              <SolvedRow key={`reveal-${group.category}`} group={group} />
            ))}
          </AnimatePresence>
        ) : board.length > 0 ? (
          <motion.div
            layout
            className="grid grid-cols-4 gap-2"
            role="group"
            aria-label="Puzzle tiles"
          >
            <AnimatePresence mode="popLayout" initial={false}>
              {board.map((word) => (
                <motion.div
                  key={word}
                  layout
                  initial={false}
                  exit={
                    reducedMotion
                      ? { opacity: 0, transition: { duration: 0.2 } }
                      : {
                          opacity: 0,
                          scale: 0.85,
                          transition: { duration: 0.28, ease: "easeIn" },
                        }
                  }
                  transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                >
                  <Tile
                    word={word}
                    selected={selected.includes(word)}
                    shaking={shakeWords.includes(word)}
                    disabled={!playing || inputLocked}
                    onToggle={onToggle}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        ) : null}
      </div>
    </LayoutGroup>
  );
}
