import React from 'react';
import { User } from 'lucide-react';
import { Diretor } from '../types';
import { cn } from '../lib/utils';

interface DiretorCardProps {
  diretores: Diretor[];
  className?: string;
}

export const DiretorCard: React.FC<DiretorCardProps> = ({
  diretores,
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
        Agenciamentos por Diretor
      </h3>

      <div className="grid gap-4">
        {diretores.map((diretor, index) => (
          <div
            key={index}
            className={cn(
              "flex items-center justify-between p-4 rounded-lg",
              "bg-slate-700/30 border border-slate-600/50",
              "hover:border-gold-500/30 transition-all duration-300 hover:scale-102",
              "animate-slide-up"
            )}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gold-500/20 rounded-lg">
                <User className="w-5 h-5 text-gold-400" />
              </div>
              <div>
                <p className="font-semibold text-white">{diretor.name}</p>
                <p className="text-sm text-slate-400">Diretor</p>
              </div>
            </div>

            <div className="text-right">
              <div className="text-xl font-bold text-gold-400 animate-count-up">
                {diretor.ages.toLocaleString('pt-BR', {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 1
                })}
              </div>
              <div className="text-xs text-slate-400">agenciamentos</div>
            </div>
          </div>
        ))}

        {diretores.length === 0 && (
          <div className="text-center py-8 text-slate-400">
            <User className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Nenhum agenciamento encontrado</p>
          </div>
        )}
      </div>
    </div>
  );
};