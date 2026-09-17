'use client';

import { Share2 } from 'lucide-react';

export function ShareEventButton({ title, description }: { title: string; description: string }) {
  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title, text: description, url });
      return;
    }
    await navigator.clipboard?.writeText(url);
  };

  return (
    <button
      type="button"
      className="inline-flex items-center gap-2 rounded-lg border border-border px-5 py-3 text-sm font-semibold text-text-main transition-colors hover:bg-background"
      onClick={handleShare}
    >
      <Share2 size={16} />
      Share event
    </button>
  );
}