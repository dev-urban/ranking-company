import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '../lib/utils';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  className
}) => {
  return (
    <div className={cn(
      "bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6 shadow-2xl",
      "hover:border-gold-500/30 transition-all duration-300 hover:scale-105",
      "animate-fade-in",
      className
    )}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-400 mb-1">{title}</p>
          <p className="text-3xl font-bold text-white animate-count-up">
            {typeof value === 'number'
              ? value.toLocaleString('pt-BR')
              : value
            }
          </p>
          {subtitle && (
            <p className="text-sm text-slate-400 mt-1">{subtitle}</p>
          )}
          {trend && (
            <div className={cn(
              "flex items-center gap-1 mt-2 text-sm",
              trend.isPositive ? "text-green-400" : "text-red-400"
            )}>
              <span>{trend.isPositive ? '↗' : '↘'}</span>
              <span>{Math.abs(trend.value).toFixed(1)}%</span>
            </div>
          )}
        </div>

        <div className="p-3 bg-gold-500/20 rounded-lg">
          <Icon className="w-6 h-6 text-gold-400" />
        </div>
      </div>
    </div>
  );
};