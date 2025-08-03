
import { useCallback, useRef, useEffect, useState } from 'react';

interface BackgroundMusicSettings {
  volume: number;
  enabled: boolean;
  currentTrackIndex: number;
}

// Advanced Zelda-style music generator with multiple instruments
const createZeldaStyleTrack = (audioContext: AudioContext, config: {
  baseFreq: number;
  scale: number[];
  duration: number;
  fadeIn: number;
  fadeOut: number;
  tempo: number;
  mood: string;
}) => {
  const { baseFreq, scale, duration, fadeIn, fadeOut, tempo, mood } = config;
  
  // Create multiple oscillators for rich instrumentation
  const melodyOsc = audioContext.createOscillator();
  const harmonyOsc1 = audioContext.createOscillator();
  const harmonyOsc2 = audioContext.createOscillator();
  const bassOsc = audioContext.createOscillator();
  const arpeggioOsc = audioContext.createOscillator();
  
  // Create gain nodes for volume control
  const melodyGain = audioContext.createGain();
  const harmonyGain1 = audioContext.createGain();
  const harmonyGain2 = audioContext.createGain();
  const bassGain = audioContext.createGain();
  const arpeggioGain = audioContext.createGain();
  const masterGain = audioContext.createGain();
  
  // Create filters for timbre shaping
  const melodyFilter = audioContext.createBiquadFilter();
  const harmonyFilter = audioContext.createBiquadFilter();
  const bassFilter = audioContext.createBiquadFilter();
  const arpeggioFilter = audioContext.createBiquadFilter();
  
  // Configure melody (flute-like lead)
  melodyOsc.type = 'sine';
  melodyFilter.type = 'lowpass';
  melodyFilter.frequency.value = 2500;
  melodyFilter.Q.value = 1.5;
  melodyGain.gain.value = 0.25;
  
  // Configure harmony (string-like pads)
  harmonyOsc1.type = 'sawtooth';
  harmonyOsc2.type = 'triangle';
  harmonyFilter.type = 'lowpass';
  harmonyFilter.frequency.value = 1200;
  harmonyFilter.Q.value = 2;
  harmonyGain1.gain.value = 0.15;
  harmonyGain2.gain.value = 0.12;
  
  // Configure bass (deep foundation)
  bassOsc.type = 'triangle';
  bassFilter.type = 'lowpass';
  bassFilter.frequency.value = 400;
  bassFilter.Q.value = 3;
  bassGain.gain.value = 0.2;
  
  // Configure arpeggio (harp-like)
  arpeggioOsc.type = 'sine';
  arpeggioFilter.type = 'highpass';
  arpeggioFilter.frequency.value = 200;
  arpeggioFilter.Q.value = 1;
  arpeggioGain.gain.value = 0.18;
  
  // Connect audio graph
  melodyOsc.connect(melodyFilter);
  melodyFilter.connect(melodyGain);
  melodyGain.connect(masterGain);
  
  harmonyOsc1.connect(harmonyFilter);
  harmonyOsc2.connect(harmonyFilter);
  harmonyFilter.connect(harmonyGain1);
  harmonyFilter.connect(harmonyGain2);
  harmonyGain1.connect(masterGain);
  harmonyGain2.connect(masterGain);
  
  bassOsc.connect(bassFilter);
  bassFilter.connect(bassGain);
  bassGain.connect(masterGain);
  
  arpeggioOsc.connect(arpeggioFilter);
  arpeggioFilter.connect(arpeggioGain);
  arpeggioGain.connect(masterGain);
  
  masterGain.connect(audioContext.destination);
  
  const now = audioContext.currentTime;
  
  // Master fade in/out
  masterGain.gain.setValueAtTime(0, now);
  masterGain.gain.linearRampToValueAtTime(0.7, now + fadeIn);
  masterGain.gain.linearRampToValueAtTime(0, now + duration - fadeOut);
  
  // Complex melody patterns based on mood
  const createZeldaMelody = (osc: OscillatorNode, baseFreq: number, startTime: number) => {
    const noteLength = 60 / tempo / 2; // Eighth note length
    let currentTime = startTime;
    
    let melodyPattern: number[];
    
    switch (mood) {
      case 'heroic':
        melodyPattern = [0, 4, 7, 9, 7, 4, 2, 0, 2, 4, 7, 9, 11, 9, 7, 4, 0, 2, 4, 7, 4, 2, 0, -3];
        break;
      case 'mystical':
        melodyPattern = [0, 2, 5, 7, 9, 7, 5, 3, 2, 0, 3, 5, 8, 10, 8, 5, 3, 0, 2, 5, 7, 5, 2, 0];
        break;
      case 'adventure':
        melodyPattern = [0, 3, 5, 7, 5, 3, 1, 0, 1, 3, 5, 8, 7, 5, 3, 1, 0, 2, 5, 7, 8, 7, 5, 2];
        break;
      case 'peaceful':
        melodyPattern = [0, 2, 4, 5, 4, 2, 0, -1, 0, 2, 4, 7, 5, 4, 2, 0, 2, 4, 5, 7, 5, 4, 2, 0];
        break;
      case 'dark':
        melodyPattern = [0, 1, 3, 4, 6, 4, 3, 1, 0, 3, 6, 8, 6, 4, 1, 0, 1, 4, 6, 8, 9, 6, 3, 0];
        break;
      default:
        melodyPattern = [0, 4, 7, 9, 7, 4, 2, 0];
    }
    
    melodyPattern.forEach((semitone, i) => {
      if (currentTime < startTime + duration - fadeOut) {
        const freq = baseFreq * Math.pow(2, semitone / 12);
        osc.frequency.setValueAtTime(freq, currentTime);
        
        // Add expression with slight frequency bends
        if (i % 4 === 0) {
          osc.frequency.linearRampToValueAtTime(freq * 1.02, currentTime + noteLength * 0.3);
          osc.frequency.linearRampToValueAtTime(freq, currentTime + noteLength * 0.7);
        }
        
        currentTime += noteLength;
      }
    });
  };
  
  // Create rich harmonic progressions
  const createHarmony = (osc1: OscillatorNode, osc2: OscillatorNode, baseFreq: number, startTime: number) => {
    const chordLength = 60 / tempo * 2; // Half note length
    let currentTime = startTime;
    
    let progression: Array<[number, number]>;
    
    switch (mood) {
      case 'heroic':
        progression = [[0, 4], [5, 9], [7, 11], [4, 8], [2, 5], [0, 4]]; // I-vi-V-IV-ii-I
        break;
      case 'mystical':
        progression = [[0, 3], [7, 10], [2, 5], [9, 0], [5, 8], [0, 3]]; // i-v-ii-vi-iv-i
        break;
      case 'adventure':
        progression = [[0, 4], [7, 11], [2, 6], [5, 9], [0, 4]]; // I-V-ii-vi-I
        break;
      case 'peaceful':
        progression = [[0, 4], [2, 5], [7, 11], [4, 8], [0, 4]]; // I-ii-V-IV-I
        break;
      case 'dark':
        progression = [[0, 3], [6, 9], [1, 4], [8, 11], [0, 3]]; // i-vi-ii-VII-i
        break;
      default:
        progression = [[0, 4], [5, 9], [7, 11], [0, 4]];
    }
    
    progression.forEach(([root, third]) => {
      if (currentTime < startTime + duration - fadeOut) {
        const rootFreq = baseFreq * Math.pow(2, root / 12);
        const thirdFreq = baseFreq * Math.pow(2, third / 12);
        
        osc1.frequency.setValueAtTime(rootFreq, currentTime);
        osc2.frequency.setValueAtTime(thirdFreq, currentTime);
        
        currentTime += chordLength;
      }
    });
  };
  
  // Create bass line
  const createBassLine = (osc: OscillatorNode, baseFreq: number, startTime: number) => {
    const bassNoteLength = 60 / tempo; // Quarter note length
    let currentTime = startTime;
    
    let bassPattern: number[];
    
    switch (mood) {
      case 'heroic':
        bassPattern = [0, 0, 5, 5, 7, 7, 4, 4, 2, 2, 0, 0];
        break;
      case 'mystical':
        bassPattern = [0, 7, 2, 9, 5, 0, 7, 2];
        break;
      case 'adventure':
        bassPattern = [0, 5, 7, 2, 5, 0, 7, 4];
        break;
      case 'peaceful':
        bassPattern = [0, 2, 7, 4, 0, 2, 7, 0];
        break;
      case 'dark':
        bassPattern = [0, 6, 1, 8, 0, 6, 1, 0];
        break;
      default:
        bassPattern = [0, 5, 7, 0];
    }
    
    bassPattern.forEach((semitone) => {
      if (currentTime < startTime + duration - fadeOut) {
        const freq = (baseFreq / 2) * Math.pow(2, semitone / 12); // One octave lower
        osc.frequency.setValueAtTime(freq, currentTime);
        currentTime += bassNoteLength;
      }
    });
  };
  
  // Create arpeggio patterns
  const createArpeggio = (osc: OscillatorNode, baseFreq: number, startTime: number) => {
    const arpeggioNoteLength = 60 / tempo / 4; // Sixteenth note length
    let currentTime = startTime;
    
    let arpeggioPattern: number[];
    
    switch (mood) {
      case 'heroic':
        arpeggioPattern = [0, 4, 7, 12, 7, 4, 0, 7, 4, 0, 7, 12, 16, 12, 7, 4];
        break;
      case 'mystical':
        arpeggioPattern = [0, 3, 7, 10, 14, 10, 7, 3, 0, 7, 10, 14, 17, 14, 10, 7];
        break;
      case 'adventure':
        arpeggioPattern = [0, 4, 7, 11, 14, 11, 7, 4, 0, 7, 11, 14, 18, 14, 11, 7];
        break;
      case 'peaceful':
        arpeggioPattern = [0, 2, 4, 7, 9, 7, 4, 2, 0, 4, 7, 9, 12, 9, 7, 4];
        break;
      case 'dark':
        arpeggioPattern = [0, 3, 6, 9, 12, 9, 6, 3, 0, 6, 9, 12, 15, 12, 9, 6];
        break;
      default:
        arpeggioPattern = [0, 4, 7, 12, 7, 4];
    }
    
    arpeggioPattern.forEach((semitone) => {
      if (currentTime < startTime + duration - fadeOut) {
        const freq = baseFreq * Math.pow(2, semitone / 12);
        osc.frequency.setValueAtTime(freq, currentTime);
        currentTime += arpeggioNoteLength;
      }
    });
  };
  
  // Add vibrato to melody
  const vibrato = audioContext.createOscillator();
  const vibratoGain = audioContext.createGain();
  vibrato.type = 'sine';
  vibrato.frequency.value = 5.5; // 5.5 Hz vibrato
  vibratoGain.gain.value = 12; // Frequency modulation depth
  vibrato.connect(vibratoGain);
  vibratoGain.connect(melodyOsc.frequency);
  
  // Create all musical parts
  createZeldaMelody(melodyOsc, baseFreq * 2, now + fadeIn);
  createHarmony(harmonyOsc1, harmonyOsc2, baseFreq, now + fadeIn);
  createBassLine(bassOsc, baseFreq, now + fadeIn);
  createArpeggio(arpeggioOsc, baseFreq * 2, now + fadeIn + 4); // Start arpeggio later
  
  // Start all oscillators
  melodyOsc.start(now);
  harmonyOsc1.start(now);
  harmonyOsc2.start(now);
  bassOsc.start(now);
  arpeggioOsc.start(now);
  vibrato.start(now);
  
  // Stop all oscillators
  melodyOsc.stop(now + duration);
  harmonyOsc1.stop(now + duration);
  harmonyOsc2.stop(now + duration);
  bassOsc.stop(now + duration);
  arpeggioOsc.stop(now + duration);
  vibrato.stop(now + duration);
  
  return {
    melodyOsc,
    harmonyOsc1,
    harmonyOsc2,
    bassOsc,
    arpeggioOsc,
    vibrato,
    masterGain,
    melodyGain,
    harmonyGain1,
    bassGain,
    arpeggioGain
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

  // Zelda-style track configurations with different moods and scales
  const trackConfigs = [
    { 
      baseFreq: 174.61, // F3
      scale: [0, 2, 4, 5, 7, 9, 11], // Major scale
      duration: 60, 
      fadeIn: 5, 
      fadeOut: 4,
      tempo: 85,
      mood: 'heroic'
    },
    { 
      baseFreq: 146.83, // D3
      scale: [0, 2, 3, 5, 7, 8, 10], // Natural minor
      duration: 75, 
      fadeIn: 6, 
      fadeOut: 5,
      tempo: 70,
      mood: 'mystical'
    },
    { 
      baseFreq: 196.00, // G3
      scale: [0, 2, 4, 6, 7, 9, 11], // Lydian mode
      duration: 55, 
      fadeIn: 4, 
      fadeOut: 3,
      tempo: 95,
      mood: 'adventure'
    },
    { 
      baseFreq: 164.81, // E3
      scale: [0, 2, 4, 5, 7, 9, 11], // Major scale
      duration: 65, 
      fadeIn: 7, 
      fadeOut: 6,
      tempo: 60,
      mood: 'peaceful'
    },
    { 
      baseFreq: 130.81, // C3
      scale: [0, 1, 3, 5, 6, 8, 10], // Phrygian mode
      duration: 70, 
      fadeIn: 5, 
      fadeOut: 4,
      tempo: 75,
      mood: 'dark'
    },
    { 
      baseFreq: 220.00, // A3
      scale: [0, 2, 4, 6, 7, 9, 11], // Lydian mode
      duration: 50, 
      fadeIn: 3, 
      fadeOut: 3,
      tempo: 110,
      mood: 'heroic'
    },
    { 
      baseFreq: 207.65, // G#3
      scale: [0, 2, 3, 5, 7, 8, 11], // Harmonic minor
      duration: 80, 
      fadeIn: 6, 
      fadeOut: 5,
      tempo: 65,
      mood: 'mystical'
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
    const track = createZeldaStyleTrack(audioContext, config);
    
    // Store reference to current track
    currentTrackRef.current = track;
    
    // Update master volume based on settings
    track.masterGain.gain.value *= settings.volume;
    
    // Schedule next track with a longer gap for more elaborate music
    timeoutRef.current = setTimeout(() => {
      setSettings(prev => ({
        ...prev,
        currentTrackIndex: (prev.currentTrackIndex + 1) % trackConfigs.length
      }));
      playNextTrack();
    }, (config.duration + 8) * 1000); // Longer gap between tracks
    
  }, [settings.enabled, settings.currentTrackIndex, settings.volume, getAudioContext]);

  const stopMusic = useCallback(() => {
    if (currentTrackRef.current) {
      try {
        // Gradually fade out current track
        const audioContext = getAudioContext();
        const now = audioContext.currentTime;
        currentTrackRef.current.masterGain.gain.linearRampToValueAtTime(0, now + 2);
        
        setTimeout(() => {
          if (currentTrackRef.current) {
            currentTrackRef.current.melodyOsc.stop();
            currentTrackRef.current.harmonyOsc1.stop();
            currentTrackRef.current.harmonyOsc2.stop();
            currentTrackRef.current.bassOsc.stop();
            currentTrackRef.current.arpeggioOsc.stop();
            currentTrackRef.current.vibrato.stop();
          }
        }, 2000);
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
      currentTrackRef.current.masterGain.gain.value = volume * 0.7;
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
      }, 1500);
      
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
        setTimeout(playNextTrack, 1000);
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
