import { Navigate, Route, Routes } from "react-router-dom";

import HomePage from "./pages/HomePage.jsx";
import SignUpPage from "./pages/SignUpPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import NotificationsPage from "./pages/NotificationsPage.jsx";
import CallPage from "./pages/CallPage.jsx";
import ChatPage from "./pages/ChatPage.jsx";
import OnboardingPage from "./pages/OnboardingPage.jsx";
import FriendsPage from "./pages/FriendsPage.jsx";
import ChatsListPage from "./pages/ChatsListPage.jsx";

import { Toaster } from "react-hot-toast";

import PageLoader from "./components/PageLoader.jsx";
import useAuthUser from "./hooks/useAuthUser.js";
import Layout from "./components/Layout.jsx";
import { useThemeStore } from "./store/useThemeStore.js";
import { VideoClientProvider, useVideoClient } from "./context/VideoClientContext.jsx";

// 🔥 ADD THIS
import { StreamVideo } from "@stream-io/video-react-sdk";


// 🔥 WRAPPER COMPONENT (IMPORTANT)
const AppContent = () => {
  const { videoClient } = useVideoClient();
  const { isLoading, authUser } = useAuthUser();
  const { theme } = useThemeStore();

  const isAuthenticated = Boolean(authUser);
  const isOnboarded = authUser?.isOnboarded;

  if (isLoading) return <PageLoader />;

  // 🔥 WAIT until videoClient ready
  if (!videoClient) {
    console.log("⏳ Waiting for video client...");
    return <PageLoader />;
  }

  return (
    <StreamVideo client={videoClient}>
      <div className="h-screen" data-theme={theme}>
        <Routes>

          <Route
            path="/"
            element={
              isAuthenticated && isOnboarded ? (
                <Layout showSidebar={true}>
                  <HomePage />
                </Layout>
              ) : (
                <Navigate to={!isAuthenticated ? "/login" : "/onboarding"} />
              )
            }
          />

          <Route
            path="/friends"
            element={
              isAuthenticated && isOnboarded ? (
                <Layout showSidebar={true}>
                  <FriendsPage />
                </Layout>
              ) : (
                <Navigate to={!isAuthenticated ? "/login" : "/onboarding"} />
              )
            }
          />

          <Route
            path="/chats"
            element={
              isAuthenticated && isOnboarded ? (
                <Layout showSidebar={true}>
                  <ChatsListPage />
                </Layout>
              ) : (
                <Navigate to={!isAuthenticated ? "/login" : "/onboarding"} />
              )
            }
          />

          <Route
            path="/signup"
            element={
              !isAuthenticated
                ? <SignUpPage />
                : <Navigate to={isOnboarded ? "/" : "/onboarding"} />
            }
          />

          <Route
            path="/login"
            element={
              !isAuthenticated
                ? <LoginPage />
                : <Navigate to={isOnboarded ? "/" : "/onboarding"} />
            }
          />

          <Route
            path="/notifications"
            element={
              isAuthenticated && isOnboarded ? (
                <Layout showSidebar={true}>
                  <NotificationsPage />
                </Layout>
              ) : (
                <Navigate to={!isAuthenticated ? "/login" : "/onboarding"} />
              )
            }
          />

          <Route
            path="/call/:id"
            element={
              isAuthenticated && isOnboarded
                ? <CallPage />
                : <Navigate to={!isAuthenticated ? "/login" : "/onboarding"} />
            }
          />

          <Route
            path="/chat/:id"
            element={
              isAuthenticated && isOnboarded ? (
                <Layout showSidebar={false}>
                  <ChatPage />
                </Layout>
              ) : (
                <Navigate to={!isAuthenticated ? "/login" : "/onboarding"} />
              )
            }
          />

          <Route
            path="/onboarding"
            element={
              isAuthenticated ? (
                !isOnboarded ? (
                  <OnboardingPage />
                ) : (
                  <Navigate to="/" />
                )
              ) : (
                <Navigate to="/login" />
              )
            }
          />

        </Routes>

        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: "#00A19B",
              color: "#fff",
              borderRadius: "12px",
            },
            success: {
              iconTheme: {
                primary: "#fff",
                secondary: "#00A19B",
              },
            },
            error: {
              style: {
                background: "#f87272",
              },
            },
          }}
        />
      </div>
    </StreamVideo>
  );
};


// 🔥 MAIN APP
const App = () => {
  return (
    <VideoClientProvider>
      <AppContent />
    </VideoClientProvider>
  );
};

export default App;