"use client"

import { Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { FreelancerCard } from "@/components/freelancer-card"
import { useFreelancersQuery } from "@/hooks/use-queries"

export default function FreelancersPage() {
  const { data: freelancers, isLoading, isError } = useFreelancersQuery()

  if (isLoading) return <div className="container py-8">Loading freelancers...</div>
  if (isError) return <div className="container py-8 text-red-500">Failed to load freelancers.</div>

  return (
    <div className="container py-8 md:py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Find Freelancers</h1>
          <p className="text-muted-foreground mt-1">Discover talented professionals for your projects</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        <div className="md:w-1/4">
          <Card className="p-4">
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">Search</h3>
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search freelancers..." className="pl-8" />
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="font-medium mb-2">Skills</h3>
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="ui-design" className="rounded border-gray-300" />
                    <label htmlFor="ui-design" className="text-sm">
                      UI Design
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="development" className="rounded border-gray-300" />
                    <label htmlFor="development" className="text-sm">
                      Web Development
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="writing" className="rounded border-gray-300" />
                    <label htmlFor="writing" className="text-sm">
                      Content Writing
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="graphic-design" className="rounded border-gray-300" />
                    <label htmlFor="graphic-design" className="text-sm">
                      Graphic Design
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="mobile-dev" className="rounded border-gray-300" />
                    <label htmlFor="mobile-dev" className="text-sm">
                      Mobile Development
                    </label>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="font-medium mb-2">Hourly Rate</h3>
                <div className="grid grid-cols-2 gap-2">
                  <Input placeholder="Min" type="number" />
                  <Input placeholder="Max" type="number" />
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="font-medium mb-2">Rating</h3>
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="rating-4.5" className="rounded border-gray-300" />
                    <label htmlFor="rating-4.5" className="text-sm">
                      4.5 & up
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="rating-4" className="rounded border-gray-300" />
                    <label htmlFor="rating-4" className="text-sm">
                      4.0 & up
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="rating-3.5" className="rounded border-gray-300" />
                    <label htmlFor="rating-3.5" className="text-sm">
                      3.5 & up
                    </label>
                  </div>
                </div>
              </div>

              <Button className="w-full">Apply Filters</Button>
            </div>
          </Card>
        </div>

        <div className="md:w-3/4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {freelancers?.map((freelancer: any) => (
              <FreelancerCard key={freelancer.id} freelancer={freelancer} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
