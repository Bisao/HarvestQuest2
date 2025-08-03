
import { useCallback, useRef, useEffect, useState } from 'react';

interface BackgroundMusicSettings {
  volume: number;
  enabled: boolean;
  currentTrackIndex: number;
}

// Fantasy ambient music using Web Audio API
const createFantasyTrack = (audioContext: AudioContext, config: {
  baseFreq: number;
  harmonic: number;
  duration: number;
  fadeIn: number;
  fadeOut: number;
}) => {
  const { baseFreq, harmonic, duration, fadeIn, fadeOut } = config;
  
  // Create oscillators for layered ambient sound
  const osc1 = audioContext.createOscillator();
  const osc2 = audioContext.createOscillator();
  const osc3 = audioContext.createOscillator();
  
  // Create gain nodes for volume control
  const gain1 = audioContext.createGain();
  const gain2 = audioContext.createGain();
  const gain3 = audioContext.createGain();
  const masterGain = audioContext.createGain();
  
  // Configure oscillators for ambient fantasy sound
  osc1.type = 'sine';
  osc1.frequency.value = baseFreq;
  
  osc2.type = 'triangle';
  osc2.frequency.value = baseFreq * harmonic;
  
  osc3.type = 'sine';
  osc3.frequency.value = baseFreq * 0.5;
  
  // Connect audio nodes
  osc1.connect(gain1);
  osc2.connect(gain2);
  osc3.connect(gain3);
  
  gain1.connect(masterGain);
  gain2.connect(masterGain);
  gain3.connect(masterGain);
  
  masterGain.connect(audioContext.destination);
  
  // Set initial volumes (very soft ambient)
  gain1.gain.value = 0.08;
  gain2.gain.value = 0.04;
  gain3.gain.value = 0.06;
  
  const now = audioContext.currentTime;
  
  // Fade in
  masterGain.gain.setValueAtTime(0, now);
  masterGain.gain.linearRampToValueAtTime(0.3, now + fadeIn);
  
  // Add subtle frequency modulation for organic feel
  const lfo = audioContext.createOscillator();
  const lfoGain = audioContext.createGain();
  
  lfo.type = 'sine';
  lfo.frequency.value = 0.1; // Very slow modulation
  lfoGain.gain.value = 2; // Small frequency variation
  
  lfo.connect(lfoGain);
  lfoGain.connect(osc1.frequency);
  
  // Fade out
  masterGain.gain.linearRampToValueAtTime(0, now + duration - fadeOut);
  
  // Start and stop
  osc1.start(now);
  osc2.start(now);
  osc3.start(now);
  lfo.start(now);
  
  osc1.stop(now + duration);
  osc2.stop(now + duration);
  osc3.stop(now + duration);
  lfo.stop(now + duration);
  
  return { osc1, osc2, osc3, lfo, masterGain };
};

export const useBackgroundMusic = () => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const currentTrackRef = useRef<any>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [settings, setSettings] = useState<BackgroundMusicSettings>({
    volume: 0.3,
    enabled: true,
    currentTrackIndex: 0
  });

  // Fantasy ambient track configurations
  const trackConfigs = [
    { baseFreq: 220, harmonic: 1.5, duration: 45, fadeIn: 3, fadeOut: 3 }, // Mystical Forest
    { baseFreq: 174.61, harmonic: 1.618, duration: 40, fadeIn: 4, fadeOut: 2 }, // Ancient Magic
    { baseFreq: 196, harmonic: 1.33, duration: 50, fadeIn: 2, fadeOut: 4 }, // Peaceful Valley
    { baseFreq: 146.83, harmonic: 1.414, duration: 35, fadeIn: 3, fadeOut: 3 }, // Elven Sanctuary
    { baseFreq: 164.81, harmonic: 1.732, duration: 42, fadeIn: 5, fadeOut: 2 }, // Moonlit Glade
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
    const track = createFantasyTrack(audioContext, config);
    
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
    }, (config.duration + 2) * 1000); // Small gap between tracks
    
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
            currentTrackRef.current.osc1.stop();
            currentTrackRef.current.osc2.stop();
            currentTrackRef.current.osc3.stop();
            currentTrackRef.current.lfo.stop();
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

  // Start music when enabled
  useEffect(() => {
    if (settings.enabled && !currentTrackRef.current) {
      // Small delay to allow user interaction (required for audio context)
      const startTimeout = setTimeout(() => {
        playNextTrack();
      }, 1000);
      
      return () => clearTimeout(startTimeout);
    }
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
