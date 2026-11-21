import React from 'react';
import { MessageCircle } from 'lucide-react';
import { useI18n } from '../context/I18nContext';
import { useSite } from '../context/SiteContext';

export function WhatsAppFloating() {
  const { pick } = useI18n();
  const { settings } = useSite();
  const phone = settings?.contact.whatsapp || '97455598944';
  const greeting = pick('Hello Al Watan Al Arabi Factory', 'مرحباً مصنع الوطن العربي');
  const href = `https://wa.me/${phone}?text=${encodeURIComponent(greeting)}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label={pick('WhatsApp Contact', 'تواصل عبر واتساب')}
      className="fixed bottom-5 end-5 z-40 inline-flex h-11 items-center gap-2 rounded-[4px] bg-[#128C7E] px-4 text-xs font-semibold text-white shadow-md transition-colors duration-150 hover:bg-[#0E7468] whitespace-nowrap"
    >
      <MessageCircle size={17} />
      <span>{pick('WhatsApp', 'واتساب')}</span>
    </a>
  );
}
