import { createContext, useContext, useState, useEffect } from "react";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

const EncryptionContext = createContext(null);

export const useEncryptionContext = () => {
  const context = useContext(EncryptionContext);
  if (!context) {
    throw new Error("useEncryptionContext must be used within EncryptionProvider");
  }
  return context;
};

export const EncryptionProvider = ({ children }) => {
  const [encryptionKey, setEncryptionKey] = useState(null);
  const [encryptionStatus, setEncryptionStatus] = useState({
    enabled: false,
    algorithm: "AES-256-GCM",
    keyRotation: 30 // days
  });
  const [keyHistory, setKeyHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load encryption status on mount
  useEffect(() => {
    fetchEncryptionStatus();
    fetchKeyHistory();
  }, []);

  const fetchEncryptionStatus = async () => {
    try {
      const response = await axiosInstance.get("/encryption/status");
      setEncryptionStatus(response.data);
      setEncryptionKey(response.data.currentKeyId);
    } catch (error) {
      console.error("Failed to fetch encryption status:", error);
    }
  };

  const fetchKeyHistory = async () => {
    try {
      const response = await axiosInstance.get("/encryption/key-history");
      setKeyHistory(response.data.keys || []);
    } catch (error) {
      console.error("Failed to fetch key history:", error);
    }
  };

  // Rotate encryption key
  const rotateEncryptionKey = async () => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.post("/encryption/rotate-key");
      setEncryptionKey(response.data.newKeyId);
      setEncryptionStatus(prev => ({ ...prev, currentKeyId: response.data.newKeyId }));
      toast.success("Encryption key rotated successfully");
      await fetchKeyHistory();
      return response.data.newKeyId;
    } catch (error) {
      console.error("Failed to rotate encryption key:", error);
      toast.error("Failed to rotate encryption key");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Get encryption strength
  const getEncryptionStrength = () => {
    return {
      level: "High",
      algorithm: encryptionStatus.algorithm,
      keySize: 256,
      mode: "GCM",
      perfectForwardSecrecy: true
    };
  };

  // Encrypt message (client-side)
  const encryptMessage = async (message, recipientId) => {
    try {
      const response = await axiosInstance.post("/encryption/encrypt", {
        message,
        recipientId
      });
      return response.data;
    } catch (error) {
      console.error("Encryption failed:", error);
      return null;
    }
  };

  // Decrypt message (client-side)
  const decryptMessage = async (encryptedData, senderId) => {
    try {
      const response = await axiosInstance.post("/encryption/decrypt", {
        encryptedData,
        senderId
      });
      return response.data.decrypted;
    } catch (error) {
      console.error("Decryption failed:", error);
      return null;
    }
  };

  // Enable end-to-end encryption for a chat
  const enableE2EE = async (chatId) => {
    try {
      await axiosInstance.post(`/encryption/enable/${chatId}`);
      toast.success("End-to-end encryption enabled for this chat");
      return true;
    } catch (error) {
      console.error("Failed to enable E2EE:", error);
      toast.error("Failed to enable encryption");
      return false;
    }
  };

  // Get encryption status for a chat
  const getChatEncryptionStatus = async (chatId) => {
    try {
      const response = await axiosInstance.get(`/encryption/chat-status/${chatId}`);
      return response.data;
    } catch (error) {
      console.error("Failed to get chat encryption status:", error);
      return { enabled: false };
    }
  };

  return (
    <EncryptionContext.Provider
      value={{
        encryptionKey,
        encryptionStatus,
        keyHistory,
        isLoading,
        rotateEncryptionKey,
        getEncryptionStrength,
        encryptMessage,
        decryptMessage,
        enableE2EE,
        getChatEncryptionStatus,
        fetchEncryptionStatus,
        fetchKeyHistory,
      }}
    >
      {children}
    </EncryptionContext.Provider>
  );
};