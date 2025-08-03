
import React from 'react';
import { Button } from './button';
import { Slider } from './slider';
import { Card, CardContent } from './card';
import { Volume2, VolumeX, Music } from 'lucide-react';
import { useBackgroundMusic } from '@/hooks/use-background-music';

interface MusicControlProps {
  className?: string;
}

export const MusicControl: React.FC<MusicControlProps> = ({ className }) => {
  const { isPlaying, volume, setVolume, toggleMusic, enabled } = useBackgroundMusic();

  return (
    <Card className={`w-full max-w-sm ${className}`}>
      <CardContent className="p-4">
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            size="sm"
            onClick={toggleMusic}
            className="flex items-center space-x-2"
          >
            {enabled ? (
              <>
                <Music className="w-4 h-4" />
                <span className="hidden sm:inline">Música On</span>
              </>
            ) : (
              <>
                <VolumeX className="w-4 h-4" />
                <span className="hidden sm:inline">Música Off</span>
              </>
            )}
          </Button>
          
          {enabled && (
            <div className="flex items-center space-x-2 flex-1">
              <Volume2 className="w-4 h-4 text-gray-500" />
              <Slider
                value={[volume * 100]}
                onValueChange={(values) => setVolume(values[0] / 100)}
                max={100}
                step={5}
                className="flex-1"
              />
              <span className="text-xs text-gray-500 w-8">
                {Math.round(volume * 100)}%
              </span>
            </div>
          )}
        </div>
        
        {enabled && (
          <div className="mt-2 flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
            <span className="text-xs text-gray-600">
              {isPlaying ? 'Música Ambiente Tocando' : 'Música Preparada - Clique para iniciar'}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
