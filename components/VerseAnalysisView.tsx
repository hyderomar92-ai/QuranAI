import React, { useEffect, useState, useRef } from 'react';
import { Verse, VerseAnalysis, ChatMessage, ConnectionType } from '../types';
import { fetchVerseAnalysis, chatWithVerse } from '../services/gemini';
import { searchQuran } from '../services/quran';
import { 
  BookOpen, 
  MessagesSquare, 
  Sparkles, 
  Languages, 
  Send, 
  Quote, 
  Bot, 
  User, 
  Brain, 
  CheckCircle, 
  XCircle, 
  HelpCircle, 
  Lightbulb,
  ExternalLink,
  MapPin,
  Clock,
  ScrollText,
  BookHeart,
  Tag,
  Search,
  X,
  Loader2
} from 'lucide-react';

interface VerseAnalysisViewProps {
  verse: Verse;
  onClose: () => void;
}

type Tab = 'meaning' | 'words' | 'connections' | 'quiz' | 'chat';

const VerseAnalysisView: React.FC<VerseAnalysisViewProps> = ({ verse, onClose }) => {
  const [analysis, setAnalysis] = useState<VerseAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('meaning');
  
  // Quiz State
  const [quizState, setQuizState] = useState<Record<number, number | null>>({});

  // Word Analysis State
  const [hoveredRoot, setHoveredRoot] = useState<string | null>(null);
  
  // Chat state
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Search/Topic State
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<(Verse & { surahName?: string })[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchTitle, setSearchTitle] = useState('');

  useEffect(() => {
    let mounted = true;
    const loadAnalysis = async () => {
      setLoading(true);
      setAnalysis(null);
      setMessages([]); 
      setQuizState({});
      try {
        const data = await fetchVerseAnalysis(verse);
        if (mounted) {
          setAnalysis(data);
          setMessages([{
            id: 'init',
            role: 'model',
            text: `Salaam. I have analyzed Verse ${verse.number} of Surah ${verse.surah} for you. What would you like to explore deeper?`,
            timestamp: Date.now()
          }]);
        }
      } catch (error) {
        console.error(error);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadAnalysis();
    return () => { mounted = false; };
  }, [verse]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeTab]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || chatLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setChatLoading(true);

    try {
      const history = messages.map(m => ({ role: m.role, text: m.text }));
      const responseText = await chatWithVerse(verse, history, userMsg.text);
      
      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText,
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      console.error(error);
    } finally {
      setChatLoading(false);
    }
  };

  const handleQuizOptionSelect = (questionIdx: number, optionIdx: number) => {
    if (quizState[questionIdx] !== undefined) return;
    setQuizState(prev => ({ ...prev, [questionIdx]: optionIdx }));
  };

  const handleTopicClick = async (topic: string) => {
    setSearchTitle(`Verses about "${topic}"`);
    setSearchModalOpen(true);
    setSearchLoading(true);
    setSearchResults([]);
    try {
      const results = await searchQuran(topic);
      setSearchResults(results);
    } catch (e) {
      console.error(e);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleWordSearch = async (word: string) => {
    setSearchTitle(`Occurrences of "${word}" in this Surah`);
    setSearchModalOpen(true);
    setSearchLoading(true);
    setSearchResults([]);
    try {
      const results = await searchQuran(word, verse.surah);
      setSearchResults(results);
    } catch (e) {
      console.error(e);
    } finally {
      setSearchLoading(false);
    }
  };

  const TabButton = ({ id, label, icon: Icon }: { id: Tab, label: string, icon: any }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 ${
        activeTab === id
          ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/30'
          : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
      }`}
    >
      <Icon size={16} />
      <span className="whitespace-nowrap">{label}</span>
    </button>
  );

  const getConnectionIcon = (type: ConnectionType) => {
    switch (type) {
      case 'quran': return BookHeart;
      case 'hadith': return ScrollText;
      case 'history': return Clock;
      case 'geography': return MapPin;
      default: return Sparkles;
    }
  };

  const getConnectionColor = (type: ConnectionType) => {
    switch (type) {
      case 'quran': return 'bg-emerald-100 text-emerald-800';
      case 'hadith': return 'bg-amber-100 text-amber-800';
      case 'history': return 'bg-blue-100 text-blue-800';
      case 'geography': return 'bg-rose-100 text-rose-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  const getConnectionLabel = (type: ConnectionType) => {
    switch (type) {
      case 'quran': return 'Quranic Parallel';
      case 'hadith': return 'Hadith / Sunnah';
      case 'history': return 'Historical Context';
      case 'geography': return 'Geography / Location';
      default: return 'Related';
    }
  };

  return (
    <div className="flex flex-col h-full bg-white relative">
      {/* Header & Nav */}
      <div className="flex-none bg-white/95 backdrop-blur z-10 px-6 pt-6 pb-2 border-b border-slate-100">
         <div className="flex items-center justify-between mb-4">
             <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-serif font-bold">
                    {verse.number}
                </div>
                <h2 className="text-xl font-bold font-serif text-slate-800">Verse Analysis</h2>
             </div>
             <button onClick={onClose} className="md:hidden p-2 text-slate-400 hover:bg-slate-100 rounded-full">
                 <span className="sr-only">Close</span>
                 ✕
             </button>
         </div>
         <div className="flex overflow-x-auto no-scrollbar gap-2 pb-2">
            <TabButton id="meaning" label="Meaning" icon={BookOpen} />
            <TabButton id="words" label="Words" icon={Languages} />
            <TabButton id="connections" label="Links" icon={Sparkles} />
            <TabButton id="quiz" label="Quiz" icon={Brain} />
            <TabButton id="chat" label="Ask AI" icon={MessagesSquare} />
         </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 scroll-smooth bg-slate-50/50">
        
        {loading ? (
            <AnalysisSkeleton />
        ) : !analysis ? (
             <div className="flex flex-col items-center justify-center h-full text-slate-400">
                 <p>Unable to load analysis.</p>
             </div>
        ) : (
          <>
            {/* Meaning & Tafsir Tab */}
            {activeTab === 'meaning' && (
              <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500 fade-in">
                
                {/* Topic Pills */}
                {analysis.topics && analysis.topics.length > 0 && (
                   <div className="flex flex-wrap gap-2 mb-2">
                      {analysis.topics.map((topic, i) => (
                        <button 
                          key={i}
                          onClick={() => handleTopicClick(topic)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800 text-xs font-semibold rounded-full transition-colors border border-emerald-100"
                        >
                           <Tag size={12} />
                           {topic}
                        </button>
                      ))}
                   </div>
                )}

                {/* Simplified Meaning */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-600 mb-3 flex items-center gap-2">
                        <Sparkles size={14} /> Simplified Meaning
                    </h3>
                    <p className="text-lg leading-relaxed text-slate-800 font-medium">{analysis.simpleMeaning}</p>
                </div>

                {/* Reflection Card */}
                {analysis.reflectionQuestion && (
                  <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100 relative overflow-hidden">
                     <div className="absolute top-0 right-0 p-4 opacity-5">
                       <Lightbulb size={120} className="text-indigo-600" />
                     </div>
                     <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-600 mb-3 flex items-center gap-2 relative z-10">
                        <Lightbulb size={14} /> Reflection
                     </h3>
                     <p className="text-lg font-serif italic text-indigo-900 leading-relaxed relative z-10">
                       "{analysis.reflectionQuestion}"
                     </p>
                  </div>
                )}

                {/* Tafsir Insights */}
                <div className="grid gap-4">
                    {analysis.tafsirInsights.map((t, idx) => (
                        <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden group hover:shadow-md transition-shadow">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <Quote size={64} className="text-emerald-500" />
                            </div>
                            <div className="relative z-10">
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="h-6 w-1 bg-emerald-500 rounded-full"></div>
                                    <h4 className="font-serif font-bold text-slate-900">{t.scholar}</h4>
                                </div>
                                <p className="text-slate-600 leading-relaxed text-sm lg:text-base">{t.insight}</p>
                            </div>
                        </div>
                    ))}
                </div>
                
                {/* Moral Action Points */}
                 <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-600 mb-3">Moral Action Points</h3>
                    <ul className="space-y-3">
                        {analysis.moralTeachings.map((m, i) => (
                            <li key={i} className="flex items-start gap-3 text-slate-700 text-sm">
                                <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                                    {i + 1}
                                </span>
                                {m}
                            </li>
                        ))}
                    </ul>
                </div>
              </div>
            )}

            {/* Word Analysis Tab */}
            {activeTab === 'words' && (
              <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-500 fade-in">
                 <div className="flex items-center gap-2 mb-2 px-1 text-slate-500 text-sm">
                    <HelpCircle size={14} />
                    <span>Hover over a card to highlight words with the same root.</span>
                 </div>
                 {analysis.wordAnalysis.map((word, idx) => {
                     const isHovered = hoveredRoot === word.root;
                     const isDimmed = hoveredRoot && hoveredRoot !== word.root;
                     
                     return (
                         <div 
                            key={idx} 
                            onMouseEnter={() => setHoveredRoot(word.root)}
                            onMouseLeave={() => setHoveredRoot(null)}
                            className={`bg-white p-5 rounded-2xl shadow-sm border transition-all duration-300 group relative
                                ${isHovered ? 'border-emerald-500 shadow-md ring-1 ring-emerald-500 scale-[1.02]' : 'border-slate-100'}
                                ${isDimmed ? 'opacity-40 grayscale-[50%]' : 'opacity-100'}
                            `}
                         >
                             <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                                 <div className="flex-1 text-right border-b sm:border-b-0 sm:border-l border-slate-100 pb-4 sm:pb-0 sm:pl-6 sm:order-2">
                                     <p className="font-arabic text-3xl text-slate-800 mb-1 group-hover:text-emerald-700 transition-colors">{word.arabicWord}</p>
                                     <div className={`inline-flex items-center gap-2 px-2 py-1 rounded text-xs font-mono transition-colors ${isHovered ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-50 text-slate-400'}`}>
                                        <span>Root:</span>
                                        <span className="font-arabic font-bold">{word.root}</span>
                                     </div>
                                 </div>
                                 
                                 <div className="flex-1 sm:order-1">
                                     <p className="font-bold text-slate-900 text-lg mb-1">{word.meaning}</p>
                                     <p className="text-sm text-slate-500 leading-relaxed mb-3">{word.nuance}</p>
                                     <button 
                                        onClick={() => handleWordSearch(word.meaning)}
                                        className="inline-flex items-center gap-1 text-[10px] uppercase font-bold text-slate-400 hover:text-emerald-600 bg-slate-50 hover:bg-emerald-50 px-2 py-1 rounded transition-colors"
                                     >
                                        <Search size={10} />
                                        Find "{word.meaning}" in this Surah
                                     </button>
                                 </div>
                             </div>
                         </div>
                     );
                 })}
              </div>
            )}

            {/* Connections Tab */}
            {activeTab === 'connections' && (
              <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500 fade-in">
                 <div className="flex flex-col gap-4">
                     {analysis.connections.map((conn, idx) => {
                         const Icon = getConnectionIcon(conn.type);
                         return (
                             <div key={idx} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                                 <div className="p-1">
                                    <div className="flex items-center justify-between p-3 pb-0">
                                        <div className="flex items-center gap-2">
                                            <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full uppercase tracking-wide flex items-center gap-1.5 ${getConnectionColor(conn.type)}`}>
                                                <Icon size={12} />
                                                {getConnectionLabel(conn.type)}
                                            </span>
                                        </div>
                                        {conn.url && (
                                            <a 
                                                href={conn.url} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-1 text-[10px] font-semibold text-emerald-600 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-2 py-1 rounded-full transition-colors"
                                            >
                                                <span>Deep Dive</span>
                                                <ExternalLink size={10} />
                                            </a>
                                        )}
                                    </div>
                                 </div>
                                 
                                 <div className="p-5 pt-3">
                                     <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">{conn.source}</p>
                                     <p className="text-slate-800 font-serif text-lg mb-4 leading-relaxed border-l-2 border-slate-100 pl-4">
                                         "{conn.text}"
                                     </p>
                                     <div className="flex items-start gap-3 pt-3 border-t border-slate-50">
                                         <Sparkles size={14} className="text-emerald-400 mt-1 shrink-0" />
                                         <p className="text-sm text-slate-600">{conn.explanation}</p>
                                     </div>
                                 </div>
                             </div>
                         );
                     })}
                 </div>
              </div>
            )}

            {/* Quiz Tab */}
            {activeTab === 'quiz' && (
                <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500 fade-in">
                    <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100">
                        <h3 className="text-emerald-900 font-bold text-lg mb-2">Test Your Understanding</h3>
                        <p className="text-emerald-700 text-sm">Review what you've learned from the verse analysis with these 3 questions.</p>
                    </div>

                    {analysis.quizQuestions && analysis.quizQuestions.map((q, qIdx) => {
                        const hasAnswered = quizState[qIdx] !== undefined;
                        const isCorrect = quizState[qIdx] === q.correctAnswerIndex;

                        return (
                            <div key={qIdx} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                                <div className="p-6 border-b border-slate-100">
                                    <div className="flex items-start justify-between gap-4">
                                        <p className="font-semibold text-slate-900 text-lg">{q.question}</p>
                                        {hasAnswered && (
                                            <div className={`shrink-0 ${isCorrect ? 'text-emerald-500' : 'text-rose-500'}`}>
                                                {isCorrect ? <CheckCircle size={24} /> : <XCircle size={24} />}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="p-4 bg-slate-50 space-y-2">
                                    {q.options.map((option, oIdx) => {
                                        let btnClass = "w-full text-left p-4 rounded-xl border text-sm font-medium transition-all ";
                                        
                                        if (hasAnswered) {
                                            if (oIdx === q.correctAnswerIndex) {
                                                btnClass += "bg-emerald-100 border-emerald-500 text-emerald-800";
                                            } else if (oIdx === quizState[qIdx]) {
                                                btnClass += "bg-rose-100 border-rose-500 text-rose-800";
                                            } else {
                                                btnClass += "bg-white border-slate-200 text-slate-400 opacity-60";
                                            }
                                        } else {
                                            btnClass += "bg-white border-slate-200 hover:border-emerald-400 hover:shadow-sm text-slate-700";
                                        }

                                        return (
                                            <button 
                                                key={oIdx}
                                                onClick={() => handleQuizOptionSelect(qIdx, oIdx)}
                                                disabled={hasAnswered}
                                                className={btnClass}
                                            >
                                                {option}
                                            </button>
                                        );
                                    })}
                                </div>
                                {hasAnswered && (
                                    <div className={`p-4 text-sm ${isCorrect ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'}`}>
                                        <p className="font-bold mb-1">{isCorrect ? 'Correct!' : 'Incorrect'}</p>
                                        <p>{q.explanation}</p>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Chat Tab */}
            {activeTab === 'chat' && (
              <div className="flex flex-col h-[calc(100vh-14rem)] animate-in slide-in-from-bottom-4 duration-500 fade-in">
                <div className="flex-1 overflow-y-auto space-y-6 mb-4 pr-2">
                    {messages.map((msg) => (
                        <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                                msg.role === 'user' ? 'bg-slate-200 text-slate-600' : 'bg-emerald-100 text-emerald-600'
                            }`}>
                                {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                            </div>
                            <div className={`max-w-[80%] rounded-2xl px-5 py-3.5 text-sm leading-relaxed shadow-sm ${
                                msg.role === 'user' 
                                ? 'bg-slate-800 text-white rounded-tr-none' 
                                : 'bg-white border border-slate-100 text-slate-800 rounded-tl-none'
                            }`}>
                                {msg.text}
                            </div>
                        </div>
                    ))}
                    {chatLoading && (
                        <div className="flex gap-3">
                             <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                                <Bot size={16} />
                             </div>
                            <div className="bg-white border border-slate-100 rounded-2xl rounded-tl-none px-5 py-4 shadow-sm flex gap-1">
                                 <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                                 <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-100"></span>
                                 <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-200"></span>
                            </div>
                        </div>
                    )}
                    <div ref={chatEndRef}></div>
                </div>
                
                <form onSubmit={handleSendMessage} className="relative mt-auto pt-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask a follow-up question..."
                        className="w-full pl-5 pr-14 py-4 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm shadow-sm transition-all"
                        disabled={chatLoading}
                    />
                    <button 
                        type="submit" 
                        disabled={!input.trim() || chatLoading}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md shadow-emerald-500/20"
                    >
                        <Send size={18} />
                    </button>
                </form>
              </div>
            )}
          </>
        )}
      </div>
      
      {/* Search Result Modal */}
      {searchModalOpen && (
        <div className="absolute inset-0 z-50 bg-white/95 backdrop-blur-md flex flex-col p-6 animate-in slide-in-from-bottom-5 fade-in duration-300">
           <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-serif font-bold text-slate-800">{searchTitle}</h3>
              <button 
                onClick={() => setSearchModalOpen(false)}
                className="p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors"
              >
                <X size={20} className="text-slate-600" />
              </button>
           </div>
           
           <div className="flex-1 overflow-y-auto pr-2">
              {searchLoading ? (
                 <div className="flex flex-col items-center justify-center h-48 gap-3 text-slate-400">
                    <Loader2 size={32} className="animate-spin text-emerald-500" />
                    <p>Searching the Quran...</p>
                 </div>
              ) : searchResults.length === 0 ? (
                 <div className="text-center text-slate-400 mt-12">
                    <Search size={48} className="mx-auto mb-4 opacity-20" />
                    <p>No results found.</p>
                 </div>
              ) : (
                 <div className="space-y-4">
                    {searchResults.map((res, idx) => (
                       <div key={idx} className="p-4 rounded-xl border border-slate-100 bg-white shadow-sm">
                          <div className="flex items-center justify-between mb-2">
                             <div className="flex items-center gap-2">
                                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                                  {res.surahName}
                                </span>
                                <span className="text-xs text-slate-400 font-mono">
                                   {res.surah}:{res.number}
                                </span>
                             </div>
                          </div>
                          <p className="text-slate-800 text-sm leading-relaxed">
                            {res.translation}
                          </p>
                       </div>
                    ))}
                 </div>
              )}
           </div>
        </div>
      )}
    </div>
  );
};

// Skeleton Loader Component
const AnalysisSkeleton = () => (
    <div className="space-y-6 animate-pulse">
        <div className="h-24 bg-slate-200 rounded-2xl"></div>
        <div className="space-y-4">
             <div className="h-40 bg-slate-200 rounded-2xl"></div>
             <div className="h-40 bg-slate-200 rounded-2xl"></div>
        </div>
        <div className="h-32 bg-slate-200 rounded-2xl"></div>
    </div>
);

export default VerseAnalysisView;
