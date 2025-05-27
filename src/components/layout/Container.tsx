
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface ContainerProps {
  children: ReactNode;
  className?: string;
  fullWidth?: boolean;
}

export function Container({
  children,
  className,
  fullWidth = false
}: ContainerProps) {
  return (
    <main className={cn(
      "pt-[72px] px-[24px] simple-radial-gradient min-h-screen",
      className
    )}>
      {children}
    </main>
  );
}
