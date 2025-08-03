
import { useCallback, useRef, useEffect, useState } from 'react';

interface BackgroundMusicSettings {
  volume: number;
  enabled: boolean;
  currentTrackIndex: number;
}

// Medieval fantasy music generator using Web Audio API
const createMedievalTrack = (audioContext: AudioContext, config: {
  baseFreq: number;
  scale: number[];
  duration: number;
  fadeIn: number;
  fadeOut: number;
  tempo: number;
}) => {
  const { baseFreq, scale, duration, fadeIn, fadeOut, tempo } = config;
  
  // Create oscillators for flute-like sound
  const fluteOsc = audioContext.createOscillator();
  const fluteGain = audioContext.createGain();
  const fluteFilter = audioContext.createBiquadFilter();
  
  // Create oscillators for guitar-like sound
  const guitarOsc1 = audioContext.createOscillator();
  const guitarOsc2 = audioContext.createOscillator();
  const guitarGain = audioContext.createGain();
  const guitarFilter = audioContext.createBiquadFilter();
  
  // Master gain
  const masterGain = audioContext.createGain();
  
  // Configure flute sound (higher frequencies, sine wave)
  fluteOsc.type = 'sine';
  fluteOsc.frequency.value = baseFreq * 2;
  fluteFilter.type = 'lowpass';
  fluteFilter.frequency.value = 2000;
  fluteFilter.Q.value = 1;
  
  // Configure guitar sound (lower frequencies, sawtooth wave)
  guitarOsc1.type = 'sawtooth';
  guitarOsc2.type = 'triangle';
  guitarOsc1.frequency.value = baseFreq;
  guitarOsc2.frequency.value = baseFreq * 1.5;
  guitarFilter.type = 'lowpass';
  guitarFilter.frequency.value = 800;
  guitarFilter.Q.value = 2;
  
  // Connect flute chain
  fluteOsc.connect(fluteFilter);
  fluteFilter.connect(fluteGain);
  fluteGain.connect(masterGain);
  
  // Connect guitar chain
  guitarOsc1.connect(guitarFilter);
  guitarOsc2.connect(guitarFilter);
  guitarFilter.connect(guitarGain);
  guitarGain.connect(masterGain);
  
  masterGain.connect(audioContext.destination);
  
  const now = audioContext.currentTime;
  
  // Set initial volumes
  fluteGain.gain.value = 0.15;
  guitarGain.gain.value = 0.25;
  
  // Fade in
  masterGain.gain.setValueAtTime(0, now);
  masterGain.gain.linearRampToValueAtTime(0.6, now + fadeIn);
  
  // Create medieval melody pattern
  const createMelody = (osc: OscillatorNode, baseFreq: number, startTime: number) => {
    const noteLength = 60 / tempo; // Quarter note length
    let currentTime = startTime;
    
    // Simple medieval-style melody pattern
    const melodyPattern = [0, 2, 1, 3, 2, 4, 3, 2, 1, 0];
    
    melodyPattern.forEach((scaleIndex, i) => {
      if (currentTime < startTime + duration - fadeOut) {
        const freq = baseFreq * Math.pow(2, scale[scaleIndex % scale.length] / 12);
        osc.frequency.setValueAtTime(freq, currentTime);
        osc.frequency.linearRampToValueAtTime(freq, currentTime + noteLength * 0.9);
        currentTime += noteLength;
      }
    });
  };
  
  // Create chord progression for guitar
  const createChords = (osc1: OscillatorNode, osc2: OscillatorNode, baseFreq: number, startTime: number) => {
    const chordLength = 60 / tempo * 4; // Whole note length
    let currentTime = startTime;
    
    // Medieval chord progression (i - VI - III - VII)
    const chordProgression = [
      [0, 4], // i chord
      [9, 0], // VI chord  
      [4, 7], // III chord
      [10, 2] // VII chord
    ];
    
    chordProgression.forEach(([root, third], i) => {
      if (currentTime < startTime + duration - fadeOut) {
        const rootFreq = baseFreq * Math.pow(2, root / 12);
        const thirdFreq = baseFreq * Math.pow(2, third / 12);
        
        osc1.frequency.setValueAtTime(rootFreq, currentTime);
        osc2.frequency.setValueAtTime(thirdFreq, currentTime);
        currentTime += chordLength;
      }
    });
  };
  
  // Apply melody and harmony patterns
  createMelody(fluteOsc, baseFreq * 2, now + fadeIn);
  createChords(guitarOsc1, guitarOsc2, baseFreq, now + fadeIn);
  
  // Add subtle vibrato to flute
  const vibrato = audioContext.createOscillator();
  const vibratoGain = audioContext.createGain();
  vibrato.type = 'sine';
  vibrato.frequency.value = 4.5; // 4.5 Hz vibrato
  vibratoGain.gain.value = 8; // Small frequency modulation
  vibrato.connect(vibratoGain);
  vibratoGain.connect(fluteOsc.frequency);
  
  // Fade out
  masterGain.gain.linearRampToValueAtTime(0, now + duration - fadeOut);
  
  // Start all oscillators
  fluteOsc.start(now);
  guitarOsc1.start(now);
  guitarOsc2.start(now);
  vibrato.start(now);
  
  // Stop all oscillators
  fluteOsc.stop(now + duration);
  guitarOsc1.stop(now + duration);
  guitarOsc2.stop(now + duration);
  vibrato.stop(now + duration);
  
  return { 
    fluteOsc, 
    guitarOsc1, 
    guitarOsc2, 
    vibrato, 
    masterGain,
    fluteGain,
    guitarGain
  };
};

