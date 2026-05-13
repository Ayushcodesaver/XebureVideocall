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
import SecuritySettings from "./pages/SecuritySettings.jsx";
import { Toaster } from "react-hot-toast";
import PageLoader from "./components/PageLoader.jsx";
import useAuthUser from "./hooks/useAuthUser.js";
import Layout from "./components/Layout.jsx";
import { useThemeStore } from "./store/useThemeStore.js";
import { VideoClientProvider, useVideoClient } from "./context/VideoClientContext.jsx";
import { SecurityProvider } from "./context/SecurityContext.jsx";
import { EncryptionProvider } from "./context/EncryptionContext.jsx";
import { StreamVideo } from "@stream-io/video-react-sdk";
import ErrorBoundary from "./components/ErrorBoundary.jsx";  // ✅ ADDED

// Component that uses the video client
const AuthenticatedApp = () => {
  const { videoClient } = useVideoClient();
  const { theme } = useThemeStore();

  // If videoClient not yet ready, show a simple loader – but this will disappear quickly
  if (!videoClient) {
    return (
      <div className="h-screen flex items-center justify-center" data-theme={theme}>
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm text-gray-500">Initialising video...</p>
        </div>
      </div>
    );
  }

  // Video client is ready – render full app inside StreamVideo
  return (
    <StreamVideo client={videoClient}>
      <Routes>
        <Route path="/" element={<Layout showSidebar><HomePage /></Layout>} />
        <Route path="/friends" element={<Layout showSidebar><FriendsPage /></Layout>} />
        <Route path="/chats" element={<Layout showSidebar><ChatsListPage /></Layout>} />
        <Route path="/notifications" element={<Layout showSidebar><NotificationsPage /></Layout>} />
        <Route path="/security" element={<Layout showSidebar><SecuritySettings /></Layout>} />
        <Route path="/call/:id" element={<CallPage />} />
        {/* ✅ ChatPage wrapped with ErrorBoundary */}
        <Route 
          path="/chat/:id" 
          element={
            <ErrorBoundary>
              <Layout showSidebar={false}>
                <ChatPage />
              </Layout>
            </ErrorBoundary>
          } 
        />
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </StreamVideo>
  );
};

const AppContent = () => {
  const { isLoading, authUser } = useAuthUser();
  const { theme } = useThemeStore();
  const isAuthenticated = Boolean(authUser);
  const isOnboarded = authUser?.isOnboarded;

  if (isLoading) return <PageLoader />;

  // Unauthenticated routes – no video client needed
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

  // Handle onboarding redirect
  if (!isOnboarded) {
    return (
      <div className="h-screen" data-theme={theme}>
        <Routes>
          <Route path="/onboarding" element={<OnboardingPage />} />
          <Route path="*" element={<Navigate to="/onboarding" />} />
        </Routes>
        <Toaster position="top-right" />
      </div>
    );
  }

  // Authenticated + onboarded – render the app that requires video client
  return (
    <div className="h-screen" data-theme={theme}>
      <AuthenticatedApp />
      <Toaster 
        position="top-right" 
        toastOptions={{
          duration: 3000,
          style: { background: "#00A19B", color: "#fff", borderRadius: "12px" },
        }} 
      />
    </div>
  );
};

// ✅ Wrap with SecurityProvider and EncryptionProvider
const App = () => (
  <VideoClientProvider>
    <SecurityProvider>
      <EncryptionProvider>
        <AppContent />
      </EncryptionProvider>
    </SecurityProvider>
  </VideoClientProvider>
);

export default App;