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
              className="group relative aspect-square overflow-hidden rounded-xl border border-border bg-background"
            >
              <Image
                src={item.url}
                alt={item.eventName ?? 'NEUCC gallery media'}
                fill
                sizes="(min-width: 1024px) 16vw, (min-width: 640px) 33vw, 50vw"
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent p-3 pt-10 opacity-0 transition-opacity group-hover:opacity-100">
                <p className="truncate text-xs font-semibold text-white">{item.eventName ?? 'NEUCC moment'}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
