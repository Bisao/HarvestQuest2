
import React from 'react';
import { Button } from './button';
import { Slider } from './slider';
import { Volume2, VolumeX, Music } from 'lucide-react';
import { useBackgroundMusic } from '@/hooks/use-background-music';

export const MusicControl: React.FC = () => {
  const { isPlaying, volume, setVolume, toggleMusic } = useBackgroundMusic();

  return (
    <div className="flex items-center gap-2 p-2 bg-black/20 rounded-lg backdrop-blur-sm border border-white/10">
      <Button
        variant="ghost"
        size="sm"
        onClick={toggleMusic}
        className="h-8 w-8 p-0 text-white/70 hover:text-white"
      >
        {isPlaying ? <Music className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
      </Button>
      
      <div className="flex items-center gap-2 min-w-[100px]">
        <Volume2 className="h-3 w-3 text-white/50" />
        <Slider
          value={[volume]}
          onValueChange={(value) => setVolume(value[0])}
          max={1}
          min={0}
          step={0.1}
          className="w-16 h-2"
        />
      </div>
    </div>
  );
};
