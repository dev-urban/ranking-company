import React from 'react';
import { Trophy, Medal, Award } from 'lucide-react';
import { cn } from '../lib/utils';

interface RankingItem {
  position: number;
  name: string;
  ages: number;
  [key: string]: any;
}

interface RankingCardProps {
  title: string;
  items: RankingItem[];
  className?: string;
}

const getPositionIcon = (position: number) => {
  switch (position) {
    case 1:
      return <Trophy className="w-6 h-6 text-gold-400" />;
    case 2:
      return <Medal className="w-6 h-6 text-slate-300" />;
    case 3:
      return <Award className="w-6 h-6 text-amber-600" />;
    default:
      return (
        <div className="w-6 h-6 rounded-full bg-slate-600 flex items-center justify-center text-xs font-bold text-white">
          {position}
        </div>
      );
  }
};

const getPositionStyles = (position: number) => {
  switch (position) {
    case 1:
      return "bg-gradient-to-r from-gold-500/20 to-gold-600/20 border-gold-500/30";
    case 2:
      return "bg-gradient-to-r from-slate-400/20 to-slate-500/20 border-slate-400/30";
    case 3:
      return "bg-gradient-to-r from-amber-600/20 to-amber-700/20 border-amber-600/30";
    default:
      return "bg-slate-800/50 border-slate-700/50";
  }
};

export const RankingCard: React.FC<RankingCardProps> = ({
  title,
  items,
  className
}) => {
  return (
    <div className={cn(
      "bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6 shadow-2xl",
      "animate-fade-in",
      className
    )}>
      <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
        <div className="w-2 h-6 bg-gold-500 rounded-full" />
        {title}
      </h3>

      <div className="space-y-3">
        {items.map((item, index) => (
          <div
            key={index}
            className={cn(
              "flex items-center justify-between p-4 rounded-lg border transition-all duration-300 hover:scale-105",
              getPositionStyles(item.position),
              "animate-slide-up"
            )}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex items-center gap-3">
              {getPositionIcon(item.position)}
              <div>
                <p className="font-semibold text-white">{item.name}</p>
                {item.gerente && (
                  <p className="text-sm text-slate-400">Gerente: {item.gerente}</p>
                )}
                {item.diretor && (
                  <p className="text-sm text-slate-400">Diretor: {item.diretor}</p>
                )}
              </div>
            </div>

            <div className="text-right">
              <div className="text-xl font-bold text-gold-400 animate-count-up">
                {item.ages.toLocaleString('pt-BR', {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 1
                })}
              </div>
              <div className="text-xs text-slate-400">agenciamentos</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};