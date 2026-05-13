// Check if browser supports speech recognition
export const isSpeechRecognitionSupported = () => {
  return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
};

// Speech to text function
export const speechToText = (options = {}) => {
  return new Promise((resolve, reject) => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      reject(new Error('Speech recognition is not supported in this browser'));
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = options.language || 'en-US';
    recognition.interimResults = options.interimResults !== false;
    recognition.continuous = options.continuous || false;

    let finalTranscript = '';

    recognition.onresult = (event) => {
      let interimTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
        } else {
          interimTranscript += transcript;
        }
      }
      if (options.onInterimResult) {
        options.onInterimResult(interimTranscript || finalTranscript);
      }
    };

    recognition.onerror = (event) => {
      reject(new Error(`Speech recognition error: ${event.error}`));
    };

    recognition.onend = () => {
      if (finalTranscript) {
        resolve(finalTranscript.trim());
      } else {
        reject(new Error('No speech detected'));
      }
    };

    recognition.start();
  });
};

// Transcribe audio blob
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
    return 'Transcription not available';
  }
};