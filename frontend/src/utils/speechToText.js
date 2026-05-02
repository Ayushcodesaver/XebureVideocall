/**
 * Speech to Text Utility for Xebure
 * Converts voice messages to text using Web Speech API
 */

// Check if browser supports speech recognition
export const isSpeechRecognitionSupported = () => {
  return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
};

// Get the Speech Recognition API
const getSpeechRecognition = () => {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  return SpeechRecognition ? new SpeechRecognition() : null;
};

/**
 * Convert speech to text using browser's Web Speech API
 * @param {Object} options - Configuration options
 * @param {string} options.language - Language code (default: 'en-US')
 * @param {boolean} options.interimResults - Show interim results (default: true)
 * @returns {Promise<string>} - Transcribed text
 */
export const speechToText = (options = {}) => {
  return new Promise((resolve, reject) => {
    const recognition = getSpeechRecognition();
    
    if (!recognition) {
      reject(new Error('Speech recognition is not supported in this browser'));
      return;
    }

    // Configure recognition
    recognition.lang = options.language || 'en-US';
    recognition.interimResults = options.interimResults !== false;
    recognition.maxAlternatives = 1;
    recognition.continuous = options.continuous || false;

    let finalTranscript = '';
    let interimTranscript = '';

    // Handle results
    recognition.onresult = (event) => {
      interimTranscript = '';
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
        } else {
          interimTranscript += transcript;
        }
      }
      
      // You can use a callback to show interim results
      if (options.onInterimResult) {
        options.onInterimResult(interimTranscript || finalTranscript);
      }
    };

    // Handle errors
    recognition.onerror = (event) => {
      let errorMessage = 'Speech recognition failed';
      
      switch (event.error) {
        case 'no-speech':
          errorMessage = 'No speech detected. Please try again.';
          break;
        case 'audio-capture':
          errorMessage = 'No microphone found. Please check your microphone.';
          break;
        case 'not-allowed':
          errorMessage = 'Microphone access denied. Please allow microphone access.';
          break;
        case 'network':
          errorMessage = 'Network error. Please check your connection.';
          break;
        default:
          errorMessage = `Error: ${event.error}`;
      }
      
      reject(new Error(errorMessage));
    };

    // Handle end of recognition
    recognition.onend = () => {
      if (finalTranscript) {
        resolve(finalTranscript.trim());
      } else if (!options.continuous) {
        reject(new Error('No speech detected'));
      }
    };

    // Start recognition
    recognition.start();

    // Auto-stop after silence (if continuous is false, it stops automatically)
    if (options.continuous && options.autoStop) {
      let lastResultTime = Date.now();
      
      const checkSilence = setInterval(() => {
        if (Date.now() - lastResultTime > (options.silenceTimeout || 2000)) {
          clearInterval(checkSilence);
          recognition.stop();
        }
      }, 500);
      
      recognition.onresult = (event) => {
        lastResultTime = Date.now();
        // Call the original onresult
        const originalResult = options.onInterimResult;
        if (originalResult) {
          let tempTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            tempTranscript += event.results[i][0].transcript;
          }
          originalResult(tempTranscript);
        }
      };
    }
  });
};

/**
 * Convert audio blob to text using a server API (for production)
 * @param {Blob} audioBlob - The audio blob to transcribe
 * @param {string} apiUrl - The API endpoint URL
 * @returns {Promise<string>} - Transcribed text
 */
export const transcribeAudioBlob = async (audioBlob, apiUrl = '/api/transcribe') => {
  try {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'voice-message.webm');
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error(`Transcription failed: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.text || '';
  } catch (error) {
    console.error('Transcription error:', error);
    throw error;
  }
};

/**
 * Simple voice recorder with auto transcription
 */
export class VoiceRecorderWithTranscription {
  constructor(options = {}) {
    this.mediaRecorder = null;
    this.audioChunks = [];
    this.isRecording = false;
    this.onTranscript = options.onTranscript || (() => {});
    this.onError = options.onError || (() => {});
    this.language = options.language || 'en-US';
  }

  async startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.mediaRecorder = new MediaRecorder(stream);
      this.audioChunks = [];

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
        stream.getTracks().forEach(track => track.stop());
        
        // Auto-transcribe
        try {
          const text = await transcribeAudioBlob(audioBlob);
          this.onTranscript(text);
        } catch (error) {
          this.onError(error);
        }
      };

      this.mediaRecorder.start();
      this.isRecording = true;
    } catch (error) {
      this.onError(error);
      throw error;
    }
  }

  stopRecording() {
    if (this.mediaRecorder && this.isRecording) {
      this.mediaRecorder.stop();
      this.isRecording = false;
    }
  }

  isRecordingActive() {
    return this.isRecording;
  }
}

// Default export
export default {
  speechToText,
  transcribeAudioBlob,
  isSpeechRecognitionSupported,
  VoiceRecorderWithTranscription,
};  