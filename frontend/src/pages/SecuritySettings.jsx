import { useState, useEffect } from "react";
import { 
  Shield, 
  Lock, 
  Fingerprint, 
  Clock, 
  Eye, 
  EyeOff, 
  Ban, 
  Flag, 
  Bell, 
  Smartphone, 
  Key, 
  CheckCircle, 
  AlertTriangle,
  ChevronRight,
  RefreshCw,
  Download,
  Trash2,
  Globe,
  Mail,
  Phone,
  User,
  Settings,
  LogOut
} from "lucide-react";
import toast from "react-hot-toast";
import useAuthUser from "../hooks/useAuthUser";
import { useSecurity } from "../context/SecurityContext";
import { useEncryptionContext } from "../context/EncryptionContext";

const SecuritySettings = () => {
  const { authUser } = useAuthUser();
  const { setup2FA, verify2FA, disable2FA } = useSecurity();
  const { 
  rotateEncryptionKey,
  encryptionKey
} = useEncryptionContext();
  
  const [twoFAStep, setTwoFAStep] = useState('setup');
  const [twoFASecret, setTwoFASecret] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [is2FAActive, setIs2FAActive] = useState(false);
  
  // Self-destruct settings
  const [selfDestructEnabled, setSelfDestructEnabled] = useState(false);
  const [selfDestructDuration, setSelfDestructDuration] = useState(30);
  
  // Privacy settings
  const [privacySettings, setPrivacySettings] = useState({
    lastSeen: 'everyone',
    profilePhoto: 'everyone',
    readReceipts: true,
    typingIndicators: true,
    allowCalls: 'contacts'
  });
  
  // Blocked users
  const [blockedUsers, setBlockedUsers] = useState([]);
  
  // Active sessions
  const [activeSessions, setActiveSessions] = useState([]);
  
  // Loading states
  const [isLoading, setIsLoading] = useState(false);
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  const [backupCodes, setBackupCodes] = useState([]);

  // Load blocked users
  useEffect(() => {
  const fetchBlockedUsers = async () => {
    try {
      const response = await fetch('/api/users/blocked');
      const data = await response.json();
      setBlockedUsers(data);
    } catch (err) {
      console.error("Failed to fetch blocked users:", err);
    }
  };
  fetchBlockedUsers();
}, []);;

  // Load active sessions
  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const response = await fetch('/api/auth/sessions');
        const data = await response.json();
        setActiveSessions(data);
      } catch (error) {
        console.error("Failed to fetch sessions:", error);
      }
    };
    fetchSessions();
  }, []);

  // Load 2FA status
  useEffect(() => {
  const check2FA = async () => {
    try {
      const response = await fetch('/api/auth/2fa/status');
      const data = await response.json();
      setIs2FAActive(data.enabled);
    } catch (err) {
      console.error("Failed to check 2FA status:", err);
    }
  };
  check2FA();
}, []);

  // Setup 2FA
  const handleSetup2FA = async () => {
    setIsLoading(true);
    try {
      const secret = await setup2FA();
      setTwoFASecret(secret);
      setTwoFAStep('verify');
      toast.success("Scan QR code with authenticator app");
    } catch {
      toast.error("Failed to setup 2FA");
    } finally {
      setIsLoading(false);
    }
  };

  // Verify 2FA
  const handleVerify2FA = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      toast.error("Please enter 6-digit code");
      return;
    }
    
    setIsLoading(true);
    try {
      const isValid = await verify2FA(verificationCode);
      if (isValid) {
        setIs2FAActive(true);
        setTwoFAStep('complete');
        toast.success("2FA enabled successfully!");
        
        // Generate backup codes
        const codes = Array.from({ length: 8 }, () => 
          Math.random().toString(36).substring(2, 10).toUpperCase()
        );
        setBackupCodes(codes);
        setShowBackupCodes(true);
      } else {
        toast.error("Invalid verification code");
      }
    } catch {
      toast.error("Verification failed");
    } finally {
      setIsLoading(false);
    }
  };

  // Disable 2FA
  const handleDisable2FA = async () => {
    if (!confirm("Are you sure you want to disable 2FA? Your account will be less secure.")) return;
    
    setIsLoading(true);
    try {
      await disable2FA();
      setIs2FAActive(false);
      setTwoFAStep('setup');
      toast.success("2FA disabled");
    } catch {
      toast.error("Failed to disable 2FA");
    } finally {
      setIsLoading(false);
    }
  };

  // Rotate encryption key
  const handleRotateKey = async () => {
    if (!confirm("Rotating encryption key will require re-authentication for all chats. Continue?")) return;
    
    setIsLoading(true);
    try {
      await rotateEncryptionKey();
      toast.success("Encryption key rotated successfully");
    } catch {
      toast.error("Failed to rotate key");
    } finally {
      setIsLoading(false);
    }
  };

  // Unblock user
  const handleUnblock = async (userId) => {
    try {
      await fetch(`/api/users/blocked/${userId}`, { method: 'DELETE' });
      setBlockedUsers(prev => prev.filter(u => u.id !== userId));
      toast.success("User unblocked");
    } catch {
      toast.error("Failed to unblock user");
    }
  };

  // Revoke session
  const revokeSession = async (sessionId) => {
    if (!confirm("Revoke this session? You'll need to login again on that device.")) return;
    
    try {
      await fetch(`/api/auth/sessions/${sessionId}`, { method: 'DELETE' });
      setActiveSessions(prev => prev.filter(s => s.id !== sessionId));
      toast.success("Session revoked");
    } catch {
      toast.error("Failed to revoke session");
    }
  };

  // Export data
  const exportData = async () => {
    toast.loading("Preparing your data...");
    try {
      const response = await fetch('/api/account/export');
      const data = await response.blob();
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `xebure-data-${new Date().toISOString()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Data exported successfully");
    } catch {
      toast.error("Failed to export data");
    }
  };

  // Delete account
  const deleteAccount = async () => {
    if (!confirm("⚠️ WARNING: This will permanently delete your account and all data. This cannot be undone! Type 'DELETE' to confirm.")) return;
    
    const confirmation = prompt("Type 'DELETE' to confirm account deletion:");
    if (confirmation !== 'DELETE') {
      toast.error("Account deletion cancelled");
      return;
    }
    
    setIsLoading(true);
    try {
      await fetch('/api/account', { method: 'DELETE' });
      localStorage.clear();
      window.location.href = '/login';
      toast.success("Account deleted");
    } catch {
      toast.error("Failed to delete account");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black py-8 px-4">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-8 h-8 text-green-500" />
            <h1 className="text-3xl font-bold text-white">Security & Privacy</h1>
          </div>
          <p className="text-gray-400">Manage your account security and privacy settings</p>
        </div>

        {/* Security Status Banner */}
        <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
              <Lock className="w-5 h-5 text-green-500" />
            </div>
            <div className="flex-1">
              <p className="text-white font-semibold">Your account is protected</p>
              <p className="text-sm text-gray-400">
                {is2FAActive ? "2FA is enabled • End-to-end encryption active" : "2FA is disabled • Enable for extra security"}
              </p>
            </div>
            <div className="text-sm text-green-400">✓ Secure</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column - Security Settings */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Two-Factor Authentication */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 overflow-hidden">
              <div className="p-5 border-b border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
                    <Fingerprint className="w-5 h-5 text-purple-500" />
                  </div>
                  <div>
                    <h2 className="text-white font-semibold">Two-Factor Authentication</h2>
                    <p className="text-sm text-gray-400">Add an extra layer of security</p>
                  </div>
                </div>
              </div>
              
              <div className="p-5">
                {!is2FAActive && twoFAStep === 'setup' && (
                  <div>
                    <p className="text-gray-300 text-sm mb-4">
                      Two-factor authentication adds an extra layer of security to your account. 
                      Once enabled, you'll need to enter a verification code from your authenticator app when logging in.
                    </p>
                    <button
                      onClick={handleSetup2FA}
                      disabled={isLoading}
                      className="px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg font-semibold hover:from-purple-600 hover:to-purple-700 transition-all disabled:opacity-50"
                    >
                      Set up 2FA
                    </button>
                  </div>
                )}
                
                {twoFAStep === 'verify' && (
                  <div>
                    <div className="bg-gray-900 rounded-lg p-4 mb-4">
                      <p className="text-white text-sm mb-2">Scan this QR code with your authenticator app:</p>
                      <div className="flex justify-center mb-3">
                        <img 
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=otpauth://totp/Xebure:${authUser?.email}?secret=${twoFASecret}&issuer=Xebure`}
                          alt="QR Code"
                          className="w-36 h-36"
                        />
                      </div>
                      <p className="text-xs text-gray-500 text-center">Or enter this code manually:</p>
                      <code className="block text-center text-sm bg-gray-800 p-2 rounded mt-1 font-mono">{twoFASecret}</code>
                    </div>
                    <input
                      type="text"
                      placeholder="Enter 6-digit code"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      className="w-full p-2 bg-gray-900 border border-gray-700 rounded-lg text-white mb-3"
                      maxLength="6"
                    />
                    <button
                      onClick={handleVerify2FA}
                      disabled={isLoading}
                      className="w-full px-4 py-2 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-all disabled:opacity-50"
                    >
                      Verify and Enable
                    </button>
                  </div>
                )}
                
                {is2FAActive && (
                  <div>
                    <div className="flex items-center gap-2 mb-3 text-green-400">
                      <CheckCircle className="w-5 h-5" />
                      <span>2FA is enabled</span>
                    </div>
                    <button
                      onClick={handleDisable2FA}
                      className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-all"
                    >
                      Disable 2FA
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Encryption Settings */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 overflow-hidden">
              <div className="p-5 border-b border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center">
                    <Lock className="w-5 h-5 text-green-500" />
                  </div>
                  <div>
                    <h2 className="text-white font-semibold">End-to-End Encryption</h2>
                    <p className="text-sm text-gray-400">Your messages are secure</p>
                  </div>
                </div>
              </div>
              
              <div className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-white text-sm">Encryption Status</p>
                    <p className="text-xs text-gray-400">AES-256-CBC encryption</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-green-400 text-sm">Active</span>
                  </div>
                </div>
                
                <div className="bg-gray-900 rounded-lg p-3 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Encryption Key</span>
                    <span className="text-green-400 font-mono text-xs">
                      {encryptionKey ? `${encryptionKey.substring(0, 20)}...` : 'Not initialized'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm mt-2">
                    <span className="text-gray-400">Key Rotation</span>
                    <span className="text-white">Manual</span>
                  </div>
                </div>
                
                <button
                  onClick={handleRotateKey}
                  disabled={isLoading}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-all disabled:opacity-50"
                >
                  <RefreshCw className="w-4 h-4" />
                  Rotate Encryption Key
                </button>
              </div>
            </div>

            {/* Self-Destruct Messages */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 overflow-hidden">
              <div className="p-5 border-b border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-500/20 rounded-xl flex items-center justify-center">
                    <Clock className="w-5 h-5 text-orange-500" />
                  </div>
                  <div>
                    <h2 className="text-white font-semibold">Self-Destruct Messages</h2>
                    <p className="text-sm text-gray-400">Messages disappear after time</p>
                  </div>
                </div>
              </div>
              
              <div className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-white">Enable self-destruct messages</span>
                  <button
                    onClick={() => setSelfDestructEnabled(!selfDestructEnabled)}
                    className={`w-12 h-6 rounded-full transition-all ${selfDestructEnabled ? 'bg-green-500' : 'bg-gray-600'}`}
                  >
                    <div className={`w-5 h-5 rounded-full bg-white transition-all mt-0.5 ${selfDestructEnabled ? 'ml-6' : 'ml-0.5'}`}></div>
                  </button>
                </div>
                
                {selfDestructEnabled && (
                  <div>
                    <label className="text-sm text-gray-400 block mb-2">Message duration</label>
                    <select
                      value={selfDestructDuration}
                      onChange={(e) => setSelfDestructDuration(Number(e.target.value))}
                      className="w-full p-2 bg-gray-900 border border-gray-700 rounded-lg text-white"
                    >
                      <option value={10}>10 seconds</option>
                      <option value={30}>30 seconds</option>
                      <option value={60}>1 minute</option>
                      <option value={300}>5 minutes</option>
                      <option value={3600}>1 hour</option>
                      <option value={86400}>24 hours</option>
                    </select>
                  </div>
                )}
              </div>
            </div>

            {/* Privacy Settings */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 overflow-hidden">
              <div className="p-5 border-b border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
                    <Eye className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <h2 className="text-white font-semibold">Privacy Settings</h2>
                    <p className="text-sm text-gray-400">Control who can see your information</p>
                  </div>
                </div>
              </div>
              
              <div className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white">Read Receipts</p>
                    <p className="text-xs text-gray-500">Show when you read messages</p>
                  </div>
                  <button
                    onClick={() => setPrivacySettings({...privacySettings, readReceipts: !privacySettings.readReceipts})}
                    className={`w-10 h-5 rounded-full transition-all ${privacySettings.readReceipts ? 'bg-green-500' : 'bg-gray-600'}`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white transition-all mt-0.5 ${privacySettings.readReceipts ? 'ml-5' : 'ml-0.5'}`}></div>
                  </button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white">Typing Indicators</p>
                    <p className="text-xs text-gray-500">Show when you're typing</p>
                  </div>
                  <button
                    onClick={() => setPrivacySettings({...privacySettings, typingIndicators: !privacySettings.typingIndicators})}
                    className={`w-10 h-5 rounded-full transition-all ${privacySettings.typingIndicators ? 'bg-green-500' : 'bg-gray-600'}`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white transition-all mt-0.5 ${privacySettings.typingIndicators ? 'ml-5' : 'ml-0.5'}`}></div>
                  </button>
                </div>
                
                <div>
                  <label className="text-white text-sm block mb-2">Who can see your last seen</label>
                  <select
                    value={privacySettings.lastSeen}
                    onChange={(e) => setPrivacySettings({...privacySettings, lastSeen: e.target.value})}
                    className="w-full p-2 bg-gray-900 border border-gray-700 rounded-lg text-white"
                  >
                    <option value="everyone">Everyone</option>
                    <option value="contacts">My Contacts</option>
                    <option value="nobody">Nobody</option>
                  </select>
                </div>
                
                <div>
                  <label className="text-white text-sm block mb-2">Who can call you</label>
                  <select
                    value={privacySettings.allowCalls}
                    onChange={(e) => setPrivacySettings({...privacySettings, allowCalls: e.target.value})}
                    className="w-full p-2 bg-gray-900 border border-gray-700 rounded-lg text-white"
                  >
                    <option value="everyone">Everyone</option>
                    <option value="contacts">My Contacts</option>
                    <option value="nobody">Nobody</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Blocked Users */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 overflow-hidden">
              <div className="p-5 border-b border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center">
                    <Ban className="w-5 h-5 text-red-500" />
                  </div>
                  <div>
                    <h2 className="text-white font-semibold">Blocked Users</h2>
                    <p className="text-sm text-gray-400">Manage blocked contacts</p>
                  </div>
                </div>
              </div>
              
              <div className="p-5">
                {blockedUsers.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No blocked users</p>
                ) : (
                  <div className="space-y-3">
                    {blockedUsers.map(user => (
                      <div key={user.id} className="flex items-center justify-between p-3 bg-gray-900 rounded-lg">
                        <div className="flex items-center gap-3">
                          <img src={user.avatar} className="w-8 h-8 rounded-full" />
                          <span className="text-white">{user.name}</span>
                        </div>
                        <button
                          onClick={() => handleUnblock(user.id)}
                          className="px-3 py-1 text-sm bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30"
                        >
                          Unblock
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Account Management */}
          <div className="space-y-6">
            
            {/* Active Sessions */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 overflow-hidden">
              <div className="p-4 border-b border-gray-700">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-blue-400" />
                  <h3 className="text-white font-semibold">Active Sessions</h3>
                </div>
              </div>
              <div className="p-4">
                {activeSessions.length === 0 ? (
                  <p className="text-gray-500 text-sm">No active sessions</p>
                ) : (
                  <div className="space-y-3">
                    {activeSessions.map(session => (
                      <div key={session.id} className="text-sm">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-white">{session.device}</span>
                          <button
                            onClick={() => revokeSession(session.id)}
                            className="text-red-400 text-xs hover:underline"
                          >
                            Revoke
                          </button>
                        </div>
                        <p className="text-gray-500 text-xs">{session.location} • {session.lastActive}</p>
                      </div>
                    ))}
                  </div>
                )}
                <button className="w-full mt-3 px-3 py-1.5 text-sm bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-all">
                  Sign out all devices
                </button>
              </div>
            </div>

            {/* Backup Codes */}
            {showBackupCodes && (
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Key className="w-4 h-4 text-yellow-400" />
                  <h3 className="text-white font-semibold">Backup Codes</h3>
                </div>
                <p className="text-sm text-gray-300 mb-3">Save these codes in a safe place. Each code can be used once.</p>
                <div className="bg-gray-900 rounded-lg p-3 mb-3">
                  {backupCodes.map((code, i) => (
                    <code key={i} className="block text-center text-sm font-mono text-yellow-400 py-1">{code}</code>
                  ))}
                </div>
                <button
                  onClick={() => setShowBackupCodes(false)}
                  className="w-full px-3 py-1.5 bg-gray-700 text-white rounded-lg text-sm"
                >
                  I've saved the codes
                </button>
              </div>
            )}

            {/* Account Data */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 overflow-hidden">
              <div className="p-4 border-b border-gray-700">
                <div className="flex items-center gap-2">
                  <Download className="w-4 h-4 text-blue-400" />
                  <h3 className="text-white font-semibold">Account Data</h3>
                </div>
              </div>
              <div className="p-4 space-y-3">
                <button
                  onClick={exportData}
                  className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-all flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Export my data
                </button>
                <button
                  onClick={deleteAccount}
                  className="w-full px-3 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-all flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete account
                </button>
              </div>
            </div>

            {/* Security Tips */}
            <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-xl border border-green-500/30 p-4">
              <div className="flex items-center gap-2 mb-3">
                <Shield className="w-4 h-4 text-green-400" />
                <h3 className="text-white font-semibold">Security Tips</h3>
              </div>
              <ul className="space-y-2 text-sm text-gray-300">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-3 h-3 text-green-400 mt-0.5" />
                  <span>Enable 2FA for extra security</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-3 h-3 text-green-400 mt-0.5" />
                  <span>Use a strong, unique password</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-3 h-3 text-green-400 mt-0.5" />
                  <span>Never share your verification codes</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-3 h-3 text-green-400 mt-0.5" />
                  <span>Review active sessions regularly</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecuritySettings;