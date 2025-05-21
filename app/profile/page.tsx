"use client"

import { useEffect, useState, useRef } from "react"
import Image from "next/image"
import { 
  Award, Edit, MapPin, Star, CheckCircle, Lock, TrendingUp, 
  Trophy, UserPlus, Zap, Sparkles, Shield, Target, 
  Flame, BarChart2, Heart, Gift, ArrowUp
} from "lucide-react"
import { motion, AnimatePresence, useAnimation } from "framer-motion"
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query'

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useAuth } from "@/hooks/use-auth"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { cn } from "@/lib/utils"
import { useToast } from "@/components/ui/use-toast"

interface Endorsement {
  id: string;
  from: string;
  skill: string;
  message?: string;
  name?: string;
  avatar?: string;
}

interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  image?: string;
  link?: string;
}

interface SkillItem {
  id: string;
  name: string;
  level: number;
}

interface ProfileData {
  bio?: string;
  skills?: SkillItem[];
  portfolio?: PortfolioItem[];
  endorsements?: Endorsement[];
  achievements?: any[]; // Using any[] since we're using mock data
  xp?: number;
  level?: number;
  streak?: number;
  title?: string;
  location?: string;
}

interface Profile {
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

type EditData = Pick<Profile, 'name' | 'title' | 'location'> & Pick<ProfileData, 'bio'>

interface XPAnimation {
  amount: number;
  isShowing: boolean;
}

// Custom hook to fetch profile data

export default function ProfilePage() {
  const { user, isAuthenticated, isLoading } = useAuth({ required: true })
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState("portfolio")
  const [editOpen, setEditOpen] = useState(false)
  const [editData, setEditData] = useState<EditData>({ name: '', title: '', location: '', bio: '' })
  const [isAnimating, setIsAnimating] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [xpAnimation, setXpAnimation] = useState<XPAnimation>({ amount: 0, isShowing: false })
  const { toast } = useToast()
  
  // Animation controls
  const controls = useAnimation()
  const circleBadgeControls = useAnimation()
  const pulsingOrb = useAnimation()
  
  // Refs for scroll animations
  const achievementsRef = useRef<HTMLDivElement | null>(null)
  const portfolioRef = useRef<HTMLDivElement | null>(null)
  const reviewsRef = useRef<HTMLDivElement | null>(null)

  // Run initial animations
  useEffect(() => {
    const sequence = async () => {
      await controls.start({ opacity: 1, y: 0, transition: { duration: 0.5 } })
      circleBadgeControls.start({ 
        scale: [1, 1.05, 1],
        transition: { repeat: Infinity, duration: 2 }
      })
      pulsingOrb.start({
        scale: [1, 1.2, 1],
        opacity: [0.7, 1, 0.7],
        transition: { repeat: Infinity, duration: 3 }
      })
    }
    sequence()
  }, [controls, circleBadgeControls, pulsingOrb])

  useEffect(() => {
    if (!user) return
    setLoading(true)
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {        
        setProfile(data)
        setEditData({
          name: data.name || '',
          title: data.profile?.title || '',
          location: data.profile?.location || '',
          bio: data.profile?.bio || '',
        })
        setLoading(false)
      })
      .catch((error) => {
        console.error("Error fetching profile:", error)
        toast({
          title: "Error loading profile",
          description: "Please try again later",
          variant: "destructive",
        })
        setLoading(false)
      })
  }, [user, toast])

