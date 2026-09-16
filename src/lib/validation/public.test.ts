import { describe, expect, it } from 'vitest';
import {
  AchievementCreateSchema,
  CommitteeCreateSchema,
  ContestCreateSchema,
  ElectionCreateSchema,
  GalleryItemCreateSchema,
  PaymentCreateSchema,
  SponsorCreateSchema,
  SiteContentSchema,
  SymbolCreateSchema,
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

    expect(CommitteeCreateSchema.parse({
      type: 'ELECTION',
      status: 'ACTIVE',
      startDate: '2026-01-10',
      endDate: '2026-04-10',
    })).toMatchObject({ type: 'ELECTION' });

    expect(ElectionCreateSchema.parse({
      committeeId: 'committee_123',
      applicationDeadline: '2026-02-01T00:00:00.000Z',
      votingDate: '2026-02-10T00:00:00.000Z',
      applicationFee: 250,
      eligibleBatches: [2021, 2022],
    })).toMatchObject({ applicationFee: 250 });

    expect(SymbolCreateSchema.parse({
      name: 'Boat',
      imageUrl: 'https://example.com/boat.png',
    })).toMatchObject({ name: 'Boat' });

    expect(PaymentCreateSchema.parse({
      candidateId: 'candidate_123',
      method: 'BANK_TRANSFER',
      amount: 250,
      transactionRef: 'TX-1001',
      paidAt: '2026-01-15T00:00:00.000Z',
    })).toMatchObject({ amount: 250 });
  });
});
