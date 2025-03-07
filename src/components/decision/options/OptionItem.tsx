
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Sparkles, Trash2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { Option } from './types';

interface OptionItemProps {
  option: Option;
  index: number;
  canDelete: boolean;
  onUpdate: (id: string, field: 'title' | 'description', value: string) => void;
  onDelete: (id: string) => void;
  onTitleBlur: (option: Option) => void;
}

export function OptionItem({ 
  option, 
  index, 
  canDelete, 
  onUpdate, 
  onDelete,
  onTitleBlur
}: OptionItemProps) {
  return (
    <div 
      className={cn(
        "p-4 border rounded-lg animate-slide-in",
        option.isAIGenerated 
          ? "bg-amber-50/80 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800/30" 
          : "bg-white/50 dark:bg-gray-800/50"
      )}
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h3 className="font-medium">Option {index + 1}</h3>
          {option.isAIGenerated && (
            <Sparkles className="h-4 w-4 text-amber-500" />
          )}
        </div>
        {canDelete && (
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => onDelete(option.id)}
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>
      <div className="space-y-4">
        <div className="space-y-2">
          <Input
            id={`title-${option.id}`}
            value={option.title}
            onChange={(e) => onUpdate(option.id, 'title', e.target.value)}
            onBlur={() => onTitleBlur(option)}
            placeholder="Ex: Acheter une maison neuve"
            className="w-full"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`description-${option.id}`}>Description (optionnel)</Label>
          {option.isLoading ? (
            <div className="space-y-2 animate-pulse">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              <Progress className="h-1 mt-1" value={50} />
            </div>
          ) : (
            <Textarea
              id={`description-${option.id}`}
              value={option.description}
              onChange={(e) => onUpdate(option.id, 'description', e.target.value)}
              placeholder="Détails, avantages et inconvénients de cette option..."
              className="min-h-[80px]"
            />
          )}
        </div>
      </div>
    </div>
  );
}
