import { useState } from "react";
import { Lock, Unlock } from "lucide-react";

const EncryptedMessage = ({ message, isEncrypted = true, onDecrypt }) => {
  const [isDecrypted, setIsDecrypted] = useState(false);
  const [decryptedContent, setDecryptedContent] = useState(null);

  const handleDecrypt = async () => {
    const decrypted = await onDecrypt?.();
    setDecryptedContent(decrypted);
    setIsDecrypted(true);
  };

  if (!isEncrypted) {
    return <span>{message}</span>;
  }

  if (isDecrypted && decryptedContent) {
    return <span>{decryptedContent}</span>;
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleDecrypt}
        className="flex items-center gap-1 px-2 py-1 text-xs bg-green-500/20 hover:bg-green-500/30 rounded-full transition-all"
      >
        <Lock className="w-3 h-3" />
        <span>Click to decrypt</span>
      </button>
      <span className="text-white/40">🔒 Encrypted message</span>
    </div>
  );
};

export default EncryptedMessage;