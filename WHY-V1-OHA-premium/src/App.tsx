import { useEffect, useState } from "react";
import { HashRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import IntroSplash from "./components/IntroSplash";
import AmbientBackground from "./components/AmbientBackground";
import Lobby from "./pages/Lobby";
import Why from "./pages/Why";
import Journal from "./pages/Journal";
import SetupLibrary from "./pages/SetupLibrary";
import Analytics from "./pages/Analytics";
import Markets from "./pages/Markets";
import News from "./pages/News";
import Tools from "./pages/Tools";
import Profile from "./pages/Profile";
import AuthScreen from "./pages/Auth";
import { useAuth } from "./lib/auth";
import { useProfile } from "./lib/useProfile";

const GUEST_KEY = "why.guestMode.v1";

function App() {
  const { profile, update: updateProfile, loading: profileLoading } = useProfile();
  const { user, loading, cloudEnabled } = useAuth();
  const [guestMode, setGuestMode] = useState(() => localStorage.getItem(GUEST_KEY) === "1");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", profile.theme);
    document.documentElement.setAttribute("data-accent", profile.accent);
  }, [profile]);
  const toggleTheme = () => updateProfile({ ...profile, theme: profile.theme === "light" ? "dark" : "light" });
  const toggleLang = () => updateProfile({ ...profile, lang: profile.lang === "en" ? "tr" : "en" });

  if ((cloudEnabled && loading) || profileLoading) {
    return <div style={{ minHeight: "100vh" }} />;
  }

  if (cloudEnabled && !user && !guestMode) {
    return (
      <>
        <AmbientBackground />
        <AuthScreen
          lang={profile.lang}
          onContinueLocal={() => {
            localStorage.setItem(GUEST_KEY, "1");
            setGuestMode(true);
          }}
        />
      </>
    );
  }

  return (
    <HashRouter>
      <AmbientBackground />
      <IntroSplash lang={profile.lang} />
      <Routes>
        <Route element={<Layout profile={profile} onToggleTheme={toggleTheme} onToggleLang={toggleLang} />}>
          <Route index element={<Lobby profile={profile} />} />
          <Route path="why" element={<Why profile={profile} />} />
          <Route path="journal" element={<Journal profile={profile} />} />
          <Route path="setups" element={<SetupLibrary profile={profile} />} />
          <Route path="analytics" element={<Analytics profile={profile} />} />
          <Route path="markets" element={<Markets profile={profile} />} />
          <Route path="news" element={<News profile={profile} />} />
          <Route path="tools" element={<Tools profile={profile} />} />
          <Route
            path="profile"
            element={
              <Profile
                profile={profile}
                onUpdate={updateProfile}
                onRequestSignIn={() => { localStorage.removeItem(GUEST_KEY); setGuestMode(false); }}
              />
            }
          />
        </Route>
      </Routes>
    </HashRouter>
  );
}

export default App;
