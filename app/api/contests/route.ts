import { NextResponse } from 'next/server';

// Mock contest data
const contests = [
  {
    id: '1',
    title: 'UI Design Challenge',
    description: 'Design a modern dashboard UI for a fintech app.',
    budget: '$500',
    deadline: '3 days',
    submissions: 12,
    category: 'Design',
    client: { name: 'Acme Corp', rating: 4.9 },
  },
  {
    id: '2',
    title: 'Landing Page Redesign',
    description: 'Redesign the landing page for a SaaS product.',
    budget: '$300',
    deadline: '7 days',
    submissions: 8,
    category: 'Web Development',
    client: { name: 'Beta LLC', rating: 4.7 },
  },
  {
    id: '3',
    title: 'Logo for Startup',
    description: 'Create a unique logo for a new tech startup.',
    budget: '$200',
    deadline: '24 hours',
    submissions: 20,
    category: 'Design',
    client: { name: 'Gamma Start', rating: 5.0 },
  },
];

export async function GET() {
  return NextResponse.json(contests);
}
