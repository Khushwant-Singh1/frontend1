import { useQuery } from '@tanstack/react-query';

export function useContestsQuery() {
  return useQuery({
    queryKey: ['contests'],
    queryFn: async () => {
      const res = await fetch('/api/contests');
      if (!res.ok) throw new Error('Failed to fetch contests');
      return res.json();
    },
  });
}

export function useFreelancersQuery() {
  return useQuery({
    queryKey: ['freelancers'],
    queryFn: async () => {
      const res = await fetch('/api/freelancers');
      if (!res.ok) throw new Error('Failed to fetch freelancers');
      return res.json();
    },
  });
}
