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
import { CreatePage } from "./pages/CreatePage";
import { CustomPlayPage } from "./pages/CustomPlayPage";
import { HomePage } from "./pages/HomePage";
import { AccountPage } from "./pages/AccountPage";
import { LeaderboardPage } from "./pages/LeaderboardPage";
import { PuzzlePage } from "./pages/PuzzlePage";
import { SignInPage } from "./pages/SignInPage";
import { SsoCallbackPage } from "./pages/SsoCallbackPage";
import { ErrorBoundary } from "./components/ErrorBoundary";

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

      <ErrorBoundary>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/archive" element={<ArchivePage />} />
        <Route path="/create" element={<CreatePage />} />
        <Route path="/ranks" element={<LeaderboardPage />} />
        <Route path="/account" element={<AccountPage />} />
        <Route path="/play" element={<CustomPlayPage />} />
        <Route path="/puzzle/:id" element={<PuzzlePage />} />
        <Route path="/sign-in/*" element={<SignInPage />} />
        <Route path="/sso-callback/*" element={<SsoCallbackPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      </ErrorBoundary>

      <SiteFooter />

      <HowToPlay open={howToOpen} onClose={closeHowToPlay} />
    </div>
  );
}
