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
import { StreamVideo } from "@stream-io/video-react-sdk";

// AppContent component
const AppContent = () => {
  const { videoClient, isReady } = useVideoClient(); // ✅ Use isReady flag
  const { isLoading, authUser } = useAuthUser();
  const { theme } = useThemeStore();

  const isAuthenticated = Boolean(authUser);
  const isOnboarded = authUser?.isOnboarded;

  // ✅ Better loading logic
  if (isLoading) {
    console.log("⏳ Auth loading...");
    return <PageLoader />;
  }

  // ✅ Wait for video client ONLY if user is authenticated
  if (isAuthenticated && !videoClient) {
    console.log("⏳ Waiting for video client. isReady:", isReady);
    return <PageLoader />;
  }

  // ✅ If user is not authenticated, don't wait for video client
  if (!isAuthenticated) {
    return (
      <div className="h-screen" data-theme={theme}>
        <Routes>
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
        <Toaster position="top-right" />
      </div>
    );
  }

  // ✅ Authenticated user with video client ready
  return (
    <StreamVideo client={videoClient}>
      <div className="h-screen" data-theme={theme}>
        <Routes>
          <Route
            path="/"
            element={
              isOnboarded ? (
                <Layout showSidebar={true}>
                  <HomePage />
                </Layout>
              ) : (
                <Navigate to="/onboarding" />
              )
            }
          />

          <Route
            path="/friends"
            element={
              isOnboarded ? (
                <Layout showSidebar={true}>
                  <FriendsPage />
                </Layout>
              ) : (
                <Navigate to="/onboarding" />
              )
            }
          />

          <Route
            path="/chats"
            element={
              isOnboarded ? (
                <Layout showSidebar={true}>
                  <ChatsListPage />
                </Layout>
              ) : (
                <Navigate to="/onboarding" />
              )
            }
          />

          <Route
            path="/signup"
            element={<Navigate to="/" />}
          />

          <Route
            path="/login"
            element={<Navigate to="/" />}
          />

          <Route
            path="/notifications"
            element={
              isOnboarded ? (
                <Layout showSidebar={true}>
                  <NotificationsPage />
                </Layout>
              ) : (
                <Navigate to="/onboarding" />
              )
            }
          />

          <Route
            path="/call/:id"
            element={
              isOnboarded ? (
                <CallPage />
              ) : (
                <Navigate to="/onboarding" />
              )
            }
          />

          <Route
            path="/chat/:id"
            element={
              isOnboarded ? (
                <Layout showSidebar={false}>
                  <ChatPage />
                </Layout>
              ) : (
                <Navigate to="/onboarding" />
              )
            }
          />

          <Route
            path="/onboarding"
            element={
              !isOnboarded ? (
                <OnboardingPage />
              ) : (
                <Navigate to="/" />
              )
            }
          />

          <Route path="*" element={<Navigate to="/" />} />
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

// Main App
const App = () => {
  return (
    <VideoClientProvider>
      <AppContent />
    </VideoClientProvider>
  );
};

export default App;