import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  MessageCircle,
  MessageSquareText,
  RotateCcw,
  Send,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import { useI18n } from '../context/I18nContext';
import { useSite } from '../context/SiteContext';
import { apiFetch } from '../lib/api';

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
}

const INTERNAL_ROUTE_RE =
  /(`?\/(?:portfolio|projects)(?:\/[a-z0-9-]+)?`?|`?\/(?:about|visits|katara|gallery|videos|contact)\b`?)/gi;

function renderInlineFormatting(text: string, onNavigate: () => void): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  const boldSplit = text.split(/(\*\*[^*]+\*\*)/g);

  boldSplit.forEach((segment, segIdx) => {
    const isBold = segment.startsWith('**') && segment.endsWith('**') && segment.length > 4;
    const cleanText = isBold ? segment.slice(2, -2) : segment;
    const routeParts = cleanText.split(INTERNAL_ROUTE_RE);

    routeParts.forEach((part, partIdx) => {
      if (!part) return;
      const unquoted = part.replace(/^`|`$/g, '');
      const isRoute =
        /^\/(?:portfolio|projects)(?:\/[a-z0-9-]+)?$/i.test(unquoted) ||
        /^\/(?:about|visits|katara|gallery|videos|contact)$/i.test(unquoted);

      if (isRoute) {
        nodes.push(
          <Link
            key={`lnk-${segIdx}-${partIdx}`}
            to={unquoted}
            onClick={onNavigate}
            dir="ltr"
            className="mx-0.5 inline-flex items-center rounded-[2px] border border-[#B5945B]/40 bg-[#B5945B]/15 px-1.5 py-0.5 text-xs font-semibold text-[#EAD4A5] underline decoration-[#B5945B]/50 underline-offset-2 transition-colors hover:bg-[#B5945B]/25 hover:text-white"
          >
            {unquoted}
          </Link>,
        );
      } else if (isBold) {
        nodes.push(
          <strong key={`bld-${segIdx}-${partIdx}`} className="font-bold text-[#EAD4A5]">
            {part}
          </strong>,
        );
      } else {
        nodes.push(<React.Fragment key={`txt-${segIdx}-${partIdx}`}>{part}</React.Fragment>);
      }
    });
  });

  return nodes;
}

function FormattedMessage({ text, onNavigate }: { text: string; onNavigate: () => void }) {
  const lines = text.split('\n');
  const blocks: React.ReactNode[] = [];
  let listItems: string[] = [];

  const flushList = (keyPrefix: string) => {
    if (listItems.length === 0) return;
    blocks.push(
      <ul key={keyPrefix} className="my-1.5 space-y-1.5 ps-4 list-disc marker:text-[#B5945B]">
        {listItems.map((item, idx) => (
          <li key={`${keyPrefix}-${idx}`} className="leading-relaxed">
            {renderInlineFormatting(item, onNavigate)}
          </li>
        ))}
      </ul>,
    );
    listItems = [];
  };

  lines.forEach((rawLine, idx) => {
    const line = rawLine.trim();
    if (!line) {
      flushList(`list-${idx}`);
      return;
    }

    const bulletMatch = line.match(/^(?:[-*•]|\d+\.)\s+(.+)$/);
    if (bulletMatch) {
      listItems.push(bulletMatch[1]);
      return;
    }

    flushList(`list-before-${idx}`);
    blocks.push(
      <p key={`p-${idx}`} className="leading-relaxed">
        {renderInlineFormatting(line, onNavigate)}
      </p>,
    );
  });

  flushList('list-end');

  return <div className="space-y-2">{blocks}</div>;
}

