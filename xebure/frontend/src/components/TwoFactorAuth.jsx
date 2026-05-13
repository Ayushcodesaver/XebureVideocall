import { useState } from "react";
import QRCode from "qrcode.react";
import toast from "react-hot-toast";

const TwoFactorAuth = ({ onEnable, onDisable, isEnabled }) => {
  const [step, setStep] = useState('setup');
  const [secret, setSecret] = useState('');
  const [verificationCode, setVerificationCode] = useState('');

  const handleSetup = async () => {
    const newSecret = await onEnable();
    setSecret(newSecret);
    setStep('verify');
  };

  const handleVerify = async () => {
    const isValid = await onEnable(verificationCode);
    if (isValid) {
      toast.success("2FA enabled successfully!");
      setStep('complete');
    } else {
      toast.error("Invalid verification code");
    }
  };

  const handleDisable = async () => {
    await onDisable();
    toast.success("2FA disabled");
    setStep('setup');
  };

  if (isEnabled) {
    return (
      <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-white font-semibold">🔐 Two-Factor Authentication</h3>
            <p className="text-white/60 text-sm">Your account is protected with 2FA</p>
          </div>
          <button
            onClick={handleDisable}
            className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-all"
          >
            Disable 2FA
          </button>
        </div>
      </div>
    );
  }

  if (step === 'setup') {
    return (
      <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
        <h3 className="text-white font-semibold mb-2">🔐 Enable Two-Factor Authentication</h3>
        <p className="text-white/60 text-sm mb-4">Add an extra layer of security to your account</p>
        <button
          onClick={handleSetup}
          className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-semibold"
        >
          Set up 2FA
        </button>
      </div>
    );
  }

  if (step === 'verify') {
    return (
      <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
        <h3 className="text-white font-semibold mb-4">Scan QR Code</h3>
        <div className="flex justify-center mb-4">
          <QRCode value={secret} size={150} />
        </div>
        <p className="text-white/60 text-sm mb-2">Or enter this code manually:</p>
        <code className="block bg-gray-900 p-2 rounded text-sm mb-4">{secret}</code>
        <input
          type="text"
          placeholder="Enter 6-digit code"
          value={verificationCode}
          onChange={(e) => setVerificationCode(e.target.value)}
          className="w-full p-2 bg-gray-900 border border-gray-700 rounded-lg text-white mb-3"
        />
        <button
          onClick={handleVerify}
          className="w-full px-4 py-2 bg-green-500 text-white rounded-lg font-semibold"
        >
          Verify and Enable
        </button>
      </div>
    );
  }

  return (
    <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 bg-green-500 rounded-full animate-pulse"></div>
        <span className="text-green-400">2FA Enabled ✓</span>
      </div>
    </div>
  );
};

export default TwoFactorAuth;