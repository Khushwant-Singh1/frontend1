import { NextResponse } from 'next/server';

// Mock freelancer data
const freelancers = [
  {
    id: '1',
    name: 'Jane Doe',
    title: 'UI/UX Designer',
    rating: 4.9,
    completedProjects: 32,
    hourlyRate: '$40',
    skills: ['UI Design', 'Figma', 'Prototyping'],
    avatar: '/placeholder-user.jpg',
  },
  {
    id: '2',
    name: 'John Smith',
    title: 'Full Stack Developer',
    rating: 4.8,
    completedProjects: 27,
    hourlyRate: '$50',
    skills: ['React', 'Node.js', 'TypeScript'],
    avatar: '/placeholder-user.jpg',
  },
  {
    id: '3',
    name: 'Emily Chen',
    title: 'Content Writer',
    rating: 4.7,
    completedProjects: 19,
    hourlyRate: '$30',
    skills: ['Writing', 'SEO', 'Editing'],
    avatar: '/placeholder-user.jpg',
  },
];

export async function GET() {
  return NextResponse.json(freelancers);
}
