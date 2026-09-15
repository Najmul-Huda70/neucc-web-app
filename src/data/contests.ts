import type { Contest } from '@/types/types';

export const contests: Contest[] = [
  {
    id: 'con-01',
    name: 'NEUCC Programming Contest 2026',
    date: '2026-03-15',
    type: 'Programming',
    result: 'Champion: Team ByteForce',
    winners: [
      { name: 'Team ByteForce', rank: 1 },
      { name: 'Team NullPointer', rank: 2 },
      { name: 'Team StackOverflow', rank: 3 },
    ],
  },
  {
    id: 'con-02',
    name: 'Inter-University CTF Challenge',
    date: '2026-04-20',
    type: 'CTF',
    result: 'Runner-up: Team CipherSquad',
    winners: [
      { name: 'Team HexDump', rank: 1 },
      { name: 'Team CipherSquad', rank: 2 },
      { name: 'Team RootAccess', rank: 3 },
    ],
  },
  {
    id: 'con-03',
    name: 'NEUCC Hackathon 2025',
    date: '2025-11-08',
    type: 'Hackathon',
    result: 'Winner: Team CampusConnect',
    winners: [
      { name: 'Team CampusConnect', rank: 1 },
      { name: 'Team EcoTrack', rank: 2 },
    ],
  },
  {
    id: 'con-04',
    name: 'ICPC Regional Preliminary',
    date: '2026-02-10',
    type: 'Programming',
    result: 'Qualified for Regionals: 2 teams',
    winners: [
      { name: 'Team ByteForce', rank: 1 },
      { name: 'Team LogicGate', rank: 2 },
    ],
  },
  {
    id: 'con-05',
    name: 'National University CTF 2025',
    date: '2025-09-05',
    type: 'CTF',
    result: 'Champion: Team RootAccess',
    winners: [
      { name: 'Team RootAccess', rank: 1 },
      { name: 'Team HexDump', rank: 2 },
      { name: 'Team ZeroDay', rank: 3 },
    ],
  },
  {
    id: 'con-06',
    name: 'Summer Hackfest 2025',
    date: '2025-06-21',
    type: 'Hackathon',
    result: 'Winner: Team EcoTrack',
    winners: [
      { name: 'Team EcoTrack', rank: 1 },
      { name: 'Team AgriSense', rank: 2 },
    ],
  },
  {
    id: 'con-07',
    name: 'Upcoming: IUPC Selection Round 2026',
    date: '2026-12-05',
    type: 'Programming',
    result: 'Registration open',
    winners: [],
    registrationLink: 'https://forms.gle/neucc-iupc-2026',
  },
  {
    id: 'con-08',
    name: 'Winter CTF Sprint 2025',
    date: '2025-12-18',
    type: 'CTF',
    result: 'Champion: Team ZeroDay',
    winners: [
      { name: 'Team ZeroDay', rank: 1 },
      { name: 'Team HexDump', rank: 2 },
    ],
  },
];
