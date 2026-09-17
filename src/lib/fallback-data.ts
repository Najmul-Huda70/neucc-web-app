export const fallbackEvents = [
  {
    id: 'evt-1',
    title: 'Algorithm Sprint 2026',
    date: '2026-11-12',
    time: '10:00 AM',
    venue: 'CSE Lab 204',
    description: 'A hands-on algorithm challenge for club members and aspiring competitive programmers.',
    category: 'COMPETITION',
    status: 'UPCOMING',
    guests: 'Dr. A. Rahman',
    registrationLink: '#',
  },
  {
    id: 'evt-2',
    title: 'Cyber Security Workshop',
    date: '2026-10-08',
    time: '2:00 PM',
    venue: 'Seminar Hall',
    description: 'A workshop covering fundamentals of ethical hacking, threat analysis, and digital safety.',
    category: 'WORKSHOP',
    status: 'UPCOMING',
    guests: 'Guest Speaker: Int. Security Lead',
    registrationLink: '#',
  },
  {
    id: 'evt-3',
    title: 'Product Design Meetup',
    date: '2026-09-28',
    time: '11:30 AM',
    venue: 'Innovation Hub',
    description: 'A community meetup focused on UI/UX, product thinking, and building practical user-centered experiences.',
    category: 'MEETUP',
    status: 'UPCOMING',
    guests: 'Industry Panel',
    registrationLink: '#',
  },
  {
    id: 'evt-4',
    title: 'Web Development Bootcamp',
    date: '2026-08-12',
    time: '9:30 AM',
    venue: 'Computer Center',
    description: 'Learn modern web development with Next.js, TypeScript, and full-stack patterns.',
    category: 'WORKSHOP',
    status: 'PAST',
    guests: 'Faculty Mentor',
    registrationLink: null,
  },
];

export const fallbackAchievements = [
  {
    id: 'ach-1',
    title: 'ICPC Regional Qualifier',
    description: 'NEUCC team secured a qualifying position in the regional programming competition.',
    date: '2025-12-18',
    awardingOrg: 'ICPC',
    image: '',
  },
  {
    id: 'ach-2',
    title: 'National CTF Finalists',
    description: 'Our club reached the semifinal stage in a National Cyber Security Challenge.',
    date: '2025-11-08',
    awardingOrg: 'National Cyber League',
    image: '',
  },
  {
    id: 'ach-3',
    title: 'Hackathon Innovation Award',
    description: 'The club won the Best Innovation track in the university hackathon.',
    date: '2025-06-22',
    awardingOrg: 'University Innovation Fest',
    image: '',
  },
];

export const fallbackSiteContent = [
  { key: 'about.mission', value: 'To build a thriving technology community where students learn, innovate, and collaborate through computing and creativity.' },
  { key: 'about.vision', value: 'To become the leading student-driven technology platform for practical learning, leadership, and innovation on campus.' },
  { key: 'about.history', value: 'NEUCC was established to create a space where students could explore computing beyond the classroom, build projects, and grow into confident technology leaders.' },
  { key: 'home.chairpersonMessage', value: 'We believe every student deserves a space to learn, build, and lead. NEUCC is that space.' },
  { key: 'home.moderatorMessage', value: 'Our club promotes curiosity, problem solving, and teamwork through technology and community learning.' },
];

export const fallbackNotices = [
  {
    id: 'notice-1',
    title: 'General Meeting for New Members',
    content: 'This is a public notice for the general club meeting. All members are encouraged to attend.',
    date: '2026-09-15',
    pinned: true,
    category: 'Notice',
    scope: 'GENERAL',
  },
  {
    id: 'notice-2',
    title: 'Executive Committee Update',
    content: 'The Executive Committee has scheduled an internal review session for upcoming events and budget planning.',
    date: '2026-09-14',
    pinned: false,
    category: 'Event Update',
    scope: 'INTERNAL',
  },
];

export const fallbackContests = [
  {
    id: 'contest-1',
    name: 'Algorithm Sprint 2026',
    date: '2026-11-12',
    type: 'PROGRAMMING',
    result: 'Registration open',
    isUpcoming: true,
    registrationLink: '#',
  },
  {
    id: 'contest-2',
    name: 'NEUCC CTF Challenge',
    date: '2026-08-14',
    type: 'CTF',
    result: 'Champion: Team ZeroDay',
    isUpcoming: false,
  },
  {
    id: 'contest-3',
    name: 'Campus Hackfest',
    date: '2026-05-23',
    type: 'HACKATHON',
    result: 'Winner: Team CampusConnect',
    isUpcoming: false,
  },
];

export const fallbackSponsors = [
  {
    id: 'sponsor-1',
    name: 'CodeWave Labs',
    logo: null,
    tier: 'GOLD',
    description: 'Supporting student innovation in software and product building.',
  },
  {
    id: 'sponsor-2',
    name: 'DataSphere',
    logo: null,
    tier: 'SILVER',
    description: 'Partner for data and analytics learning opportunities.',
  },
];

export const fallbackGallery = [
  {
    id: 'gallery-1',
    title: 'Programming Contest',
    event: 'Algorithm Sprint',
    year: '2026',
    type: 'photo',
    url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'gallery-2',
    title: 'Workshop Session',
    event: 'Cyber Security Workshop',
    year: '2026',
    type: 'photo',
    url: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=900&q=80',
  },
];

export const fallbackCommittees = [
  {
    id: 'committee-1',
    type: 'EXECUTIVE',
    status: 'ACTIVE',
    startDate: '2026-01-01T00:00:00.000Z',
    endDate: '2027-01-01T00:00:00.000Z',
  },
];
