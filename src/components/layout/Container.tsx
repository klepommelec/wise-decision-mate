
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
    <main 
      className={cn(
        "py-[16px] relative",
        fullWidth ? "w-full" : "container mx-auto px-4 md:px-6",
        className
      )}
      style={{
        background: 'linear-gradient(to bottom, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 1) 100%)'
      }}
    >
      {children}
    </main>
  );
}
