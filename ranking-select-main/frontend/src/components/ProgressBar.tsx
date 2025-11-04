import React from 'react';
import { cn } from '../lib/utils';

interface ProgressBarProps {
  value: number;
  max: number;
  className?: string;
  showPercentage?: boolean;
  animated?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max,
  className,
  showPercentage = true,
  animated = true
}) => {
  const percentage = Math.min((value / max) * 100, 100);

  return (
    <div className={cn("space-y-2", className)}>
      <div className="relative w-full h-6 bg-slate-700 rounded-full overflow-hidden shadow-inner">
        <div
          className={cn(
            "h-full bg-gradient-to-r from-gold-400 to-gold-600 shadow-lg transition-all duration-1000 ease-out",
            animated && "animate-pulse-gold"
          )}
          style={{
            width: `${percentage}%`,
            transition: animated ? 'width 2s cubic-bezier(0.4, 0, 0.2, 1)' : undefined
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
      </div>

      {showPercentage && (
        <div className="flex justify-between items-center text-sm">
          <span className="text-slate-400">
            {value.toLocaleString('pt-BR')} / {max.toLocaleString('pt-BR')}
          </span>
          <span className="text-gold-400 font-semibold">
            {percentage.toFixed(1)}%
          </span>
        </div>
      )}
    </div>
  );
};