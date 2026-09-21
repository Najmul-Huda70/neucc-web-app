'use client';

import { Share2, Check } from 'lucide-react';
import { useState } from 'react';

export function ShareEventButton({ title, description }: { title: string; description: string }) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const url = typeof window !== 'undefined' ? window.location.href : '';

    if (navigator.share) {
      try {
        await navigator.share({ title, text: description, url });
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        return;
      } catch (err) {
        console.log('Share canceled:', err);
      }
    }

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(url);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = url;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }

      // UI Feedback State
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  return (
    <button
      type="button"
      className={`inline-flex items-center gap-2 rounded-lg border px-5 py-3 text-sm font-semibold transition-all duration-200 active:scale-95 ${
        copied
          ? 'border-green-500 bg-green-500/10 text-green-500'
          : 'border-border text-text-main hover:bg-background'
      }`}
      onClick={handleShare}
    >
      {copied ? <Check size={16} className="animate-in zoom-in" /> : <Share2 size={16} />}
      {copied ? 'Link Copied!' : 'Share event'}
    </button>
  );
}