export function FactoryChatbot() {
  const { pick } = useI18n();
  const { settings, openQuoteDrawer } = useSite();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [lastFailedPrompt, setLastFailedPrompt] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  const logoSrc = settings?.hero.logoUrl || '/logo.jpeg';
  const whatsappNum = settings?.contact.whatsapp || '97455598944';
  const whatsappUrl = `https://wa.me/${whatsappNum}?text=${encodeURIComponent(
    pick('Hello Al Watan Al Arabi Factory', 'مرحباً مصنع الوطن العربي'),
  )}`;

  const quickPrompts = [
    pick(
      'What are the factory manufacturing divisions?',
      'ما هي أقسام التصنيع والتجهيز في المصنع؟',
    ),
    pick(
      'Tell me about caravan and GMC conversions',
      'ما أبرز تجهيزات الكرفانات والجموس والمجالس؟',
    ),
    pick(
      'Tell me about Katara & Suhail exhibitions',
      'حدثني عن مشاركات معارض كتارا وسهيل والزيارات',
    ),
    pick(
      'Where is the factory located & working hours?',
      'أين موقع المصنع وما هي ساعات العمل والتواصل؟',
    ),
  ];

  useEffect(() => {
    if (open) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, sending, open]);

  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => inputRef.current?.focus(), 120);
      return () => clearTimeout(timer);
    }
  }, [open]);

  const sendMessage = async (textToSend?: string) => {
    const cleanText = (textToSend ?? input).trim();
    if (!cleanText || sending) return;

    const historySnapshot = messages.map((m) => ({ role: m.role, text: m.text }));
    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      text: cleanText,
    };

    if (!textToSend) {
      setInput('');
    }
    setErrorMsg(null);
    setLastFailedPrompt(null);
    setMessages((prev) => [...prev, userMsg]);
    setSending(true);

    try {
      const data = await apiFetch<{ reply: string }>('/api/chat', {
        method: 'POST',
        body: JSON.stringify({
          message: cleanText,
          history: historySnapshot,
        }),
      });
      const assistantMsg: ChatMessage = {
        id: `m-${Date.now()}`,
        role: 'model',
        text: data.reply,
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : pick('Unable to process your inquiry right now.', 'تعذر معالجة الاستفسار حالياً.');
      setErrorMsg(msg);
      setLastFailedPrompt(cleanText);
    } finally {
      setSending(false);
    }
  };

  const handleRetry = () => {
    if (!lastFailedPrompt || sending) return;
    const promptToRetry = lastFailedPrompt;
    setMessages((prev) => {
      const last = prev[prev.length - 1];
      if (last && last.role === 'user' && last.text === promptToRetry) {
        return prev.slice(0, -1);
      }
      return prev;
    });
    sendMessage(promptToRetry);
  };

  const handleReset = () => {
    setMessages([]);
    setErrorMsg(null);
    setLastFailedPrompt(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={pick('Ask Factory Advisor', 'اسأل مستشار المشاريع')}
        className="fixed bottom-20 end-5 z-40 inline-flex h-11 items-center gap-2 rounded-[4px] border border-[#B5945B]/60 bg-[#09090B]/95 px-4 text-xs font-bold text-[#EAD4A5] shadow-[0_12px_30px_-10px_rgba(0,0,0,0.75)] backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 hover:border-[#EAD4A5] hover:shadow-[0_14px_34px_-10px_rgba(234,212,165,0.45)] whitespace-nowrap cursor-pointer"
      >
        <MessageSquareText size={16} className="text-[#EAD4A5]" />
        <span>{pick('Project Advisor', 'مستشار المشاريع')}</span>
      </button>
    );
  }

  return (
    <section
      aria-label={pick('Al Watan Al Arabi Factory Advisor', 'مستشار مصنع الوطن العربي')}
      className="fixed bottom-5 end-5 z-50 flex h-[590px] max-h-[85vh] w-[calc(100vw-2rem)] max-w-[420px] flex-col overflow-hidden rounded-[6px] border border-[#B5945B]/45 bg-[#0B0B0E] text-white shadow-[0_24px_64px_-12px_rgba(0,0,0,0.88)]"
    >
      <div
        aria-hidden="true"
        className="h-[2px] w-full shrink-0 bg-gradient-to-r from-[#8A6D3B] via-[#EAD4A5] to-[#8A6D3B]"
      />

      {/* Header */}
      <header className="flex shrink-0 items-center justify-between gap-3 border-b border-zinc-800 bg-[#09090B] px-4 py-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[4px] border border-[#B5945B]/45 bg-white p-0.5">
            <img
              src={logoSrc}
              alt={pick('Al Watan Al Arabi Factory', 'مصنع الوطن العربي')}
              referrerPolicy="no-referrer"
              className="h-full w-full object-contain"
            />
          </div>
          <div className="min-w-0">
            <h2 className="font-display truncate text-sm font-bold text-[#EAD4A5]">
              {pick('Factory Project Advisor', 'مستشار مصنع الوطن العربي')}
            </h2>
            <p className="truncate text-[11px] text-zinc-400">
              {pick('Instant guide to divisions & builds', 'مساعدك الفوري لتفاصيل الأقسام والمشاريع')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {messages.length > 0 ? (
            <button
              type="button"
              onClick={handleReset}
              title={pick('New conversation', 'محادثة جديدة')}
              aria-label={pick('New conversation', 'محادثة جديدة')}
              className="flex h-8 w-8 items-center justify-center rounded-[3px] border border-zinc-800 bg-[#141418] text-zinc-300 transition-colors hover:border-[#B5945B] hover:text-[#EAD4A5] cursor-pointer"
            >
              <RotateCcw size={14} />
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label={pick('Close chat', 'إغلاق المحادثة')}
            className="flex h-8 w-8 items-center justify-center rounded-[3px] border border-zinc-800 bg-[#141418] text-zinc-300 transition-colors hover:border-[#B5945B] hover:text-[#EAD4A5] cursor-pointer"
          >
            <X size={15} />
          </button>
        </div>
      </header>

      {/* Messages Area */}
      <div className="flex-1 space-y-3.5 overflow-y-auto px-4 py-4">
        <div className="max-w-[95%] rounded-[5px] border border-[#B5945B]/30 bg-[#141418] px-3.5 py-3 text-sm leading-relaxed text-zinc-200">
          <p className="font-semibold text-[#EAD4A5]">
            {pick(
              'Welcome to Al Watan Al Arabi Factory.',
              'أهلاً بك في مصنع الوطن العربي.',
            )}
          </p>
          <p className="mt-1 text-xs leading-relaxed text-zinc-300">
            {pick(
              'Ask me about our 8 manufacturing divisions, published vehicle & caravan builds, Katara & Suhail exhibitions, custom design options, or factory hours in Doha.',
              'اسألني عن أي تفاصيل تخص أقسام التصنيع والتجهيز، النماذج والمشاريع المنشورة، معارض كتارا وسهيل، خيارات الطلب المخصص، أو موقع المصنع وساعات العمل.',
            )}
          </p>

          {messages.length === 0 ? (
            <div className="mt-3 grid grid-cols-1 gap-1.5">
              {quickPrompts.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => sendMessage(prompt)}
                  disabled={sending}
                  className="rounded-[4px] border border-zinc-800 bg-[#0B0B0E] px-3 py-2 text-start text-xs font-medium text-zinc-200 transition-colors hover:border-[#B5945B]/60 hover:text-[#EAD4A5] disabled:opacity-50 cursor-pointer"
                >
                  {prompt}
                </button>
              ))}
            </div>
          ) : null}
        </div>

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={
                msg.role === 'user'
                  ? 'max-w-[85%] rounded-[5px] border border-[#B5945B]/50 bg-gradient-to-br from-[#B5945B]/25 to-[#8A6D3B]/15 px-3.5 py-2.5 text-sm leading-relaxed text-[#F5EAD0]'
                  : 'max-w-[94%] rounded-[5px] border border-zinc-800 bg-[#141418] px-3.5 py-3 text-sm text-zinc-200'
              }
            >
              {msg.role === 'user' ? (
                <p className="whitespace-pre-wrap">{msg.text}</p>
              ) : (
                <FormattedMessage text={msg.text} onNavigate={() => setOpen(false)} />
              )}
            </div>
          </div>
        ))}

        {sending ? (
          <div className="flex items-start">
            <div className="inline-flex items-center gap-2 rounded-[5px] border border-zinc-800 bg-[#141418] px-3.5 py-2.5 text-xs text-zinc-300">
              <span className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#EAD4A5]" />
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#B5945B] [animation-delay:150ms]" />
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#8A6D3B] [animation-delay:300ms]" />
              </span>
              <span>{pick('Preparing your reply...', 'جاري تجهيز الرد...')}</span>
            </div>
          </div>
        ) : null}

        {errorMsg ? (
          <div className="rounded-[5px] border border-red-500/40 bg-red-950/30 px-3.5 py-2.5 text-xs text-red-200">
            <p>{errorMsg}</p>
            {lastFailedPrompt ? (
              <button
                type="button"
                onClick={handleRetry}
                className="mt-2 inline-flex items-center gap-1 rounded-[3px] border border-red-400/50 bg-red-900/40 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-red-900/60 cursor-pointer"
              >
                <RotateCcw size={12} />
                <span>{pick('Retry', 'إعادة المحاولة')}</span>
              </button>
            ) : null}
          </div>
        ) : null}

        <div ref={bottomRef} />
      </div>

      {/* Quick Actions Bar */}
      <div className="flex shrink-0 items-center justify-between gap-2 border-t border-zinc-800/90 bg-[#0F0F13] px-3.5 py-2">
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            openQuoteDrawer();
          }}
          className="inline-flex items-center gap-1.5 rounded-[3px] border border-[#B5945B]/50 bg-[#B5945B]/15 px-2.5 py-1.5 text-[11px] font-semibold text-[#EAD4A5] transition-colors hover:bg-[#B5945B]/25 cursor-pointer"
        >
          <SlidersHorizontal size={12} />
          <span>{pick('Custom Design Request', 'تقديم طلب تصميم مخصص')}</span>
        </button>

        <a
          href={whatsappUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 rounded-[3px] bg-[#128C7E] px-2.5 py-1.5 text-[11px] font-semibold text-white transition-colors hover:bg-[#0E7468]"
        >
          <MessageCircle size={12} />
          <span>{pick('WhatsApp', 'واتساب')}</span>
        </a>
      </div>

      {/* Input Composer */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          sendMessage();
        }}
        className="flex shrink-0 items-end gap-2 border-t border-zinc-800 bg-[#09090B] p-3"
      >
        <textarea
          ref={inputRef}
          rows={1}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={pick('Write your inquiry about any project...', 'اكتب استفسارك حول أي مشروع أو تجهيز...')}
          disabled={sending}
          className="max-h-24 min-h-[40px] flex-1 resize-none rounded-[4px] border border-zinc-700 bg-[#141418] px-3 py-2.5 text-xs text-white placeholder:text-zinc-500 focus:border-[#B5945B] focus:outline-none disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={sending || !input.trim()}
          aria-label={pick('Send', 'إرسال')}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[4px] bg-gradient-to-r from-[#B5945B] via-[#DFC38C] to-[#B5945B] text-[#09090B] transition-all hover:brightness-110 disabled:opacity-40 cursor-pointer"
        >
          <Send size={15} />
        </button>
      </form>
    </section>
  );
}
