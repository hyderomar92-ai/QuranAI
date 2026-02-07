import React, { useState } from 'react';
import { SURAH_AL_FATIHA } from './constants';
import { Verse } from './types';
import VerseCard from './components/VerseCard';
import VerseAnalysisView from './components/VerseAnalysisView';
import { Sparkles } from 'lucide-react';

const App: React.FC = () => {
  const [selectedVerse, setSelectedVerse] = useState<Verse | null>(null);

  // Default to selecting the first verse on large screens if nothing selected
  const activeVerse = selectedVerse || (window.innerWidth >= 1024 ? SURAH_AL_FATIHA[0] : null);

  const handleVerseClick = (verse: Verse) => {
    setSelectedVerse(verse);
    if (window.innerWidth < 1024) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* App Header with Glassmorphism */}
      <header className="sticky top-0 z-30 w-full border-b border-white/20 bg-white/70 backdrop-blur-md shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 p-2 rounded-xl text-white shadow-lg shadow-emerald-500/20">
               <Sparkles size={20} fill="currentColor" className="text-emerald-100" />
            </div>
            <div>
                <h1 className="text-lg font-bold text-slate-900 tracking-tight leading-none font-serif">Quran Verse Explorer</h1>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Surah Al-Fatiha</p>
                </div>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-full border border-slate-200">
             <span className="text-xs font-semibold text-slate-500">The Opening</span>
             <span className="text-slate-300">|</span>
             <span className="text-xs text-slate-400 font-arabic">الفاتحة</span>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
          
          {/* Left Column: Verse List */}
          <div className={`lg:col-span-5 flex flex-col ${selectedVerse && window.innerWidth < 1024 ? 'hidden' : 'block'}`}>
            <div className="mb-8">
                <h2 className="text-3xl font-serif font-bold text-slate-800 mb-3">The Opening</h2>
                <p className="text-slate-600 leading-relaxed text-sm lg:text-base">
                    Explore the seven oft-repeated verses. Select a verse to reveal deep scholarly meanings, linguistic gems, and AI-powered insights.
                </p>
            </div>
            
            <div className="space-y-4 pb-20 lg:pb-0">
                {SURAH_AL_FATIHA.map((verse) => (
                    <VerseCard
                        key={verse.id}
                        verse={verse}
                        onClick={() => handleVerseClick(verse)}
                        isSelected={activeVerse?.id === verse.id}
                    />
                ))}
            </div>
          </div>

          {/* Right Column: Detail View */}
          <div className={`lg:col-span-7 lg:h-[calc(100vh-8rem)] lg:sticky lg:top-24
            ${!selectedVerse && window.innerWidth < 1024 ? 'hidden' : 'block'}
            ${selectedVerse && window.innerWidth < 1024 ? 'fixed inset-0 z-40 bg-white overflow-y-auto' : ''}
          `}>
             {activeVerse ? (
                 <div className="h-full bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl shadow-slate-200/50 border border-white/50 overflow-hidden ring-1 ring-slate-900/5">
                     <VerseAnalysisView 
                        verse={activeVerse} 
                        onClose={() => setSelectedVerse(null)} 
                     />
                 </div>
             ) : (
                 <div className="h-full hidden lg:flex items-center justify-center bg-white/40 backdrop-blur-sm rounded-3xl border-2 border-dashed border-slate-200 text-slate-400">
                     <div className="text-center p-8 max-w-xs">
                         <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Sparkles className="w-8 h-8 text-slate-300" />
                         </div>
                         <p className="font-medium text-slate-500">Begin your study</p>
                         <p className="text-sm mt-1">Select any verse from the list to view its Tafsir and analysis.</p>
                     </div>
                 </div>
             )}
          </div>

        </div>
      </main>
    </div>
  );
};

export default App;