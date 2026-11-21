import { useEffect, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import {
  hasSeenHowToPlay,
  HowToPlay,
  markHowToPlaySeen,
} from "./components/HowToPlay";
import { SiteFooter } from "./components/SiteFooter";
import { SiteHeader } from "./components/SiteHeader";
import { ArchivePage } from "./pages/ArchivePage";
import { HomePage } from "./pages/HomePage";
import { PuzzlePage } from "./pages/PuzzlePage";

export function App() {
  const [howToOpen, setHowToOpen] = useState(false);

  useEffect(() => {
    if (!hasSeenHowToPlay()) {
      setHowToOpen(true);
    }
  }, []);

  function closeHowToPlay() {
    markHowToPlaySeen();
    setHowToOpen(false);
  }

  return (
    <div className="min-h-screen bg-comms-bg px-3 pb-10 pt-4 sm:px-4">
      <SiteHeader onHowToPlay={() => setHowToOpen(true)} />

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/archive" element={<ArchivePage />} />
        <Route path="/puzzle/:id" element={<PuzzlePage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <SiteFooter />

      <HowToPlay open={howToOpen} onClose={closeHowToPlay} />
    </div>
  );
}
