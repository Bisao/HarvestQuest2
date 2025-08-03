
import * as React from "react"
import { Button, ButtonProps } from "./button"
import { useSoundEffects } from "@/hooks/use-sound-effects"

export interface SoundButtonProps extends ButtonProps {
  soundType?: 'click' | 'success' | 'error' | 'collect' | 'craft'
  enableSound?: boolean
}

const SoundButton = React.forwardRef<HTMLButtonElement, SoundButtonProps>(
  ({ soundType = 'click', enableSound = true, onClick, ...props }, ref) => {
    const { playButtonClick, playSuccess, playError, playCollect, playCraft } = useSoundEffects();

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      if (enableSound) {
        switch (soundType) {
          case 'success':
            playSuccess();
            break;
          case 'error':
            playError();
            break;
          case 'collect':
            playCollect();
            break;
          case 'craft':
            playCraft();
            break;
          default:
            playButtonClick();
            break;
        }
      }

      if (onClick) {
        onClick(event);
      }
    };

    return (
      <Button
        ref={ref}
        onClick={handleClick}
        {...props}
      />
    );
  }
)

SoundButton.displayName = "SoundButton"

export { SoundButton }
