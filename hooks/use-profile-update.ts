"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface ProfileUpdateData {
  name?: string;
  avatar?: string;
  profile?: {
    title?: string;
    location?: string;
    bio?: string;
    skills?: any[];
    endorsements?: any[];
  };
}

export function useProfileUpdate() {
  const [isUpdating, setIsUpdating] = useState(false);
  const queryClient = useQueryClient();

  const updateProfile = useMutation({
    mutationFn: async (data: ProfileUpdateData) => {
      setIsUpdating(true);
      try {
        const response = await fetch("/api/profile/update", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          const error = await response.text();
          throw new Error(error || "Failed to update profile");
        }

        return await response.json();
      } finally {
        setIsUpdating(false);
      }
    },
    onSuccess: () => {
      // Invalidate and refetch the profile data
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });

  return {
    updateProfile,
    isUpdating,
  };
}
