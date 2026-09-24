import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Bot,
  User,
  Sparkles,
  BookOpen,
  Check,
  Copy,
  ChevronRight,
  RotateCcw,
  MessageSquare
} from 'lucide-react';
import { searchNormativaContext } from '../../services/normativaAiService.js';

const SUGGESTED_QUESTIONS = [
  '¿Pueden reconocer mi atuendo o auto después de haber escapado de la poli?',
  '¿Puedo lootear a un policía abatido?',
  '¿Cuánto tiempo debo esperar para iniciar otro robo?',
  '¿El tendero cuenta como rehén en un 24/7?',
  '¿Se permite Power Gaming fuera de Los Santos?',
  '¿Puedo cambiarme de ropa inmediatamente después de robar?',
  '¿El conductor puede disparar desde el coche en movimiento?',
  '¿Cuántos civiles podemos ir a robar juntos?'
];

export const NormativaAiChat = () => {
  const [messages, setMessages] = useState([]); // Sin mensajes molestos por defecto
  const [inputQuery, setInputQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [transcribedText, setTranscribedText] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const chatBottomRef = useRef(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Transcripción animada en la nube de texto cuando Chostito habla
  useEffect(() => {
    // Si acaba de sonar en esta sesión o se activa Chostito
    const fullSpeech = "¡Hola! Soy Chostito. Pregúntame lo que sea de la normativa de Animals City RP y te lo respondo al toque.";
    let currentIndex = 0;
    setIsSpeaking(true);
    setTranscribedText('');

    const interval = setInterval(() => {
      if (currentIndex <= fullSpeech.length) {
        setTranscribedText(fullSpeech.slice(0, currentIndex));
        currentIndex++;
      } else {
        clearInterval(interval);
        setTimeout(() => setIsSpeaking(false), 2500);
      }
    }, 38);

    return () => clearInterval(interval);
  }, []);

  const handleSend = (textToSend) => {
    const query = (textToSend || inputQuery).trim();
    if (!query || isTyping) return;

    const userMessage = {
      id: 'user-' + Date.now(),
      sender: 'user',
      text: query,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setInputQuery('');
    setIsTyping(true);

    setTimeout(() => {
      const result = searchNormativaContext(query);
      const botMessage = {
        id: 'bot-' + Date.now(),
        sender: 'bot',
        verdict: result.verdict,
        badgeColor: result.badgeColor,
        headline: result.headline,
        explanation: result.explanation,
        category: result.category,
        ruleReference: result.ruleReference,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 400);
  };

  const handleCopy = (msg) => {
    const fullText = `[${msg.verdict}] ${msg.headline}\n\n${msg.explanation}\n\nNorma: ${msg.ruleReference}`;
    navigator.clipboard.writeText(fullText);
    setCopiedId(msg.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleResetChat = () => {
    setMessages([]);
  };

  const getBadgeClasses = (color) => {
    switch (color) {
      case 'emerald':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-emerald-950/40';
      case 'red':
        return 'bg-red-500/20 text-red-300 border-red-500/40 shadow-red-950/40';
      case 'amber':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-amber-950/40';
      case 'cyan':
      default:
        return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-cyan-950/40';
    }
  };

  return (
    <div className="flex flex-col h-[560px] sm:h-[620px] bg-slate-900/90 border border-purple-500/30 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-md">
      {/* Sub-Header con Chostito a la derecha y su nube de diálogo */}
      <div className="px-4 py-2.5 bg-gradient-to-r from-purple-950/80 via-slate-900 to-cyan-950/80 border-b border-purple-500/30 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <h3 className="font-tactical font-black text-sm text-white tracking-wide">
                CHOSTITO IA
              </h3>
              <span className="flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                ONLINE
              </span>
            </div>
            <span className="text-[10px] text-slate-400">Normativa Animals City</span>
          </div>
        </div>

        {/* Chostito Avatar a la derecha + Nube de texto animada */}
        <div className="flex items-center gap-2 max-w-[70%] sm:max-w-[65%] justify-end">
          {transcribedText && (
            <div className="relative bg-slate-800/90 border border-purple-400/40 text-slate-200 text-[11px] sm:text-xs px-2.5 py-1.5 rounded-2xl rounded-tr-none shadow-lg animate-fadeIn">
              <p className="leading-tight line-clamp-2 sm:line-clamp-none font-medium text-purple-200">
                {transcribedText}
              </p>
              {isSpeaking && (
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping ml-1"></span>
              )}
            </div>
          )}

          <div className="relative shrink-0">
            <img
              src="/img/PersonajeChostito.png"
              alt="Chostito"
              className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full object-cover border-2 transition shadow-lg ${
                isSpeaking
                  ? 'border-cyan-400 shadow-cyan-500/50 scale-105'
                  : 'border-purple-400/70 shadow-purple-900/50'
              }`}
            />
            {isSpeaking && (
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-slate-900 rounded-full"></span>
            )}
          </div>

          {messages.length > 0 && (
            <button
              onClick={handleResetChat}
              title="Limpiar chat"
              className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition border border-slate-700/60 ml-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>


      {/* Chat Messages Body */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-950/40">
        {messages.map((msg) => {
          if (msg.sender === 'user') {
            return (
              <div key={msg.id} className="flex justify-end gap-2.5 items-start">
                <div className="max-w-[85%] sm:max-w-[75%] bg-gradient-to-r from-purple-700 to-indigo-600 text-white rounded-2xl rounded-tr-sm px-4 py-2.5 shadow-lg text-xs sm:text-sm border border-purple-400/30">
                  <p className="leading-relaxed font-medium">{msg.text}</p>
                  <span className="block text-[10px] text-purple-200 text-right mt-1 opacity-80">
                    {msg.time}
                  </span>
                </div>
                <div className="w-7 h-7 rounded-lg bg-indigo-600/40 border border-indigo-400/40 flex items-center justify-center shrink-0 text-white">
                  <User className="w-4 h-4" />
                </div>
              </div>
            );
          }

          return (
            <div key={msg.id} className="flex justify-start gap-2.5 items-start">
              <div className="w-7 h-7 rounded-lg bg-cyan-600/30 border border-cyan-400/40 flex items-center justify-center shrink-0 text-cyan-300 mt-1">
                <Bot className="w-4 h-4" />
              </div>

              <div className="max-w-[92%] sm:max-w-[85%] bg-slate-900/95 border border-slate-800 hover:border-purple-500/40 rounded-2xl rounded-tl-sm p-4 shadow-xl space-y-3 transition">
                {/* Header with Verdict Badge */}
                <div className="flex items-center justify-between gap-2 border-b border-slate-800/70 pb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`text-xs font-black px-2.5 py-0.5 rounded-full border shadow-sm tracking-wider font-tactical ${getBadgeClasses(
                        msg.badgeColor
                      )}`}
                    >
                      {msg.verdict}
                    </span>
                    <span className="text-xs font-bold text-white leading-snug">
                      {msg.headline}
                    </span>
                  </div>

                  <button
                    onClick={() => handleCopy(msg)}
                    title="Copiar respuesta"
                    className="shrink-0 p-1.5 rounded-lg bg-slate-800/60 hover:bg-slate-700 text-slate-400 hover:text-cyan-400 transition"
                  >
                    {copiedId === msg.id ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>

                {/* Human Explanation */}
                <p className="text-xs sm:text-[13px] text-slate-200 leading-relaxed font-normal">
                  {msg.explanation}
                </p>

                {/* Official Rule Reference Box */}
                {msg.ruleReference && (
                  <div className="flex items-center gap-1.5 text-[11px] text-cyan-300/90 bg-cyan-950/30 border border-cyan-500/20 px-2.5 py-1.5 rounded-lg">
                    <BookOpen className="w-3.5 h-3.5 shrink-0 text-cyan-400" />
                    <span className="font-semibold truncate">
                      {msg.ruleReference}
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {isTyping && (
          <div className="flex items-center gap-2 text-slate-400 text-xs p-2">
            <div className="w-6 h-6 rounded-lg bg-cyan-950/40 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Bot className="w-3.5 h-3.5 animate-spin" />
            </div>
            <div className="flex gap-1 items-center bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce"></span>
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.2s]"></span>
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.4s]"></span>
              <span className="text-[11px] text-slate-400 ml-1">Consultando normativa...</span>
            </div>
          </div>
        )}

        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3 my-auto">
            <div className="w-16 h-16 rounded-full p-0.5 bg-gradient-to-tr from-purple-500 to-cyan-400 shadow-xl shadow-purple-950/50">
              <img
                src="/img/PersonajeChostito.png"
                alt="Chostito"
                className="w-full h-full object-cover rounded-full"
              />
            </div>
            <div>
              <h4 className="text-white font-tactical font-black text-sm tracking-wide">
                ¿Qué duda tienes sobre la normativa?
              </h4>
              <p className="text-xs text-slate-400 max-w-sm mt-1">
                Escribe tu consulta abajo y Chostito te responderá con un Sí o No directo basado en las reglas del servidor.
              </p>
            </div>
          </div>
        )}

        <div ref={chatBottomRef} />
      </div>

      {/* Input Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="p-3 bg-slate-950/90 border-t border-slate-800/80 flex items-center gap-2"
      >
        <div className="relative flex-1">
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder="Pregunta algo..."
            className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 shadow-inner"
          />
        </div>


        <button
          type="submit"
          disabled={!inputQuery.trim() || isTyping}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-lg shadow-purple-950/50 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition"
        >
          <span>Preguntar</span>
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};
