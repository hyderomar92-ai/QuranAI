import React, { useEffect, useState, useRef } from 'react';
import { Verse, VerseAnalysis, ChatMessage } from '../types';
import { fetchVerseAnalysis, chatWithVerse } from '../services/gemini';
import { BookOpen, MessagesSquare, Sparkles, Languages, Send, Quote, Bot, User } from 'lucide-react';

interface VerseAnalysisViewProps {
  verse: Verse;
  onClose: () => void;
}

type Tab = 'meaning' | 'words' | 'connections' | 'chat';

const VerseAnalysisView: React.FC<VerseAnalysisViewProps> = ({ verse, onClose }) => {
  const [analysis, setAnalysis] = useState<VerseAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('meaning');
  
  // Chat state
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let mounted = true;
    const loadAnalysis = async () => {
      setLoading(true);
      setAnalysis(null);
      setMessages([]); 
      try {
        const data = await fetchVerseAnalysis(verse);
        if (mounted) {
          setAnalysis(data);
          setMessages([{
            id: 'init',
            role: 'model',
            text: `Salaam. I have analyzed Verse ${verse.number} for you. What would you like to explore deeper?`,
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
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-600 mb-3 flex items-center gap-2">
                        <Sparkles size={14} /> Simplified Meaning
                    </h3>
                    <p className="text-lg leading-relaxed text-slate-800 font-medium">{analysis.simpleMeaning}</p>
                </div>

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
                
                <div className="bg-amber-50 p-6 rounded-2xl border border-amber-100">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-amber-700 mb-3">Historical Context</h3>
                    <p className="text-amber-900/80 text-sm leading-relaxed">
                        {analysis.historicalContext}
                    </p>
                </div>

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
                 {analysis.wordAnalysis.map((word, idx) => (
                     <div key={idx} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 hover:border-emerald-200 transition-all group">
                         <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                             <div className="flex-1 text-right border-b sm:border-b-0 sm:border-l border-slate-100 pb-4 sm:pb-0 sm:pl-6 sm:order-2">
                                 <p className="font-arabic text-3xl text-slate-800 mb-1 group-hover:text-emerald-700 transition-colors">{word.arabicWord}</p>
                                 <div className="inline-flex items-center gap-2 px-2 py-1 bg-slate-50 rounded text-xs text-slate-400 font-mono">
                                    <span>Root:</span>
                                    <span className="font-arabic font-bold text-slate-600">{word.root}</span>
                                 </div>
                             </div>
                             
                             <div className="flex-1 sm:order-1">
                                 <p className="font-bold text-slate-900 text-lg mb-1">{word.meaning}</p>
                                 <p className="text-sm text-slate-500 leading-relaxed">{word.nuance}</p>
                             </div>
                         </div>
                     </div>
                 ))}
              </div>
            )}

            {/* Connections Tab */}
            {activeTab === 'connections' && (
              <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-500 fade-in">
                 {analysis.connections.map((conn, idx) => (
                     <div key={idx} className="p-6 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                         <div className="flex items-center gap-2 mb-4">
                             <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full uppercase tracking-wide ${
                                 conn.source.includes('Bukhari') || conn.source.includes('Muslim') 
                                 ? 'bg-amber-100 text-amber-800' 
                                 : 'bg-emerald-100 text-emerald-800'
                             }`}>
                                 {conn.source.includes('Bukhari') || conn.source.includes('Muslim') ? 'Hadith' : 'Quran'}
                             </span>
                             <span className="text-xs font-semibold text-slate-400">{conn.source}</span>
                         </div>
                         <p className="text-slate-800 font-serif text-lg mb-4 leading-relaxed">"{conn.text}"</p>
                         <div className="flex items-start gap-3 pt-4 border-t border-slate-50">
                             <Sparkles size={16} className="text-emerald-400 mt-0.5 shrink-0" />
                             <p className="text-sm text-slate-600 italic">{conn.explanation}</p>
                         </div>
                     </div>
                 ))}
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