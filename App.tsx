import React, { useState, useEffect } from 'react';
import { Surah, Verse } from './types';
import VerseCard from './components/VerseCard';
import VerseAnalysisView from './components/VerseAnalysisView';
import { fetchSurahList, fetchSurahVerses } from './services/quran';
import { Sparkles, Search, ChevronLeft, Book, Loader2 } from 'lucide-react';

const App: React.FC = () => {
  // Surah List State
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [loadingSurahs, setLoadingSurahs] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Selected Content State
  const [selectedSurah, setSelectedSurah] = useState<Surah | null>(null);
  const [verses, setVerses] = useState<Verse[]>([]);
  const [loadingVerses, setLoadingVerses] = useState(false);
  
  // Detail View State
  const [selectedVerse, setSelectedVerse] = useState<Verse | null>(null);

  useEffect(() => {
    const loadSurahs = async () => {
      try {
        const data = await fetchSurahList();
        setSurahs(data);
      } catch (error) {
        console.error("Failed to load surahs", error);
      } finally {
        setLoadingSurahs(false);
      }
    };
    loadSurahs();
  }, []);

  const handleSurahClick = async (surah: Surah) => {
    setSelectedSurah(surah);
    setLoadingVerses(true);
    setVerses([]);
    setSelectedVerse(null);
    try {
      const data = await fetchSurahVerses(surah.number);
      setVerses(data);
      // Auto-select first verse on desktop
      if (window.innerWidth >= 1024 && data.length > 0) {
        setSelectedVerse(data[0]);
      }
    } catch (error) {
      console.error("Failed to load verses", error);
    } finally {
      setLoadingVerses(false);
    }
  };

  const handleBackToHome = () => {
    setSelectedSurah(null);
    setVerses([]);
    setSelectedVerse(null);
  };

  const filteredSurahs = surahs.filter(s => 
    s.englishName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.englishNameTranslation.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.number.toString().includes(searchQuery)
  );

  const activeVerse = selectedVerse || (window.innerWidth >= 1024 && verses.length > 0 ? verses[0] : null);

  return (
    <div className="min-h-screen flex flex-col">
      {/* App Header */}
      <header className="sticky top-0 z-30 w-full border-b border-white/20 bg-white/70 backdrop-blur-md shadow-sm transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={handleBackToHome}>
            <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 p-2 rounded-xl text-white shadow-lg shadow-emerald-500/20">
               {selectedSurah ? <ChevronLeft size={20} /> : <Book size={20} fill="currentColor" className="text-emerald-100" />}
            </div>
            <div>
                <h1 className="text-lg font-bold text-slate-900 tracking-tight leading-none font-serif">Quran Verse Explorer</h1>
                <div className="flex items-center gap-2">
                  <span className={`w-1.5 h-1.5 rounded-full ${selectedSurah ? 'bg-emerald-500' : 'bg-slate-300'}`}></span>
                  <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">
                    {selectedSurah ? selectedSurah.englishName : 'Library'}
                  </p>
                </div>
            </div>
          </div>
          
          {selectedSurah && (
             <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-full border border-slate-200">
                <span className="text-xs font-semibold text-slate-500">{selectedSurah.englishNameTranslation}</span>
                <span className="text-slate-300">|</span>
                <span className="text-xs text-slate-400 font-arabic">{selectedSurah.name}</span>
             </div>
          )}
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8">
        
        {/* SURAH LIST VIEW */}
        {!selectedSurah && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="text-center max-w-2xl mx-auto mt-8 mb-12">
                <h2 className="text-3xl sm:text-4xl font-serif font-bold text-slate-800 mb-4">Explore the Divine Wisdom</h2>
                <p className="text-slate-500 text-lg">Select a Surah to begin your journey of understanding through AI-powered analysis.</p>
                
                <div className="mt-8 relative max-w-md mx-auto">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                        <Search size={20} />
                    </div>
                    <input 
                      type="text"
                      placeholder="Search Surah (e.g. Yasin, 36)..."
                      className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl shadow-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none transition-all"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
             </div>

             {loadingSurahs ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                   {[...Array(9)].map((_, i) => (
                      <div key={i} className="h-32 bg-slate-200/50 rounded-2xl animate-pulse"></div>
                   ))}
                </div>
             ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-20">
                   {filteredSurahs.map((surah) => (
                      <div 
                        key={surah.number}
                        onClick={() => handleSurahClick(surah)}
                        className="group bg-white hover:bg-emerald-50/50 border border-slate-200 hover:border-emerald-200 p-5 rounded-2xl cursor-pointer transition-all hover:shadow-lg hover:shadow-emerald-500/10 hover:-translate-y-1 relative overflow-hidden"
                      >
                         <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-slate-100 group-hover:bg-emerald-100 text-slate-500 group-hover:text-emerald-700 flex items-center justify-center font-bold text-sm transition-colors">
                                   {surah.number}
                                </div>
                                <div>
                                   <h3 className="font-bold text-slate-800 group-hover:text-emerald-900">{surah.englishName}</h3>
                                   <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">{surah.englishNameTranslation}</p>
                                </div>
                            </div>
                            <div className="text-right">
                               <p className="font-arabic text-xl text-slate-400 group-hover:text-emerald-600 transition-colors">{surah.name}</p>
                               <p className="text-[10px] text-slate-400 mt-1">{surah.numberOfAyahs} Verses</p>
                            </div>
                         </div>
                      </div>
                   ))}
                </div>
             )}
          </div>
        )}

        {/* VERSE DETAIL VIEW */}
        {selectedSurah && (
           <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
            
            {/* Left Column: Verse List */}
            <div className={`lg:col-span-5 flex flex-col ${selectedVerse && window.innerWidth < 1024 ? 'hidden' : 'block'}`}>
              <div className="mb-6 flex flex-col">
                  <div className="flex items-baseline justify-between mb-2">
                     <h2 className="text-3xl font-serif font-bold text-slate-800">{selectedSurah.englishName}</h2>
                     <span className="font-arabic text-2xl text-emerald-600">{selectedSurah.name}</span>
                  </div>
                  <div className="flex gap-2 text-sm text-slate-500">
                     <span className="bg-slate-100 px-2 py-0.5 rounded text-xs font-semibold uppercase">{selectedSurah.revelationType}</span>
                     <span>•</span>
                     <span>{selectedSurah.numberOfAyahs} Verses</span>
                  </div>
              </div>
              
              {loadingVerses ? (
                 <div className="flex flex-col items-center justify-center h-64 text-slate-400 gap-3">
                    <Loader2 size={32} className="animate-spin text-emerald-500" />
                    <p className="text-sm font-medium">Loading Verses...</p>
                 </div>
              ) : (
                <div className="space-y-4 pb-20 lg:pb-0">
                    {verses.map((verse) => (
                        <VerseCard
                            key={verse.id}
                            verse={verse}
                            onClick={() => {
                                setSelectedVerse(verse);
                                if (window.innerWidth < 1024) window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            isSelected={activeVerse?.id === verse.id}
                        />
                    ))}
                </div>
              )}
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
                           <p className="font-medium text-slate-500">Select a Verse</p>
                           <p className="text-sm mt-1">Tap on any verse to view its Tafsir, word analysis, and AI insights.</p>
                       </div>
                   </div>
               )}
            </div>
          </div>
        )}

      </main>
    </div>
  );
};

export default App;
