import React from 'react';
import { Button } from './button';
import { cn } from '@/lib/utils';

interface SoundButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  children?: React.ReactNode;
}

export function SoundButton({ 
  className, 
  variant = 'default',
  size = 'default',
  children,
  ...props 
}: SoundButtonProps) {
  return (
    <Button
      variant={variant}
      size={size}
      className={cn(className)}
      {...props}
    >
      {children}
    </Button>
  );
}