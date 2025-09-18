'use client'

import { useState } from 'react'
import { MainLayout } from '@/components/layout/MainLayout'
import { Calendar, MapPin, Plus, Filter } from 'lucide-react'

export default function TripsPage() {
  const [activeTab, setActiveTab] = useState('my-trips')


  const mockTrips = [
    {
      id: 1,
      title: 'Costa Rica Adventure',
      destination: 'Costa Rica',
      dates: 'Apr 1-15, 2024',
      duration: '2 weeks',
      status: 'upcoming',
      image: '/api/placeholder/300/200',
      description: 'Exploring rainforests, beaches, and volcanoes',
      companions: 2,
      activities: ['Hiking', 'Surfing', 'Wildlife watching']
    },
    {
      id: 2,
      title: 'Japanese Cultural Journey',
      destination: 'Japan',
      dates: 'Mar 10-25, 2024',
      duration: '2 weeks',
      status: 'completed',
      image: '/api/placeholder/300/200',
      description: 'Temples, sushi, and cherry blossoms',
      companions: 1,
      activities: ['Cultural sites', 'Food tours', 'Photography']
    },
    {
      id: 3,
      title: 'European Backpacking',
      destination: 'Multiple Cities',
      dates: 'Jun 1-30, 2024',
      duration: '1 month',
      status: 'planning',
      image: '/api/placeholder/300/200',
      description: 'Solo backpacking through Western Europe',
      companions: 0,
      activities: ['City hopping', 'Museums', 'Local cuisine']
    }
  ]

  const tabs = [
    { id: 'my-trips', label: 'My Trips', count: mockTrips.length },
    { id: 'planning', label: 'Planning', count: 1 },
    { id: 'completed', label: 'Completed', count: 1 },
    { id: 'upcoming', label: 'Upcoming', count: 1 }
  ]

  const getTripsByStatus = (status: string) => {
    return mockTrips.filter(trip => trip.status === status)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'text-sun-600 bg-sun-50 dark:bg-sun-500/10'
      case 'completed': return 'text-brand-600 bg-brand-50 dark:bg-brand-500/10'
      case 'planning': return 'text-sky-600 bg-sky-50 dark:bg-sky-500/10'
      default: return 'text-muted-foreground bg-muted'
    }
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Trips</h1>
            <p className="text-muted-foreground">Plan and track your adventures</p>
          </div>
          <button className="flex items-center space-x-2 px-4 py-2 bg-brand-500 text-white rounded-xl hover:bg-brand-600 transition-colors">
            <Plus className="w-4 h-4" />
            <span>New Trip</span>
          </button>
        </div>

        {/* Trip Planner Card */}
        <div className="p-6 bg-card rounded-2xl shadow-card border border-border">
          <h2 className="text-lg font-semibold text-foreground mb-4">Plan Your Next Adventure</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 bg-muted rounded-xl">
              <Calendar className="w-6 h-6 text-brand-500 mb-2" />
              <h3 className="font-medium text-foreground mb-1">Destination</h3>
              <p className="text-sm text-muted-foreground">Where do you want to go?</p>
            </div>
            <div className="p-4 bg-muted rounded-xl">
              <MapPin className="w-6 h-6 text-sun-500 mb-2" />
              <h3 className="font-medium text-foreground mb-1">Dates</h3>
              <p className="text-sm text-muted-foreground">When are you traveling?</p>
            </div>
            <div className="p-4 bg-muted rounded-xl">
              <Filter className="w-6 h-6 text-coral-500 mb-2" />
              <h3 className="font-medium text-foreground mb-1">Activities</h3>
              <p className="text-sm text-muted-foreground">What do you want to do?</p>
            </div>
          </div>
        </div>

        {/* Trip Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-card rounded-xl shadow-card">
            <p className="text-2xl font-bold text-foreground">{mockTrips.length}</p>
            <p className="text-sm text-muted-foreground">Total Trips</p>
          </div>
          <div className="text-center p-4 bg-card rounded-xl shadow-card">
            <p className="text-2xl font-bold text-foreground">3</p>
            <p className="text-sm text-muted-foreground">Countries</p>
          </div>
          <div className="text-center p-4 bg-card rounded-xl shadow-card">
            <p className="text-2xl font-bold text-foreground">45</p>
            <p className="text-sm text-muted-foreground">Days Traveled</p>
          </div>
          <div className="text-center p-4 bg-card rounded-xl shadow-card">
            <p className="text-2xl font-bold text-foreground">8</p>
            <p className="text-sm text-muted-foreground">Cities Visited</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-border">
          <nav className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={clsx(
                  "py-3 px-1 border-b-2 font-medium text-sm transition-colors flex items-center space-x-2",
                  activeTab === tab.id
                    ? "border-brand-500 text-brand-600"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground"
                )}
              >
                <span>{tab.label}</span>
                {tab.count > 0 && (
                  <span className="px-2 py-0.5 bg-muted rounded-full text-xs">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Trip Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {getTripsByStatus(activeTab === 'my-trips' ? 'upcoming' : activeTab).map((trip) => (
            <div key={trip.id} className="bg-card rounded-2xl shadow-card overflow-hidden hover:shadow-card-hover transition-shadow">
              {/* Trip Image */}
              <div className="h-40 bg-gradient-to-r from-brand-500 to-sky-500 relative">
                <div className="absolute top-3 right-3">
                  <span className={clsx(
                    "px-2 py-1 rounded-full text-xs font-medium",
                    getStatusColor(trip.status)
                  )}>
                    {trip.status.charAt(0).toUpperCase() + trip.status.slice(1)}
                  </span>
                </div>
              </div>

              {/* Trip Info */}
              <div className="p-4">
                <h3 className="font-semibold text-foreground mb-1">{trip.title}</h3>
                <p className="text-sm text-muted-foreground mb-2">{trip.destination}</p>
                
                <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-3">
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>{trip.dates}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span>{trip.duration}</span>
                  </div>
                </div>

                <p className="text-sm text-foreground mb-3">{trip.description}</p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="flex -space-x-2">
                      {[...Array(trip.companions)].map((_, i) => (
                        <div key={i} className="w-6 h-6 rounded-full bg-muted border-2 border-card flex items-center justify-center">
                          <span className="text-xs text-muted-foreground">T{i+1}</span>
                        </div>
                      ))}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {trip.companions > 0 ? `${trip.companions} companions` : 'Solo trip'}
                    </span>
                  </div>
                  
                  <button className="text-brand-500 hover:text-brand-600 text-sm font-medium">
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {getTripsByStatus(activeTab === 'my-trips' ? 'upcoming' : activeTab).length === 0 && (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No trips found</h3>
            <p className="text-muted-foreground mb-4">
              {activeTab === 'planning' ? 'Start planning your next adventure!' : 
               activeTab === 'completed' ? 'Your completed trips will appear here.' :
               'Your upcoming trips will appear here.'}
            </p>
            <button className="px-4 py-2 bg-brand-500 text-white rounded-xl hover:bg-brand-600 transition-colors">
              Plan a Trip
            </button>
          </div>
        )}
      </div>
    </MainLayout>
  )
}

function clsx(...classes: (string | boolean | undefined)[]): string {
  return classes.filter(Boolean).join(' ')
}