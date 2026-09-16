export type EventCategory = 'WORKSHOP' | 'SEMINAR' | 'COMPETITION' | 'MEETUP';
export type EventStatus = 'UPCOMING' | 'PAST' | 'CANCELLED';

export interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  venue: string;
  description: string;
  category: EventCategory;
  status: EventStatus;
  guests: string | null;
  registrationLink?: string | null;
}

export interface ExecutiveSocialLinks {
  linkedin?: string;
  github?: string;
  facebook?: string;
}

export interface Executive {
  id: string;
  name: string;
  designation: string | null;
  photo: string | null;
  rank: number;
  year: string;
  social?: ExecutiveSocialLinks;
}

export type ContestType = 'PROGRAMMING' | 'CTF' | 'HACKATHON';

export interface Contest {
  id: string;
  name: string;
  date: string;
  isUpcoming?: boolean;
  type: ContestType;
  result: string | null;
  registrationLink?: string | null;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  date: string;
  organization?: string;
  image: string;
}

export type AnnouncementCategory = 'Result' | 'Notice' | 'Event Update';

export interface Announcement {
  id: string;
  title: string;
  content: string;
  date: string;
  pinned: boolean;
  category: AnnouncementCategory;
}

export type SponsorTier = 'PLATINUM' | 'GOLD' | 'SILVER';

export interface Sponsor {
  id: string;
  name: string;
  logo: string | null;
  tier: SponsorTier;
  description: string | null;
}

export type GalleryMediaType = 'photo' | 'video';

export interface GalleryItem {
  id: string;
  title: string;
  event: string | null;
  year: string;
  type: GalleryMediaType;
  url: string;
}
