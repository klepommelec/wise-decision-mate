
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface ContainerProps {
  children: ReactNode;
  className?: string;
  fullWidth?: boolean;
}

export function Container({ children, className, fullWidth = false }: ContainerProps) {
  return (
    <main 
      className={cn(
        "w-full mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 flex-1",
        fullWidth ? "max-w-full" : "max-w-7xl",
        className
      )}
    >
      {children}
    </main>
  );
}
