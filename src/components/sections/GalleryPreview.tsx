import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { prisma } from '@/lib/prisma';

export async function GalleryPreview() {
  const preview = await prisma.galleryItem.findMany({ orderBy: { createdAt: 'desc' }, take: 6 });

  return (
    <section className="bg-surface py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-2xl font-bold text-text-main sm:text-3xl">
            Gallery
          </h2>
          <Link
            href="/gallery"
            className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:text-primary-hover"
          >
            View All
            <ArrowRight size={14} />
          </Link>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {preview.map((item) => (
            <div
              key={item.id}
              className="relative aspect-square overflow-hidden rounded-xl border border-border"
            >
              <Image
                src={item.url}
                alt={item.eventName ?? 'NEUCC gallery media'}
                fill
                sizes="(min-width: 1024px) 16vw, (min-width: 640px) 33vw, 50vw"
                className="object-cover transition-transform hover:scale-105"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