export const useBackgroundMusic = () => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const currentTrackRef = useRef<any>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [settings, setSettings] = useState<BackgroundMusicSettings>({
    volume: 0.5,
    enabled: true,
    currentTrackIndex: 0
  });

  // Medieval music configurations with different scales and tempos
  const trackConfigs = [
    { 
      baseFreq: 146.83, // D3
      scale: [0, 2, 3, 5, 7, 8, 10], // Dorian mode
      duration: 50, 
      fadeIn: 4, 
      fadeOut: 3,
      tempo: 70 // Slow, contemplative
    },
    { 
      baseFreq: 196.00, // G3
      scale: [0, 2, 4, 5, 7, 9, 10], // Mixolydian mode
      duration: 45, 
      fadeIn: 3, 
      fadeOut: 4,
      tempo: 80 // Moderate tempo
    },
    { 
      baseFreq: 174.61, // F3
      scale: [0, 1, 3, 5, 7, 8, 10], // Phrygian mode
      duration: 55, 
      fadeIn: 5, 
      fadeOut: 2,
      tempo: 65 // Mystical and slow
    },
    { 
      baseFreq: 164.81, // E3
      scale: [0, 2, 4, 6, 7, 9, 11], // Lydian mode
      duration: 42, 
      fadeIn: 3, 
      fadeOut: 3,
      tempo: 75 // Ethereal feel
    },
    { 
      baseFreq: 220.00, // A3
      scale: [0, 2, 3, 5, 7, 9, 10], // Natural minor
      duration: 48, 
      fadeIn: 4, 
      fadeOut: 4,
      tempo: 68 // Dark and atmospheric
    }
  ];

  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioContextRef.current;
  }, []);

  const playNextTrack = useCallback(() => {
    if (!settings.enabled) return;

    const audioContext = getAudioContext();
    
    if (audioContext.state === 'suspended') {
      audioContext.resume();
    }

    const config = trackConfigs[settings.currentTrackIndex];
    const track = createMedievalTrack(audioContext, config);
    
    // Store reference to current track
    currentTrackRef.current = track;
    
    // Update master volume based on settings
    track.masterGain.gain.value *= settings.volume;
    
    // Schedule next track
    timeoutRef.current = setTimeout(() => {
      setSettings(prev => ({
        ...prev,
        currentTrackIndex: (prev.currentTrackIndex + 1) % trackConfigs.length
      }));
      playNextTrack();
    }, (config.duration + 3) * 1000); // Small gap between tracks
    
  }, [settings.enabled, settings.currentTrackIndex, settings.volume, getAudioContext]);

  const stopMusic = useCallback(() => {
    if (currentTrackRef.current) {
      try {
        // Gradually fade out current track
        const audioContext = getAudioContext();
        const now = audioContext.currentTime;
        currentTrackRef.current.masterGain.gain.linearRampToValueAtTime(0, now + 1);
        
        setTimeout(() => {
          if (currentTrackRef.current) {
            currentTrackRef.current.fluteOsc.stop();
            currentTrackRef.current.guitarOsc1.stop();
            currentTrackRef.current.guitarOsc2.stop();
            currentTrackRef.current.vibrato.stop();
          }
        }, 1000);
      } catch (error) {
        console.log('Music already stopped');
      }
      currentTrackRef.current = null;
    }
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, [getAudioContext]);

  const setVolume = useCallback((volume: number) => {
    setSettings(prev => ({ ...prev, volume: Math.max(0, Math.min(1, volume)) }));
    
    // Update current track volume if playing
    if (currentTrackRef.current && currentTrackRef.current.masterGain) {
      currentTrackRef.current.masterGain.gain.value = volume * 0.6;
    }
  }, []);

  const toggleMusic = useCallback(() => {
    setSettings(prev => {
      const newEnabled = !prev.enabled;
      if (!newEnabled) {
        stopMusic();
      }
      return { ...prev, enabled: newEnabled };
    });
  }, [stopMusic]);

  // Initialize music on user interaction
  useEffect(() => {
    const handleUserInteraction = () => {
      if (settings.enabled && !currentTrackRef.current) {
        playNextTrack();
      }
      // Remove listeners after first interaction
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('keydown', handleUserInteraction);
      document.removeEventListener('touchstart', handleUserInteraction);
    };

    // Add event listeners for user interaction
    document.addEventListener('click', handleUserInteraction);
    document.addEventListener('keydown', handleUserInteraction);
    document.addEventListener('touchstart', handleUserInteraction);

    // Auto-start if already has interaction
    if (settings.enabled && !currentTrackRef.current) {
      const startTimeout = setTimeout(() => {
        playNextTrack();
      }, 1000);
      
      return () => {
        clearTimeout(startTimeout);
        document.removeEventListener('click', handleUserInteraction);
        document.removeEventListener('keydown', handleUserInteraction);
        document.removeEventListener('touchstart', handleUserInteraction);
      };
    }

    return () => {
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('keydown', handleUserInteraction);
      document.removeEventListener('touchstart', handleUserInteraction);
    };
  }, [settings.enabled, playNextTrack]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopMusic();
    };
  }, [stopMusic]);

  // Handle page visibility change to pause/resume music
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && settings.enabled) {
        stopMusic();
      } else if (!document.hidden && settings.enabled && !currentTrackRef.current) {
        setTimeout(playNextTrack, 500);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [settings.enabled, playNextTrack, stopMusic]);

  return {
    isPlaying: settings.enabled && !!currentTrackRef.current,
    volume: settings.volume,
    setVolume,
    toggleMusic,
    enabled: settings.enabled
  };
};
