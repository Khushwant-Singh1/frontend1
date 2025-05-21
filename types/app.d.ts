// All shared interfaces/types for the frontend app

// Profile-related
export interface Endorsement {
  id: string;
  from: string;
  skill: string;
  message?: string;
  name?: string;
  avatar?: string;
}

export interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  image?: string;
  link?: string;
}

export interface SkillItem {
  id: string;
  name: string;
  level: number;
}

export interface ProfileData {
  bio?: string;
  skills?: SkillItem[];
  portfolio?: PortfolioItem[];
  endorsements?: Endorsement[];
  achievements?: any[];
  xp?: number;
  level?: number;
  streak?: number;
  title?: string;
  location?: string;
}

export interface Profile {
  id: string;
  name: string;
  title?: string;
  location?: string;
  avatar?: string;
  role: "FREELANCER" | "CLIENT";
  rating?: number;
  reviewCount?: number;
  profile?: ProfileData;
}

export type EditData = Pick<Profile, 'name' | 'title' | 'location'> & Pick<ProfileData, 'bio'>;

export interface XPAnimation {
  amount: number;
  isShowing: boolean;
}

// Contest-related
export interface Contest {
  id: string;
  title: string;
  description?: string;
  budget: string;
  deadline: string;
  submissions: number;
  category?: string;
  client?: {
    name: string;
    rating: number;
  };
}

// Freelancer-related
export interface Freelancer {
  id: string;
  name: string;
  title: string;
  rating: number;
  completedProjects: number;
  hourlyRate: string;
  skills: string[];
  avatar: string;
}

// Other shared types can be added here
