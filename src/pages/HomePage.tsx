import { GameView } from "../components/GameView";
import { getDailyPuzzle } from "../game/daily";
import { puzzles } from "../data/puzzles";

export function HomePage() {
  const puzzle = getDailyPuzzle(puzzles);
  return <GameView key={puzzle.id} puzzle={puzzle} badge="Daily" />;
}
