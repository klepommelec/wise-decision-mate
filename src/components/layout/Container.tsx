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
  return <main className="py-[48px]">
      {children}
    </main>;
}