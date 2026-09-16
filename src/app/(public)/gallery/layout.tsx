import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Gallery',
  description: 'Photos and videos from NEUCC events over the years.',
};

export default function GalleryLayout({ children }: { children: React.ReactNode }) {
  return children;
}
