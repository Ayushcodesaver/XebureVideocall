import { useEffect, useRef } from 'react';
import WaveSurfer from 'wavesurfer.js';

const WaveformVisualizer = ({ audioUrl, isPlaying, onPlay }) => {
  const waveformRef = useRef(null);
  const wavesurfer = useRef(null);

  useEffect(() => {
    if (audioUrl && waveformRef.current) {
      wavesurfer.current = WaveSurfer.create({
        container: waveformRef.current,
        waveColor: '#00A19B',
        progressColor: '#00837e',
        cursorColor: '#E4DDD3',
        barWidth: 2,
        barRadius: 3,
        height: 40,
        responsive: true,
      });
      
      wavesurfer.current.load(audioUrl);
      
      wavesurfer.current.on('finish', () => {
        if (onPlay) onPlay(false);
      });
    }
    
    return () => {
      if (wavesurfer.current) {
        wavesurfer.current.destroy();
      }
    };
  }, [audioUrl]);

  useEffect(() => {
    if (wavesurfer.current) {
      if (isPlaying) {
        wavesurfer.current.play();
      } else {
        wavesurfer.current.pause();
      }
    }
  }, [isPlaying]);

  return <div ref={waveformRef} className="w-full" />;
};

export default WaveformVisualizer;