import { useMutation } from '@tanstack/react-query';

export function useSignupMutation() {
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Signup failed');
      return response.json();
    },
  });
}
