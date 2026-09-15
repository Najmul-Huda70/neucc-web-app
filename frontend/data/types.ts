export type EventCategory = 'Workshop' | 'Seminar' | 'Competition' | 'Meetup';
export type EventStatus = 'Upcoming' | 'Past';

export interface EventGuest {
  name: string;
  designation: string;
  role: 'Chief Guest' | 'Special Guest' | 'Session Chair';
}

export interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  venue: string;
  description: string;
  agenda: string[];
  category: EventCategory;
  status: EventStatus;
  guests: EventGuest[];
  participantCount?: number;
  registrationLink?: string;
  image: string;
}

export interface ExecutiveSocialLinks {
  linkedin?: string;
  github?: string;
  facebook?: string;
}

export interface Executive {
  id: string;
  name: string;
  designation: string;
  photo: string;
  rank: number;
  year: string;
  social?: ExecutiveSocialLinks;
}

export type ContestType = 'Programming' | 'CTF' | 'Hackathon';

export interface ContestWinner {
  name: string;
  rank: number;
}

export interface Contest {
  id: string;
  name: string;
  date: string;
  type: ContestType;
  result: string;
  winners: ContestWinner[];
  registrationLink?: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  date: string;
  organization: string;
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

export type SponsorTier = 'Platinum' | 'Gold' | 'Silver';

export interface Sponsor {
  id: string;
  name: string;
  logo: string;
  tier: SponsorTier;
  description: string;
}

export type GalleryMediaType = 'photo' | 'video';

export interface GalleryItem {
  id: string;
  title: string;
  event: string;
  year: string;
  type: GalleryMediaType;
  url: string;
  thumbnail: string;
}
