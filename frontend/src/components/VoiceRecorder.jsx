import { useState, useRef, useEffect } from "react";
import { Mic, Square, Play, Pause, Trash2, Send, X, FileText } from "lucide-react";
import toast from "react-hot-toast";
import WaveformVisualizer from "./WaveformVisualizer";
import { speechToText, isSpeechRecognitionSupported } from '../utils';

const VoiceRecorder = ({ onSend, onCancel }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [audioBlob, setAudioBlob] = useState(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  
  const mediaRecorder = useRef(null);
  const audioChunks = useRef([]);
  const audioRef = useRef(null);
  const timerRef = useRef(null);

  // Format time (seconds → MM:SS)
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Transcribe voice to text
  const transcribeToText = async () => {
    if (!isSpeechRecognitionSupported()) {
      toast.error("Speech recognition not supported in this browser");
      return;
    }
    
    setIsTranscribing(true);
    try {
      toast.loading("Listening...", { id: "transcribe" });
      const text = await speechToText({ language: 'en-US' });
      toast.success("Transcribed!", { id: "transcribe" });
      console.log("Transcribed text:", text);
      // You can add the transcribed text to the message input
      if (text && onSend) {
        // Optionally send as text message
        toast.success(`Text: ${text.substring(0, 50)}...`);
      }
    } catch (error) {
      toast.error(error.message, { id: "transcribe" });
    } finally {
      setIsTranscribing(false);
    }
  };

  // Start recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      audioChunks.current = [];

      mediaRecorder.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.current.push(event.data);
        }
      };

      mediaRecorder.current.onstop = () => {
        const blob = new Blob(audioChunks.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setAudioURL(url);
        setAudioBlob(blob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.current.start();
      setIsRecording(true);
      
      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
      
      toast.success("Recording... Click stop when done");
    } catch (error) {
      console.error("Microphone error:", error);
      toast.error("Unable to access microphone. Please check permissions.");
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorder.current && isRecording) {
      mediaRecorder.current.stop();
      setIsRecording(false);
      clearInterval(timerRef.current);
    }
  };

  // Play/Pause audio
  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  // Reset recording (clear all)
  const resetRecording = () => {
    setAudioURL(null);
    setAudioBlob(null);
    setRecordingDuration(0);
    setIsPlaying(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  // Cancel recording and close
  const handleCancel = () => {
    resetRecording();
    // Clean up media recorder if still recording
    if (mediaRecorder.current && isRecording) {
      mediaRecorder.current.stop();
      setIsRecording(false);
      clearInterval(timerRef.current);
    }
    // Call the onCancel callback
    if (onCancel) {
      onCancel();
    }
  };

  // Send voice message
  const sendVoiceMessage = () => {
    if (audioBlob) {
      onSend(audioBlob);
      resetRecording();
      toast.success("Voice message sent!");
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioURL) URL.revokeObjectURL(audioURL);
      // Stop recording if component unmounts while recording
      if (mediaRecorder.current && isRecording) {
        mediaRecorder.current.stop();
      }
    };
  }, [audioURL, isRecording]);

  return (
    <div className="bg-base-200 rounded-xl p-3 mb-2 animate-slideUp">
      {!audioURL ? (
        // Recording UI - No audio yet
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isRecording ? (
              // Recording in progress
              <>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-mono text-red-500 font-semibold">
                    {formatTime(recordingDuration)}
                  </span>
                </div>
                <button
                  onClick={stopRecording}
                  className="p-2 rounded-full bg-red-500 hover:bg-red-600 text-white transition-all transform hover:scale-105"
                  title="Stop recording"
                >
                  <Square className="w-5 h-5" />
                </button>
                <span className="text-xs text-base-content/50">Recording...</span>
              </>
            ) : (
              // Ready to record
              <>
                <button
                  onClick={startRecording}
                  className="p-2 rounded-full bg-primary hover:bg-primary-focus text-primary-content transition-all transform hover:scale-105"
                  title="Start recording"
                >
                  <Mic className="w-5 h-5" />
                </button>
                <span className="text-sm text-base-content/60">Click to record voice message</span>
              </>
            )}
          </div>
          
          {/* Cancel button - always visible when not recording or no audio */}
          {!isRecording && onCancel && (
            <button
              onClick={handleCancel}
              className="p-2 rounded-full hover:bg-red-500/10 text-red-500 transition-all transform hover:scale-105"
              title="Cancel"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      ) : (
        // Preview & Send UI - Audio recorded with Waveform
        <div className="flex flex-col gap-2">
          {/* Waveform Visualization */}
          <div className="w-full">
            <WaveformVisualizer 
              audioUrl={audioURL}
              isPlaying={isPlaying}
              onPlay={setIsPlaying}
            />
          </div>
          
          {/* Hidden audio element for fallback */}
          <audio 
            ref={audioRef} 
            src={audioURL} 
            onEnded={() => setIsPlaying(false)} 
            onPlay={() => setIsPlaying(true)}
            className="hidden"
          />
          
          {/* Controls */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              {/* Play/Pause Button */}
              <button
                onClick={togglePlay}
                className="p-2 rounded-full bg-primary hover:bg-primary-focus text-primary-content transition-all transform hover:scale-105"
                title={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              </button>
              
              {/* Duration */}
              <span className="text-xs text-base-content/60 font-mono">
                {formatTime(recordingDuration)}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Transcribe Button */}
              <button
                onClick={transcribeToText}
                disabled={isTranscribing}
                className={`p-2 rounded-full transition-all transform hover:scale-105 ${
                  isTranscribing 
                    ? "bg-gray-500 text-white cursor-not-allowed" 
                    : "bg-purple-500 hover:bg-purple-600 text-white"
                }`}
                title="Transcribe voice to text"
              >
                <FileText className="w-5 h-5" />
              </button>
              
              {/* Delete/Reset Button */}
              <button
                onClick={resetRecording}
                className="p-2 rounded-full hover:bg-red-500/10 text-red-500 transition-all transform hover:scale-105"
                title="Delete recording"
              >
                <Trash2 className="w-5 h-5" />
              </button>
              
              {/* Send Button */}
              <button
                onClick={sendVoiceMessage}
                className="p-2 rounded-full bg-green-500 hover:bg-green-600 text-white transition-all transform hover:scale-105"
                title="Send voice message"
              >
                <Send className="w-5 h-5" />
              </button>
              
              {/* Cancel Button */}
              {onCancel && (
                <button
                  onClick={handleCancel}
                  className="p-2 rounded-full hover:bg-red-500/10 text-red-500 transition-all transform hover:scale-105"
                  title="Cancel"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slideUp {
          animation: slideUp 0.2s ease-out;
        }
      `}</style>
    </div>
  );
};

export default VoiceRecorder;