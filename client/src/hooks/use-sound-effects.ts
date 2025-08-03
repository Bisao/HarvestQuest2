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
    createBeep(800, 0.1, 0.05);
  }, [createBeep]);

  const playSuccess = useCallback(() => {
    // Success chord: C-E-G
    createBeep(523, 0.2, 0.03); // C5
    setTimeout(() => createBeep(659, 0.2, 0.03), 50); // E5
    setTimeout(() => createBeep(784, 0.3, 0.03), 100); // G5
  }, [createBeep]);

  const playError = useCallback(() => {
    // Error sound: descending tone
    createBeep(400, 0.15, 0.04);
    setTimeout(() => createBeep(300, 0.15, 0.04), 100);
  }, [createBeep]);

  const playCollect = useCallback(() => {
    // Collect sound: ascending chime
    createBeep(600, 0.1, 0.03);
    setTimeout(() => createBeep(800, 0.1, 0.03), 50);
    setTimeout(() => createBeep(1000, 0.15, 0.03), 100);
  }, [createBeep]);

  const playCraft = useCallback(() => {
    // Craft sound: tool-like sequence
    createBeep(440, 0.08, 0.03);
    setTimeout(() => createBeep(550, 0.08, 0.03), 80);
    setTimeout(() => createBeep(660, 0.12, 0.03), 160);
  }, [createBeep]);

  return {
    playButtonClick,
    playSuccess,
    playError,
    playCollect,
    playCraft
  };
};