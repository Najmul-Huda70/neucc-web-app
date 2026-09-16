import { describe, expect, it } from 'vitest';
import {
  AchievementCreateSchema,
  ContestCreateSchema,
  GalleryItemCreateSchema,
  SponsorCreateSchema,
  SiteContentSchema,
} from './public';

describe('public validation schemas', () => {
  it('parses the Sprint 2 content payloads', () => {
    expect(AchievementCreateSchema.parse({
      title: 'Hackathon Winner',
      description: 'Secured the national title.',
      date: '2026-02-04',
      awardingOrg: 'NEUCC',
      photoUrl: 'https://example.com/award.jpg',
    })).toMatchObject({ title: 'Hackathon Winner' });

    expect(ContestCreateSchema.parse({
      name: 'IUPC 2026',
      date: '2026-02-10',
      type: 'PROGRAMMING',
      result: 'Champion',
      registrationLink: 'https://example.com/register',
    })).toMatchObject({ name: 'IUPC 2026' });

    expect(SponsorCreateSchema.parse({
      name: 'Delta Systems',
      tier: 'GOLD',
      description: 'Supporter partner',
      logoUrl: 'https://example.com/logo.png',
    })).toMatchObject({ name: 'Delta Systems' });

    expect(GalleryItemCreateSchema.parse({
      url: 'https://example.com/gallery/1.jpg',
      isVideo: false,
      eventName: 'IUPC 2026',
      year: 2026,
    })).toMatchObject({ url: 'https://example.com/gallery/1.jpg' });

    expect(SiteContentSchema.parse({
      key: 'about.mission',
      value: { text: 'To build great developers.' },
    })).toMatchObject({ key: 'about.mission' });
  });
});
