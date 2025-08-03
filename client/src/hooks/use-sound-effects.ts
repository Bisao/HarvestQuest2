
import { useCallback, useRef } from 'react';

interface SoundEffects {
  playButtonClick: () => void;
  playSuccess: () => void;
  playError: () => void;
  playCollect: () => void;
  playCraft: () => void;
}

export const useSoundEffects = (): SoundEffects => {
  const audioContextRef = useRef<AudioContext | null>(null);

  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioContextRef.current;
  }, []);

  const createBeep = useCallback((frequency: number, duration: number, volume: number = 0.1) => {
    const audioContext = getAudioContext();
    
    if (audioContext.state === 'suspended') {
      audioContext.resume();
    }

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(volume, audioContext.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration);
  }, [getAudioContext]);

  const createMultiToneBeep = useCallback((frequencies: number[], duration: number, volume: number = 0.05) => {
    frequencies.forEach((freq, index) => {
      setTimeout(() => {
        createBeep(freq, duration / frequencies.length, volume);
      }, index * (duration * 1000 / frequencies.length));
    });
  }, [createBeep]);

  const playButtonClick = useCallback(() => {
    createBeep(800, 0.1, 0.08);
  }, [createBeep]);

  const playSuccess = useCallback(() => {
    createMultiToneBeep([523, 659, 784], 0.4, 0.06);
  }, [createMultiToneBeep]);

  const playError = useCallback(() => {
    createMultiToneBeep([330, 277, 220], 0.3, 0.08);
  }, [createMultiToneBeep]);

  const playCollect = useCallback(() => {
    createMultiToneBeep([440, 554, 659], 0.3, 0.06);
  }, [createMultiToneBeep]);

  const playCraft = useCallback(() => {
    createMultiToneBeep([392, 493, 587, 698], 0.5, 0.05);
  }, [createMultiToneBeep]);

  return {
    playButtonClick,
    playSuccess,
    playError,
    playCollect,
    playCraft
  };
};
