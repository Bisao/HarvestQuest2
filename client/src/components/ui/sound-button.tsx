import * as React from "react"
import { Button, ButtonProps } from "./button"

export interface SoundButtonProps extends ButtonProps {
  soundType?: 'click' | 'success' | 'error' | 'collect' | 'craft'
  enableSound?: boolean
}

const SoundButton = React.forwardRef<HTMLButtonElement, SoundButtonProps>(
  ({ soundType, enableSound, onClick, ...props }, ref) => {
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
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