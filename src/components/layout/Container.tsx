
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
      "py-[16px]",
      fullWidth ? "w-full" : "container mx-auto px-4 md:px-6",
      className
    )}>
      {children}
    </main>
  );
}
