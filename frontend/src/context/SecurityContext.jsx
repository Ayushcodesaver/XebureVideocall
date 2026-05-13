import { createContext, useContext, useState, useEffect } from "react";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

const SecurityContext = createContext(null);

export const useSecurity = () => {
  const context = useContext(SecurityContext);
  if (!context) {
    throw new Error("useSecurity must be used within SecurityProvider");
  }
  return context;
};

export const SecurityProvider = ({ children }) => {
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [backupCodes, setBackupCodes] = useState([]);
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [trustedDevices, setTrustedDevices] = useState([]);
  const [securityAlerts, setSecurityAlerts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load 2FA status on mount
  useEffect(() => {
    fetch2FAStatus();
    fetchTrustedDevices();
    fetchSecurityAlerts();
  }, []);

  // Fetch 2FA status from backend
  const fetch2FAStatus = async () => {
    try {
      const response = await axiosInstance.get("/auth/2fa/status");
      setIs2FAEnabled(response.data.enabled);
      if (response.data.recoveryEmail) {
        setRecoveryEmail(response.data.recoveryEmail);
      }
    } catch (error) {
      console.error("Failed to fetch 2FA status:", error);
    }
  };

  // Fetch trusted devices
  const fetchTrustedDevices = async () => {
    try {
      const response = await axiosInstance.get("/auth/trusted-devices");
      setTrustedDevices(response.data.devices || []);
    } catch (error) {
      console.error("Failed to fetch trusted devices:", error);
    }
  };

  // Fetch security alerts
  const fetchSecurityAlerts = async () => {
    try {
      const response = await axiosInstance.get("/auth/security-alerts");
      setSecurityAlerts(response.data.alerts || []);
    } catch (error) {
      console.error("Failed to fetch security alerts:", error);
    }
  };

  // Setup 2FA - Generate secret and QR code
  const setup2FA = async () => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.post("/auth/2fa/setup");
      const { secret, qrCodeUrl, backupCodes: codes } = response.data;
      setBackupCodes(codes || []);
      return { secret, qrCodeUrl, backupCodes: codes };
    } catch (error) {
      console.error("2FA setup failed:", error);
      toast.error("Failed to setup 2FA");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Verify and enable 2FA
  const verify2FA = async (code) => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.post("/auth/2fa/verify", { code });
      if (response.data.valid) {
        setIs2FAEnabled(true);
        toast.success("2FA enabled successfully!");
        return true;
      }
      toast.error("Invalid verification code");
      return false;
    } catch (error) {
      console.error("2FA verification failed:", error);
      toast.error(error.response?.data?.message || "Verification failed");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Disable 2FA
  const disable2FA = async (code) => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.post("/auth/2fa/disable", { code });
      if (response.data.success) {
        setIs2FAEnabled(false);
        setBackupCodes([]);
        toast.success("2FA disabled successfully");
        return true;
      }
      toast.error("Invalid verification code");
      return false;
    } catch (error) {
      console.error("2FA disable failed:", error);
      toast.error(error.response?.data?.message || "Failed to disable 2FA");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Generate new backup codes
  const regenerateBackupCodes = async () => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.post("/auth/2fa/backup-codes");
      const codes = response.data.backupCodes;
      setBackupCodes(codes);
      toast.success("New backup codes generated");
      return codes;
    } catch (error) {
      console.error("Failed to generate backup codes:", error);
      toast.error("Failed to generate backup codes");
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  // Add trusted device
  const addTrustedDevice = async (deviceName) => {
    try {
      const response = await axiosInstance.post("/auth/trusted-devices", { deviceName });
      setTrustedDevices(prev => [...prev, response.data.device]);
      toast.success("Device added to trusted list");
      return response.data.device;
    } catch (error) {
      console.error("Failed to add trusted device:", error);
      toast.error("Failed to add trusted device");
      return null;
    }
  };

  // Remove trusted device
  const removeTrustedDevice = async (deviceId) => {
    try {
      await axiosInstance.delete(`/auth/trusted-devices/${deviceId}`);
      setTrustedDevices(prev => prev.filter(d => d.id !== deviceId));
      toast.success("Device removed from trusted list");
    } catch (error) {
      console.error("Failed to remove trusted device:", error);
      toast.error("Failed to remove trusted device");
    }
  };

  // Report security incident
  const reportSecurityIncident = async (incident) => {
    try {
      await axiosInstance.post("/auth/security-incidents", incident);
      toast.success("Security incident reported. We'll investigate.");
    } catch (error) {
      console.error("Failed to report incident:", error);
      toast.error("Failed to report incident");
    }
  };

  // Real-time security alert subscription (WebSocket)
  useEffect(() => {
    let eventSource = null;
    
    if (is2FAEnabled) {
      // Setup SSE or WebSocket for real-time alerts
      const setupRealtimeAlerts = () => {
        try {
          eventSource = new EventSource('/api/auth/security-events');
          
          eventSource.onmessage = (event) => {
            const alert = JSON.parse(event.data);
            setSecurityAlerts(prev => [alert, ...prev].slice(0, 20));
            
            // Show toast for critical alerts
            if (alert.severity === 'critical') {
              toast.error(`⚠️ Security Alert: ${alert.message}`, {
                duration: 10000,
                icon: '🔒'
              });
            } else if (alert.severity === 'high') {
              toast.warning(`🔔 Security Alert: ${alert.message}`, {
                duration: 7000,
                icon: '⚠️'
              });
            }
          };
          
          eventSource.onerror = () => {
            console.error("Security events connection lost");
            setTimeout(setupRealtimeAlerts, 5000);
          };
        } catch (error) {
          console.error("Failed to setup security events:", error);
        }
      };
      
      setupRealtimeAlerts();
    }
    
    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [is2FAEnabled]);

  // Check for suspicious login attempts
  const checkSuspiciousActivity = async () => {
    try {
      const response = await axiosInstance.get("/auth/suspicious-activity");
      if (response.data.hasSuspicious) {
        toast.error(
          `⚠️ Suspicious login attempt detected from ${response.data.location}`,
          { duration: 10000 }
        );
      }
    } catch (error) {
      console.error("Failed to check suspicious activity:", error);
    }
  };

  // Verify recovery code (for account recovery)
  const verifyRecoveryCode = async (code) => {
    try {
      const response = await axiosInstance.post("/auth/verify-recovery", { code });
      return response.data.valid;
    } catch (error) {
      console.error("Recovery code verification failed:", error);
      return false;
    }
  };

  // Set recovery email
  const setRecoveryEmailAddress = async (email) => {
    setIsLoading(true);
    try {
      await axiosInstance.post("/auth/recovery-email", { email });
      setRecoveryEmail(email);
      toast.success("Recovery email set successfully");
      return true;
    } catch (error) {
      console.error("Failed to set recovery email:", error);
      toast.error("Failed to set recovery email");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Get current session security info
  const getCurrentSessionInfo = async () => {
    try {
      const response = await axiosInstance.get("/auth/session-info");
      return response.data;
    } catch (error) {
      console.error("Failed to get session info:", error);
      return null;
    }
  };

  // Force logout all other devices
  const logoutAllOtherDevices = async () => {
    try {
      await axiosInstance.post("/auth/logout-all");
      toast.success("Logged out from all other devices");
      return true;
    } catch (error) {
      console.error("Failed to logout other devices:", error);
      toast.error("Failed to logout other devices");
      return false;
    }
  };

  // Get security log
  const getSecurityLog = async (page = 1, limit = 20) => {
    try {
      const response = await axiosInstance.get("/auth/security-log", {
        params: { page, limit }
      });
      return response.data;
    } catch (error) {
      console.error("Failed to fetch security log:", error);
      return { logs: [], total: 0 };
    }
  };

  return (
    <SecurityContext.Provider
      value={{
        // State
        is2FAEnabled,
        backupCodes,
        recoveryEmail,
        trustedDevices,
        securityAlerts,
        isLoading,
        
        // 2FA Methods
        setup2FA,
        verify2FA,
        disable2FA,
        regenerateBackupCodes,
        
        // Device Management
        addTrustedDevice,
        removeTrustedDevice,
        logoutAllOtherDevices,
        
        // Security Monitoring
        checkSuspiciousActivity,
        reportSecurityIncident,
        getSecurityLog,
        getCurrentSessionInfo,
        
        // Recovery
        verifyRecoveryCode,
        setRecoveryEmailAddress,
        
        // Refresh methods
        fetchTrustedDevices,
        fetchSecurityAlerts,
      }}
    >
      {children}
    </SecurityContext.Provider>
  );
};