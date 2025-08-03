
import { useCallback, useRef, useEffect, useState } from 'react';

interface BackgroundMusic {
  isPlaying: boolean;
  volume: number;
  setVolume: (volume: number) => void;
  toggleMusic: () => void;
  playMusic: () => void;
  stopMusic: () => void;
}

export const useBackgroundMusic = (): BackgroundMusic => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolumeState] = useState(0.3);
  const oscillatorsRef = useRef<OscillatorNode[]>([]);

  const getAudioContext = useCallback(() => {
    try {
      if (!audioContextRef.current) {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContextClass) {
          console.warn('AudioContext not supported');
          return null;
        }
        audioContextRef.current = new AudioContextClass();
      }
      return audioContextRef.current;
    } catch (error) {
      console.warn('Failed to create AudioContext:', error);
      return null;
    }
  }, []);

  const createFantasyMelody = useCallback(() => {
    const audioContext = getAudioContext();
    if (!audioContext) return;

    if (audioContext.state === 'suspended') {
      audioContext.resume().catch(console.warn);
    }

    // Clear existing oscillators
    oscillatorsRef.current.forEach(osc => {
      try {
        osc.stop();
        osc.disconnect();
      } catch (e) {
        // Ignore cleanup errors
      }
    });
    oscillatorsRef.current = [];

    // Create gain node for volume control
    const gainNode = audioContext.createGain();
    gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
    gainNode.connect(audioContext.destination);
    gainNodeRef.current = gainNode;

    // Fantasy melody notes (Zelda-inspired progression)
    const melody = [
      { freq: 349.23, duration: 0.5 }, // F4
      { freq: 392.00, duration: 0.5 }, // G4
      { freq: 440.00, duration: 0.5 }, // A4
      { freq: 523.25, duration: 1.0 }, // C5
      { freq: 440.00, duration: 0.5 }, // A4
      { freq: 392.00, duration: 0.5 }, // G4
      { freq: 349.23, duration: 1.0 }, // F4
      { freq: 293.66, duration: 0.5 }, // D4
      { freq: 329.63, duration: 0.5 }, // E4
      { freq: 349.23, duration: 1.5 }, // F4
    ];

    let currentTime = audioContext.currentTime;
    const playMelody = () => {
      melody.forEach((note, index) => {
        const oscillator = audioContext.createOscillator();
        const noteGain = audioContext.createGain();
        
        oscillator.connect(noteGain);
        noteGain.connect(gainNode);
        
        oscillator.frequency.setValueAtTime(note.freq, currentTime);
        oscillator.type = 'sine';
        
        // Soft attack and release
        noteGain.gain.setValueAtTime(0, currentTime);
        noteGain.gain.linearRampToValueAtTime(0.1, currentTime + 0.1);
        noteGain.gain.linearRampToValueAtTime(0.05, currentTime + note.duration - 0.1);
        noteGain.gain.linearRampToValueAtTime(0, currentTime + note.duration);
        
        oscillator.start(currentTime);
        oscillator.stop(currentTime + note.duration);
        
        oscillatorsRef.current.push(oscillator);
        currentTime += note.duration;
      });

      // Add harmonies
      const harmony = [
        { freq: 261.63, duration: 2.0 }, // C4
        { freq: 293.66, duration: 2.0 }, // D4
        { freq: 220.00, duration: 2.0 }, // A3
        { freq: 246.94, duration: 2.0 }, // B3
      ];

      let harmonyTime = audioContext.currentTime;
      harmony.forEach(note => {
        const oscillator = audioContext.createOscillator();
        const noteGain = audioContext.createGain();
        
        oscillator.connect(noteGain);
        noteGain.connect(gainNode);
        
        oscillator.frequency.setValueAtTime(note.freq, harmonyTime);
        oscillator.type = 'triangle';
        
        noteGain.gain.setValueAtTime(0, harmonyTime);
        noteGain.gain.linearRampToValueAtTime(0.03, harmonyTime + 0.2);
        noteGain.gain.linearRampToValueAtTime(0.02, harmonyTime + note.duration - 0.2);
        noteGain.gain.linearRampToValueAtTime(0, harmonyTime + note.duration);
        
        oscillator.start(harmonyTime);
        oscillator.stop(harmonyTime + note.duration);
        
        oscillatorsRef.current.push(oscillator);
        harmonyTime += note.duration;
      });
    };

    playMelody();

    // Loop the melody
    const loopInterval = setInterval(() => {
      if (isPlaying) {
        playMelody();
      } else {
        clearInterval(loopInterval);
      }
    }, 8000); // Loop every 8 seconds

    return () => {
      clearInterval(loopInterval);
      oscillatorsRef.current.forEach(osc => {
        try {
          osc.stop();
          osc.disconnect();
        } catch (e) {
          // Ignore cleanup errors
        }
      });
      oscillatorsRef.current = [];
    };
  }, [volume, isPlaying, getAudioContext]);

  const playMusic = useCallback(() => {
    setIsPlaying(true);
    createFantasyMelody();
  }, [createFantasyMelody]);

  const stopMusic = useCallback(() => {
    setIsPlaying(false);
    oscillatorsRef.current.forEach(osc => {
      try {
        osc.stop();
        osc.disconnect();
      } catch (e) {
        // Ignore cleanup errors
      }
    });
    oscillatorsRef.current = [];
  }, []);

  const toggleMusic = useCallback(() => {
    if (isPlaying) {
      stopMusic();
    } else {
      playMusic();
    }
  }, [isPlaying, stopMusic, playMusic]);

  const setVolume = useCallback((newVolume: number) => {
    setVolumeState(newVolume);
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.setValueAtTime(newVolume, audioContextRef.current?.currentTime || 0);
    }
  }, []);

  // Auto-start music when component mounts
  useEffect(() => {
    const timer = setTimeout(() => {
      playMusic();
    }, 1000); // Start after 1 second

    return () => {
      clearTimeout(timer);
      stopMusic();
    };
  }, []);

  return {
    isPlaying,
    volume,
    setVolume,
    toggleMusic,
    playMusic,
    stopMusic
  };
};
