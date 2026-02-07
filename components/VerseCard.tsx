import React from 'react';
import { Verse } from '../types';
import { ChevronRight } from 'lucide-react';

interface VerseCardProps {
  verse: Verse;
  onClick: () => void;
  isSelected: boolean;
}

const VerseCard: React.FC<VerseCardProps> = ({ verse, onClick, isSelected }) => {
  return (
    <div
      onClick={onClick}
      className={`group cursor-pointer p-6 rounded-2xl transition-all duration-300 relative overflow-hidden ${
        isSelected
          ? 'bg-white shadow-lg shadow-emerald-500/10 ring-2 ring-emerald-500 scale-[1.01]'
          : 'bg-white/60 hover:bg-white hover:shadow-md border border-slate-100 hover:border-emerald-200'
      }`}
    >
      <div className="flex items-start gap-5">
        {/* Decorative Number */}
        <div className={`flex items-center justify-center w-10 h-10 shrink-0 rounded-full border-2 transition-colors ${
             isSelected 
             ? 'border-emerald-500 bg-emerald-50 text-emerald-700 font-bold' 
             : 'border-slate-200 bg-slate-50 text-slate-400 font-medium group-hover:border-emerald-200 group-hover:text-emerald-500'
        }`}>
          <span className="font-serif text-sm">{verse.number}</span>
        </div>

        <div className="flex-1 flex flex-col items-end">
            <p className={`text-right font-arabic text-4xl leading-[2] mb-3 transition-colors ${
                isSelected ? 'text-slate-900' : 'text-slate-700 group-hover:text-slate-900'
            }`}>
                {verse.arabic}
            </p>
            
            <div className="w-full text-left">
                <p className="text-slate-400 text-xs uppercase tracking-wide font-semibold mb-1 opacity-80">
                    Transliteration
                </p>
                <p className="text-slate-500 text-sm mb-3 italic font-serif">
                    {verse.transliteration}
                </p>
                <p className={`text-base leading-relaxed ${
                    isSelected ? 'text-emerald-900 font-medium' : 'text-slate-700'
                }`}>
                    {verse.translation}
                </p>
            </div>
        </div>
      </div>
      
      {/* Visual Indicator for Active State */}
      {isSelected && (
          <div className="absolute right-0 top-0 bottom-0 w-1 bg-emerald-500 rounded-l-full"></div>
      )}
      
      {/* Subtle background decoration */}
      <div className="absolute -left-4 -bottom-4 w-24 h-24 bg-emerald-50 rounded-full blur-2xl opacity-0 group-hover:opacity-50 transition-opacity pointer-events-none"></div>
    </div>
  );
};

export default VerseCard;