  // Scroll animation observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-in-up')
          }
        })
      },
      { threshold: 0.1 }
    )
    
    const sections = [achievementsRef.current, portfolioRef.current, reviewsRef.current]
    sections.forEach(section => {
      if (section) observer.observe(section)
    })
    
    return () => {
      sections.forEach(section => {
        if (section) observer.unobserve(section)
      })
    }
  }, [profile])

  // Helper: update both user and profile fields
  const handleEditChange = (field: keyof EditData, value: string) => {
    setEditData((prev) => ({ ...prev, [field]: value }))
  }

  // Show XP animation
  const showXPAnimation = (amount: number) => {
    setXpAnimation({ amount, isShowing: true })
    setTimeout(() => setXpAnimation({ amount: 0, isShowing: false }), 2000)
  }

  // Save profile changes with visual feedback
  const handleSaveChanges = async () => {
    setSaving(true)
    try {
      const response = await fetch("/api/auth/me", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: editData.name,
          title: editData.title,
          location: editData.location,
          bio: editData.bio,
          xp: (profile?.profile?.xp || 0) + 25, // Increment XP for updating profile
          level: profile?.profile?.level || 1,
          streak: profile?.profile?.streak || 0,
        }),
      })
      
      if (!response.ok) {
        throw new Error("Failed to update profile")
      }
      
      const updatedData = await response.json()
      
      // Update local state with the changes
      setProfile(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          name: editData.name,
          profile: {
            ...(prev.profile || {}),
            bio: editData.bio,
            xp: (prev.profile?.xp || 0) + 25,
          },
        };
      });
      
      // Show XP animation
      showXPAnimation(25);
      
      // Show visual feedback
      setShowConfetti(true)
      setTimeout(() => setShowConfetti(false), 3000)
      
      toast({
        title: "Profile updated!",
        description: "Your changes have been saved successfully",
        variant: "default",
      })
      
      setEditOpen(false)
    } catch (error) {
      console.error("Error updating profile:", error)
      toast({
        title: "Error saving changes",
        description: "Please try again later",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  // Calculate profile completion (example logic)
  const completion = profile
    ? Math.round((
        [
          profile.name,
          profile.profile?.bio,
          (profile.profile?.skills?.length ?? 0) > 0,
          (profile.profile?.portfolio?.length ?? 0) > 0,
        ].filter(Boolean).length / 4) * 100)
    : 0

  // Example rating/review summary (replace with real data if available)
  const rating = profile ? profile.rating || 4.8 : 4.8;
  const reviewCount = profile ? profile.reviewCount || 28 : 28;

  // For animated completion
  const prevCompletion = useRef(completion)

  // Use real XP, level, streak, endorsements, achievements from backend
  const xp = profile?.profile?.xp ?? 0
  const level = profile?.profile?.level ?? 1
  const streak = profile?.profile?.streak ?? 0
  const endorsements = profile?.profile?.endorsements ?? []
  const achievements = profile?.profile?.achievements ?? []
  const xpToNext = 500 - (xp % 500)

  // Enhanced achievements with animations and visual styles
  const enhancedAchievements = [
    { 
      id: 1, 
      title: "First Job", 
      description: "Complete your first project", 
      icon: <Trophy className="h-8 w-8 text-yellow-300" />,
      unlocked: true,
      rarity: "common",
      color: "from-yellow-600 to-yellow-900",
      textColor: "text-yellow-300",
      borderColor: "border-yellow-700",
      achievedAt: "2024-12-01"
    },
    { 
      id: 2, 
      title: "Streak Master", 
      description: "Maintain a 7-day streak", 
      icon: <Flame className="h-8 w-8 text-orange-400" />,
      unlocked: true,
      rarity: "rare",
      color: "from-orange-700 to-red-900",
      textColor: "text-orange-300",
      borderColor: "border-orange-700",
      achievedAt: "2025-01-15"
    },
    { 
      id: 3, 
      title: "Rising Star", 
      description: "Get 5 five-star reviews", 
      icon: <Star className="h-8 w-8 text-yellow-400" />,
      unlocked: false,
      rarity: "epic",
      color: "from-purple-700 to-blue-900",
      textColor: "text-purple-300",
      borderColor: "border-purple-700"
    },
    { 
      id: 4, 
      title: "Portfolio Pro", 
      description: "Add 10 portfolio items", 
      icon: <BarChart2 className="h-8 w-8 text-emerald-400" />,
      unlocked: false,
      rarity: "uncommon",
      color: "from-emerald-700 to-green-900",
      textColor: "text-emerald-300",
      borderColor: "border-emerald-700"
    },
  ]
  // Completion tasks
  const completionTasks = [
    { label: "Add Name", done: !!profile?.name },
    { label: "Add Bio", done: !!profile?.profile?.bio },
    { label: "Add Skills", done: (profile?.profile?.skills?.length ?? 0) > 0 },
    { label: "Add Portfolio", done: (profile?.profile?.portfolio?.length ?? 0) > 0 },
  ]

  // Leaderboard (mocked)
  const leaderboardPos = 12
  // Trending (mocked)
  const trending = true
  // Daily/Weekly challenge (mocked)
  const dailyChallenge = { desc: "Apply to 2 new contests", timeLeft: "04:12:33", done: false }
  // Skill tree (mocked)
  const skillTree = [
    { name: "Design", children: [
      { name: "UI/UX", children: [{ name: "Figma" }, { name: "Adobe XD" }] },
      { name: "Branding" },
    ] },
    { name: "Development", children: [
      { name: "React" }, { name: "Next.js" }, { name: "TypeScript" }
    ] }
  ]

  const queryClientRef = useRef<QueryClient>(new QueryClient());
  if (!queryClientRef.current) {
    queryClientRef.current = new QueryClient();
  }

  if (isLoading || loading) {
    return (
      <div className="container py-8 flex flex-col items-center justify-center h-[60vh]">
        <div className="relative h-20 w-20">
          <div className="absolute inset-0 rounded-full border-4 border-t-purple-500 border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
          <div className="absolute inset-2 rounded-full border-4 border-t-transparent border-r-purple-400 border-b-transparent border-l-transparent animate-spin animate-delay-150"></div>
          <div className="absolute inset-4 rounded-full border-4 border-t-transparent border-r-transparent border-b-purple-300 border-l-transparent animate-spin animate-delay-300"></div>
        </div>
        <div className="mt-6 font-bold text-purple-300 animate-pulse">Loading your creative profile...</div>
      </div>
    )
  }
  
  if (!profile) {
    return (
      <div className="container py-8 text-center">
        <div className="bg-gray-900/70 rounded-xl p-8 border border-gray-800">
          <Shield className="h-16 w-16 text-purple-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-purple-300 mb-2">Profile not found</h2>
          <p className="text-purple-400">We couldn't locate your profile information</p>
          <Button className="mt-6 bg-purple-700 hover:bg-purple-600">Return to Homepage</Button>
        </div>
      </div>
    )
  }

  // Example: profile.role, profile.name, etc. Adjust as needed for your API shape
  const isFreelancer = profile.role === "FREELANCER"
  const isClient = profile.role === "CLIENT"

  // Confetti animation component
  const Confetti = () => {
    return (
      <div className="fixed inset-0 pointer-events-none z-50">
        {Array.from({ length: 100 }).map((_, i) => (
          <motion.div 
            key={i}
            initial={{ 
              top: "0%", 
              left: `${Math.random() * 100}%`,
              backgroundColor: ["#a78bfa", "#f97316", "#3b82f6", "#22c55e"][Math.floor(Math.random() * 4)],
              width: `${Math.random() * 10 + 5}px`,
              height: `${Math.random() * 10 + 5}px`,
              opacity: 1,
              rotate: 0
            }}
            animate={{ 
              top: "100%", 
              rotate: 360,
              opacity: [1, 1, 0]
            }}
            transition={{ 
              duration: 3 + Math.random() * 2,
              delay: Math.random(),
              ease: "easeOut"
            }}
            className="absolute rounded-md"
          />
        ))}
      </div>
    )
  }

  return (
    <QueryClientProvider client={queryClientRef.current}>
      <div className="container py-4 relative max-w-7xl mx-auto">
        {/* Creotask Logo */}
        <div className="w-full flex justify-center mb-8">
          <Image
            src="/profile/creotask.lakshya.png"
            alt="Creotask"
            width={200}
            height={80}
            className="object-contain"
            priority
          />
        </div>

        {/* Animated background elements */}
        <div className="fixed inset-0 -z-10 overflow-hidden">
          <motion.div 
            animate={pulsingOrb}
            className="absolute top-1/4 left-10 w-64 h-64 rounded-full bg-purple-900/20 blur-3xl"
          />
          <motion.div 
            animate={{
              x: [0, 10, 0],
              y: [0, -10, 0],
              transition: { repeat: Infinity, duration: 8 }
            }}
            className="absolute bottom-1/4 right-10 w-96 h-96 rounded-full bg-blue-900/20 blur-3xl"
          />
        </div>

        {/* XP Animation */}
        <AnimatePresence>
          {xpAnimation.isShowing && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="fixed top-16 left-1/2 transform -translate-x-1/2 z-50 bg-gradient-to-br from-purple-600 to-purple-900 px-6 py-3 rounded-xl shadow-lg border border-purple-500"
            >
              <div className="flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-yellow-300 animate-pulse" />
                <span className="text-xl font-bold text-white">+{xpAnimation.amount} XP Earned!</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Confetti celebration on profile update */}
        <AnimatePresence>
          {showConfetti && <Confetti />}
        </AnimatePresence>

        {/* Gamified Profile Completion */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={controls}
          className="flex flex-col md:flex-row gap-8 mb-8 items-center"
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="relative flex flex-col items-center group"
          >
            {/* Circular Progress */}
            <svg width="140" height="140" className="rotate-[-90deg]">
              <circle cx="70" cy="70" r="58" fill="none" stroke="#2D2A37" strokeWidth="12" />
              <motion.circle
                cx="70" cy="70" r="58" fill="none"
                stroke="#a78bfa"
                strokeWidth="12"
                strokeDasharray={2 * Math.PI * 58}
                strokeDashoffset={2 * Math.PI * 58 * (1 - completion / 100)}
                strokeLinecap="round"
                initial={{ strokeDashoffset: 2 * Math.PI * 58 }}
                animate={{ strokeDashoffset: 2 * Math.PI * 58 * (1 - completion / 100) }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
              />
            </svg>
            <div className="absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center">
              <motion.span 
                className="text-4xl font-extrabold text-purple-400"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.5, type: "spring" }}
              >
                {completion}%
              </motion.span>
              <span className="text-sm text-purple-500 font-semibold">Complete</span>
            </div>
            
            {/* Hover tooltip */}
            <div className="absolute -top-16 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gray-900/90 text-purple-300 px-4 py-2 rounded-lg shadow-lg text-sm pointer-events-none">
              Complete your profile to unlock all features!
            </div>
          </motion.div>
          <div className="flex-1">
            <div className="flex flex-wrap gap-3 mb-2">
              {completionTasks.map((task, i) => (
                <motion.span 
                  key={i} 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 + 0.2 }}
                  whileHover={{ scale: 1.05 }}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium border transition-all cursor-pointer",
                    task.done
                      ? "bg-purple-900/40 text-purple-300 border-purple-700"
                      : "bg-gray-900/60 text-gray-400 border-gray-700 opacity-70"
                  )}
                >
                  {task.done ? (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 500 }}
                    >
                      <CheckCircle className="h-4 w-4 text-purple-400" />
                    </motion.div>
                  ) : (
                    <Lock className="h-4 w-4 text-gray-500" />
                  )}
                  {task.label}
                </motion.span>
              ))}
            </div>
            <div className="flex gap-4 items-center mt-5 flex-wrap">
              <motion.span 
                className="text-xs bg-purple-900/30 shadow-inner px-3 py-1.5 rounded-full text-purple-300 font-semibold flex items-center gap-2"
                whileHover={{ scale: 1.05 }}
              >
                <Sparkles className="h-4 w-4 text-purple-400" />
                XP: <span className="text-purple-200 font-bold">{xp}</span>
              </motion.span>
              
              <motion.span 
                className="text-xs bg-purple-900/30 shadow-inner px-3 py-1.5 rounded-full text-purple-300 font-semibold flex items-center gap-2"
                whileHover={{ scale: 1.05 }}
              >
                <Award className="h-4 w-4 text-purple-400" />
                Level: <span className="text-purple-200 font-bold">{level}</span>
              </motion.span>
              
              <motion.span 
                className="text-xs bg-purple-900/30 shadow-inner px-3 py-1.5 rounded-full text-purple-300 font-semibold flex items-center gap-2"
                whileHover={{ scale: 1.05 }}
              >
                <Target className="h-4 w-4 text-purple-400" />
                To next: <span className="text-purple-200 font-bold">{xpToNext} XP</span>
              </motion.span>
              
              <motion.span 
                className="text-xs bg-yellow-900/30 shadow-inner px-3 py-1.5 rounded-full text-yellow-300 font-semibold flex items-center gap-2"
                whileHover={{ scale: 1.05 }}
              >
                <Flame className="h-4 w-4 text-yellow-400" />
                Streak: <span className="text-yellow-200 font-bold">{streak}d</span>
              </motion.span>
              
              {trending && (
                <motion.span 
                  className="text-xs bg-pink-900/30 shadow-inner px-3 py-1.5 rounded-full text-pink-300 font-semibold flex items-center gap-2"
                  animate={{
                    scale: [1, 1.05, 1],
                    transition: { repeat: Infinity, duration: 2 }
                  }}
                >
                  <TrendingUp className="h-4 w-4 text-pink-400" />
                  Trending
                </motion.span>
              )}
            </div>
          </div>
        </motion.div>
        
        {/* Profile Card + Leaderboard */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div className="md:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              whileHover={{ y: -5 }}
            >
              <Card className="bg-gradient-to-br from-gray-900 to-black shadow-2xl border border-gray-800 rounded-3xl relative overflow-hidden">
                {/* Background visual elements */}
                <div className="absolute inset-0 opacity-20 overflow-hidden pointer-events-none">
                  <div className="absolute top-0 left-0 w-full h-40 bg-gradient-to-b from-purple-900/30 to-transparent"></div>
                  <motion.div 
                    className="absolute -right-20 -top-20 w-40 h-40 rounded-full bg-purple-800/20 blur-xl"
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.2, 0.3, 0.2],
                    }}
                    transition={{ repeat: Infinity, duration: 8 }}
                  />
                </div>
              
                <CardContent className="pt-12 pb-10 flex flex-col items-center text-center relative">
                  {/* Leaderboard */}
                  <motion.div 
                    initial={{ x: 100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.7, type: "spring" }}
                    className="absolute top-4 right-4 flex flex-col items-end"
                  >
                    <motion.span 
                      whileHover={{ scale: 1.05 }}
                      className="bg-yellow-900/50 text-yellow-400 px-4 py-1.5 rounded-full text-xs font-bold shadow-lg flex items-center gap-1.5 border border-yellow-800/50"
                    >
                      <Trophy className="h-4 w-4" /> 
                      <span>#{leaderboardPos} Leaderboard</span>
                    </motion.span>
                  </motion.div>
                  
                  {/* Avatar */}
                  <div className="relative mb-2">
                    <motion.div
                      whileHover={{ scale: 1.05, rotate: 5 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <Avatar className="h-32 w-32 border-4 border-purple-700 shadow-xl">
                        <AvatarImage src={profile.avatar || "/placeholder-user.jpg"} alt={profile.name} />
                        <AvatarFallback className="bg-purple-900 text-purple-200 text-4xl">
                          {profile.name?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                    </motion.div>
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button 
                        size="icon" 
                        className="absolute bottom-2 right-2 bg-gradient-to-br from-purple-600 to-purple-900 hover:from-purple-500 hover:to-purple-800 rounded-full p-3 shadow-lg border-2 border-gray-800" 
                        onClick={() => setEditOpen(true)}
                      >
                        <Edit className="h-6 w-6 text-white" />
                      </Button>
                    </motion.div>
                  </div>
                  
                  <motion.h2 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="mt-6 text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-purple-200 to-purple-400 flex items-center gap-2 drop-shadow-sm"
                  >
                    {profile.name}
                    {isFreelancer && (
                      <motion.div
                        animate={{
                          rotate: [0, 10, 0, -10, 0],
                          scale: [1, 1.1, 1],
                        }}
                        transition={{ repeat: Infinity, duration: 5, repeatDelay: 2 }}
                      >
                        <Star className="h-6 w-6 text-yellow-400" />
                      </motion.div>
                    )}
                  </motion.h2>
                  
                  <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-purple-400 font-medium text-lg mt-1 mb-2 tracking-wide"
                  >
                    {profile.profile?.title || (isFreelancer ? 'Creative Specialist' : isClient ? 'Project Owner' : '')}
                  </motion.p>
                  
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="flex items-center justify-center gap-2 text-base text-purple-300 mb-2"
                  >
                    <MapPin className="h-5 w-5" />
                    <span>{profile.profile?.location || "Remote"}</span>
                  </motion.div>
                  
                  {/* Rating/Review Summary */}
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6 }}
                    whileHover={{ scale: 1.05 }}
                    className="flex items-center justify-center gap-2 mt-2 mb-4 bg-yellow-900/20 px-4 py-2 rounded-full border border-yellow-900/30"
                  >
                    <Star className="h-5 w-5 text-yellow-400" />
                    <span className="font-bold text-lg text-yellow-300">{rating}</span>
                    <span className="text-xs text-yellow-500">({reviewCount} reviews)</span>
                  </motion.div>
                  
                  {/* Bio */}
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="w-full mt-6"
                  >
                    <h3 className="font-bold text-purple-300 mb-2 text-left text-lg flex items-center gap-2">
                      <Heart className="h-5 w-5 text-purple-400" /> About
                    </h3>
                    <motion.div 
                      whileHover={{ scale: 1.01 }}
                      className="text-base text-purple-200 bg-gray-800/60 rounded-xl p-4 shadow-inner min-h-[48px] border border-gray-700"
                    >
                      {profile.profile?.bio || "No bio yet. Click edit to add your bio!"}
                    </motion.div>
                  </motion.div>
                  
                  {/* Skills */}
                  {isFreelancer && profile.profile?.skills && profile.profile.skills.length > 0 && (
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.8 }}
                      className="w-full mt-8"
                    >
                      <h3 className="font-bold text-purple-300 mb-2 text-left text-lg flex items-center gap-2">
                        <Target className="h-5 w-5 text-purple-400" /> Skills
                      </h3>
                      <div className="flex flex-wrap gap-3">
                        {profile.profile?.skills?.map((skill: SkillItem, i: number) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.8 + i * 0.05 }}
                            whileHover={{ scale: 1.05 }}
                            className="px-3 py-1.5 bg-purple-900/40 text-purple-200 rounded-full text-sm font-medium border border-purple-800"
                          >
                            {skill.name}
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* Daily Challenge */}
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1 }}
                    className="w-full mt-8"
                  >
                    <h3 className="font-bold text-purple-300 mb-3 text-left text-lg flex items-center gap-2">
                      <Zap className="h-5 w-5 text-yellow-400" /> Daily Challenge
                    </h3>
                    <div className="bg-gradient-to-br from-purple-900/40 to-purple-900/20 rounded-xl p-4 border border-purple-800/50 shadow-inner">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-purple-300 font-medium">{dailyChallenge.desc}</span>
                        {dailyChallenge.done ? (
                          <CheckCircle className="h-5 w-5 text-green-400" />
                        ) : (
                          <Lock className="h-5 w-5 text-purple-500" />
                        )}
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-purple-400">Time left: {dailyChallenge.timeLeft}</span>
                        <Button size="sm" className="h-7 bg-purple-700 hover:bg-purple-600">
                          {dailyChallenge.done ? 'Completed' : 'Start'}
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <div className="md:col-span-2">
            {/* Tabs Navigation */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Tabs 
                value={activeTab} 
                onValueChange={setActiveTab}
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-3 bg-gray-900/80 border border-gray-800 rounded-xl p-1.5 h-auto">
                  <TabsTrigger 
                    value="portfolio" 
                    className="py-3 data-[state=active]:bg-purple-900/50 data-[state=active]:text-purple-200 data-[state=active]:shadow-sm rounded-lg"
                  >
                    Portfolio
                  </TabsTrigger>
                  <TabsTrigger 
                    value="achievements" 
                    className="py-3 data-[state=active]:bg-purple-900/50 data-[state=active]:text-purple-200 data-[state=active]:shadow-sm rounded-lg"
                  >
                    Achievements
                  </TabsTrigger>
                  <TabsTrigger 
                    value="reviews" 
                    className="py-3 data-[state=active]:bg-purple-900/50 data-[state=active]:text-purple-200 data-[state=active]:shadow-sm rounded-lg"
                  >
                    Reviews
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </motion.div>

            {/* Portfolio Tab Content */}
            {activeTab === "portfolio" && (
              <motion.div
                ref={portfolioRef}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mt-6"
              >
                <Card className="bg-gray-900/70 border border-gray-800 rounded-2xl overflow-hidden">
                  <CardHeader>
                    <CardTitle className="text-purple-300 flex items-center gap-2">
                      <Sparkles className="h-5 w-5" /> Featured Work
                    </CardTitle>
                    <CardDescription className="text-purple-400">
                      {profile.profile?.portfolio?.length || 0} projects showcased
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {(profile.profile?.portfolio?.length ?? 0) > 0 ? (
                      <Carousel className="w-full">
                        <CarouselContent>
                          {profile.profile?.portfolio?.map((item: PortfolioItem, index: number) => (
                            <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                              <motion.div
                                whileHover={{ y: -5 }}
                                className="relative group h-full"
                              >
                                <div className="aspect-video bg-gray-800 rounded-xl overflow-hidden border border-gray-700">
                                  <img 
                                    src={item.image || "/placeholder-project.jpg"} 
                                    alt={item.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                  />
                                </div>
                                <div className="mt-3">
                                  <h4 className="font-bold text-purple-200">{item.title}</h4>
                                  <p className="text-sm text-purple-400 line-clamp-2">{item.description}</p>
                                </div>
                                <Button 
                                  size="sm" 
                                  variant="ghost" 
                                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900/80 hover:bg-gray-800/80"
                                >
                                  View
                                </Button>
                              </motion.div>
                            </CarouselItem>
                          ))}
                        </CarouselContent>
                        <CarouselPrevious className="left-2 bg-gray-900/80 border-gray-700 hover:bg-gray-800/80" />
                        <CarouselNext className="right-2 bg-gray-900/80 border-gray-700 hover:bg-gray-800/80" />
                      </Carousel>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <Sparkles className="h-12 w-12 text-purple-500 mb-4" />
                        <h3 className="text-xl font-bold text-purple-300 mb-2">No Portfolio Items Yet</h3>
                        <p className="text-purple-400 max-w-md mb-6">
                          Showcase your best work to attract more clients and opportunities
                        </p>
                        <Button className="bg-purple-700 hover:bg-purple-600">
                          Add Your First Project
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Skill Tree */}
                {isFreelancer && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="mt-8"
                  >
                    <Card className="bg-gray-900/70 border border-gray-800 rounded-2xl overflow-hidden">
                      <CardHeader>
                        <CardTitle className="text-purple-300 flex items-center gap-2">
                          <Target className="h-5 w-5" /> Skill Tree
                        </CardTitle>
                        <CardDescription className="text-purple-400">
                          Grow your skills and unlock new opportunities
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {skillTree.map((skillCategory, i) => (
                            <div key={i} className="border-b border-gray-800/50 pb-4 last:border-0 last:pb-0">
                              <h4 className="font-bold text-purple-300 mb-3">{skillCategory.name}</h4>
                              <div className="flex flex-wrap gap-3">
                                {skillCategory.children?.map((skill, j) => (
                                  <motion.div
                                    key={j}
                                    whileHover={{ scale: 1.05 }}
                                    className="px-3 py-1.5 bg-gray-800/50 text-purple-200 rounded-lg text-sm font-medium border border-gray-700 flex items-center gap-2"
                                  >
                                    {skill.name}
                                    {skill.children && (
                                      <span className="text-xs text-purple-400">+{skill.children.length}</span>
                                    )}
                                  </motion.div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* Achievements Tab Content */}
            {activeTab === "achievements" && (
              <motion.div
                ref={achievementsRef}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mt-6"
              >
                <Card className="bg-gray-900/70 border border-gray-800 rounded-2xl overflow-hidden">
                  <CardHeader>
                    <CardTitle className="text-purple-300 flex items-center gap-2">
                      <Trophy className="h-5 w-5" /> Achievements
                    </CardTitle>
                    <CardDescription className="text-purple-400">
                      {enhancedAchievements.filter(a => a.unlocked).length} of {enhancedAchievements.length} unlocked
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {enhancedAchievements.map((achievement) => (
                        <motion.div
                          key={achievement.id}
                          whileHover={{ scale: 1.02 }}
                          className={cn(
                            "rounded-xl p-4 border-2 flex items-start gap-4 relative overflow-hidden",
                            achievement.unlocked 
                              ? `bg-gradient-to-br ${achievement.color} ${achievement.borderColor}`
                              : "bg-gray-900/50 border-gray-800"
                          )}
                        >
                          <div className={cn(
                            "p-3 rounded-lg",
                            achievement.unlocked 
                              ? "bg-white/10 backdrop-blur-sm"
                              : "bg-gray-800/50"
                          )}>
                            {achievement.icon}
                          </div>
                          <div className="flex-1">
                            <h4 className={cn(
                              "font-bold text-lg",
                              achievement.unlocked 
                                ? achievement.textColor 
                                : "text-gray-500"
                            )}>
                              {achievement.title}
                              {achievement.unlocked && (
                                <span className="ml-2 text-xs bg-black/20 px-2 py-0.5 rounded-full">
                                  {achievement.rarity}
                                </span>
                              )}
                            </h4>
                            <p className={cn(
                              "text-sm",
                              achievement.unlocked 
                                ? "text-purple-200" 
                                : "text-gray-600"
                            )}>
                              {achievement.description}
                            </p>
                            {achievement.unlocked && achievement.achievedAt && (
                              <p className="text-xs text-purple-300/70 mt-2">
                                Achieved on {new Date(achievement.achievedAt).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                          {!achievement.unlocked && (
                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                              <Lock className="h-8 w-8 text-gray-500" />
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* XP Progress */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="mt-8"
                >
                  <Card className="bg-gray-900/70 border border-gray-800 rounded-2xl overflow-hidden">
                    <CardHeader>
                      <CardTitle className="text-purple-300 flex items-center gap-2">
                        <TrendingUp className="h-5 w-5" /> Progress
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-purple-300 font-medium">Level {level}</span>
                            <span className="text-purple-400 text-sm">
                              {xp % 500}/{500} XP
                            </span>
                          </div>
                          <Progress 
                            value={(xp % 500) / 5} 
                            className={cn(
                              "h-3 bg-gray-800 [&>div]:bg-gradient-to-r [&>div]:from-purple-500 [&>div]:to-purple-700",
                              xpAnimation.isShowing ? "[&>div]:animate-pulse" : ""
                            )}
                          />
                        </div>
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-purple-300 font-medium flex items-center gap-2">
                              <Flame className="h-4 w-4 text-orange-400" /> Streak
                            </span>
                            <span className="text-purple-400 text-sm">
                              {streak} days
                            </span>
                          </div>
                          <Progress 
                            value={Math.min(streak * 10, 100)} 
                            className="h-3 bg-gray-800 [&>div]:bg-gradient-to-r [&>div]:from-orange-500 [&>div]:to-red-600"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </motion.div>
            )}

            {/* Reviews Tab Content */}
            {activeTab === "reviews" && (
              <motion.div
                ref={reviewsRef}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mt-6"
              >
                <Card className="bg-gray-900/70 border border-gray-800 rounded-2xl overflow-hidden">
                  <CardHeader>
                    <CardTitle className="text-purple-300 flex items-center gap-2">
                      <Star className="h-5 w-5" /> Client Reviews
                    </CardTitle>
                    <CardDescription className="text-purple-400">
                      Average rating: {rating} from {reviewCount} reviews
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {reviewCount > 0 ? (
                      <div className="space-y-6">
                        {/* Mock review data - replace with real data */}
                        {[1, 2, 3].map((_, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 + i * 0.1 }}
                            className="border-b border-gray-800/50 pb-6 last:border-0 last:pb-0"
                          >
                            <div className="flex items-start gap-4">
                              <Avatar className="h-10 w-10 border border-purple-900">
                                <AvatarImage src={`/placeholder-avatar-${i+1}.jpg`} />
                                <AvatarFallback className="bg-purple-900">U{i+1}</AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <h4 className="font-bold text-purple-200">Client {i+1}</h4>
                                    <div className="flex items-center gap-1 mt-1">
                                      {[1, 2, 3, 4, 5].map((star) => (
                                        <Star 
                                          key={star}
                                          className={cn(
                                            "h-4 w-4",
                                            star <= 5 ? "text-yellow-400 fill-yellow-400" : "text-gray-600"
                                          )}
                                        />
                                      ))}
                                    </div>
                                  </div>
                                  <span className="text-xs text-purple-500">
                                    {new Date(Date.now() - (i * 30 * 24 * 60 * 60 * 1000)).toLocaleDateString()}
                                  </span>
                                </div>
                                <p className="mt-3 text-purple-300">
                                  {[
                                    "Amazing work! Delivered beyond expectations.",
                                    "Very professional and creative. Will hire again!",
                                    "Good communication and fast delivery."
                                  ][i]}
                                </p>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <Star className="h-12 w-12 text-purple-500 mb-4" />
                        <h3 className="text-xl font-bold text-purple-300 mb-2">No Reviews Yet</h3>
                        <p className="text-purple-400 max-w-md mb-6">
                          Complete projects to receive client feedback and build your reputation
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Endorsements */}
                {isFreelancer && endorsements.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="mt-8"
                  >
                    <Card className="bg-gray-900/70 border border-gray-800 rounded-2xl overflow-hidden">
                      <CardHeader>
                        <CardTitle className="text-purple-300 flex items-center gap-2">
                          <UserPlus className="h-5 w-5" /> Skill Endorsements
                        </CardTitle>
                        <CardDescription className="text-purple-400">
                          {endorsements.length} people endorsed your skills
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-4">
                          {endorsements.map((endorsement: Endorsement, i: number) => (
                            <motion.div
                              key={i}
                              whileHover={{ scale: 1.05 }}
                              className="flex items-center gap-3 bg-gray-800/40 px-4 py-2 rounded-full border border-gray-700"
                            >
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={endorsement.avatar || `/placeholder-avatar-${i+1}.jpg`} />
                                <AvatarFallback className="bg-purple-900 text-xs">
                                  {endorsement.name?.charAt(0) || 'E'}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <h4 className="text-sm font-medium text-purple-200">{endorsement.name || `Endorser ${i+1}`}</h4>
                                <p className="text-xs text-purple-400">{endorsement.skill}</p>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </motion.div>
            )}
          </div>
        </div>

        {/* Edit Profile Dialog */}
        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogContent className="sm:max-w-2xl bg-gray-900 border-gray-800 rounded-2xl overflow-hidden">
            <DialogHeader>
              <DialogTitle className="text-purple-300">Edit Profile</DialogTitle>
            </DialogHeader>
            <div className="grid gap-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium text-purple-300">
                    Full Name
                  </label>
                  <Input
                    id="name"
                    value={editData.name || ''}
                    onChange={(e) => handleEditChange('name', e.target.value)}
                    className="bg-gray-800 border-gray-700 text-purple-100"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="title" className="text-sm font-medium text-purple-300">
                    Professional Title
                  </label>
                  <Input
                    id="title"
                    value={editData.title || ''}
                    onChange={(e) => handleEditChange('title', e.target.value)}
                    className="bg-gray-800 border-gray-700 text-purple-100"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label htmlFor="location" className="text-sm font-medium text-purple-300">
                  Location
                </label>
                <Input
                  id="location"
                  value={editData.location || ''}
                  onChange={(e) => handleEditChange('location', e.target.value)}
                  className="bg-gray-800 border-gray-700 text-purple-100"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="bio" className="text-sm font-medium text-purple-300">
                  Bio
                </label>
                <Textarea
                  id="bio"
                  value={editData.bio || ''}
                  onChange={(e) => handleEditChange('bio', e.target.value)}
                  className="bg-gray-800 border-gray-700 text-purple-100 min-h-[120px]"
                  placeholder="Tell clients about yourself, your experience, and your creative approach..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button 
                variant="outline" 
                className="border-gray-700 text-purple-300 hover:bg-gray-800"
                onClick={() => setEditOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSaveChanges}
                disabled={saving}
                className="bg-purple-700 hover:bg-purple-600"
              >
                {saving ? (
                  <div className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </div>
                ) : 'Save Changes'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </QueryClientProvider>
  )
}