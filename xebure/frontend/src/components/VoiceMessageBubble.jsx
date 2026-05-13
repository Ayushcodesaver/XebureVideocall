import { useState } from 'react';

const VoiceMessageBubble = ({ audioUrl }) => {
  const [transcript, setTranscript] = useState('');
  const [isTranscribing, setIsTranscribing] = useState(false);

  const handleTranscribe = async () => {
    setIsTranscribing(true);
    try {
      // For now, show a placeholder message
      // To implement real transcription, you would need a backend service
      // like Google Speech-to-Text, OpenAI Whisper, or AssemblyAI
      setTranscript("Voice message received. Tap to play.");
    } catch (error) {
      console.error("Transcription failed:", error);
      setTranscript("Failed to load audio");
    } finally {
      setIsTranscribing(false);
    }
  };

  return (
    <div className="voice-message-bubble bg-base-200 rounded-xl p-3 max-w-xs">
      <audio src={audioUrl} controls className="w-full rounded-lg" />
      <button 
        onClick={handleTranscribe}
        disabled={isTranscribing}
        className="mt-2 text-xs text-primary hover:text-primary-focus transition-colors w-full text-center py-1 rounded-lg hover:bg-primary/10"
      >
        {isTranscribing ? "Loading..." : "Show Text"}
      </button>
      {transcript && (
        <p className="mt-2 text-sm text-base-content/80 border-t border-base-300 pt-2">
          {transcript}
        </p>
      )}
    </div>
  );
};

export default VoiceMessageBubble;