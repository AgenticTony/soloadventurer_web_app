'use client'

import { MainLayout } from '@/components/layout/MainLayout'

export default function DemoPage() {
  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="pb-4 border-b border-border">
          <h1 className="text-2xl font-bold text-foreground">Your Feed</h1>
          <p className="text-sm text-muted-foreground mt-1">Discover stories from fellow travelers</p>
        </div>
        
        {/* Post Composer Placeholder */}
        <div className="card-base p-6">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
              <span className="text-sm font-medium text-primary-foreground">JD</span>
            </div>
            <div className="flex-1">
              <textarea
                placeholder="Share your travel story, photos, or tips..."
                className="w-full p-3 bg-muted rounded-2xl border border-border resize-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 placeholder:text-muted-foreground text-foreground"
                rows={3}
              />
              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center gap-2">
                  <button className="px-4 py-2 bg-muted hover:bg-muted/80 rounded-2xl transition-colors text-sm font-medium text-foreground">
                    📷 Add Photos
                  </button>
                  <button className="px-4 py-2 bg-muted hover:bg-muted/80 rounded-2xl transition-colors text-sm font-medium text-foreground">
                    📍 Tag City
                  </button>
                  <button className="px-4 py-2 bg-muted hover:bg-muted/80 rounded-2xl transition-colors text-sm font-medium text-foreground">
                    ✈️ Add Trip
                  </button>
                </div>
                <button className="px-6 py-2 bg-primary text-primary-foreground rounded-2xl hover:bg-primary/90 transition-all duration-200 font-medium shadow-sm hover:shadow-md">
                  Post
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Sample Posts */}
        {[1, 2, 3].map((i) => (
          <div key={i} className="card-base p-6">
            {/* Post Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-sm font-medium text-primary">SC</span>
                </div>
                <div>
                  <h3 className="font-medium text-foreground">Sarah Chen</h3>
                  <p className="text-sm text-muted-foreground">Bali, Indonesia • 2 hours ago</p>
                </div>
              </div>
              <button className="p-2 hover:bg-muted rounded-2xl transition-colors">
                <span className="text-lg">⋯</span>
              </button>
            </div>
            
            {/* Post Content */}
            <div className="mb-4">
              <p className="text-foreground">
                Just discovered the most amazing hidden beach in Uluwatu! 🏖️ The sunset here is absolutely breathtaking. 
                Fellow solo travelers, this is a must-visit spot!
              </p>
            </div>
            
            {/* Post Image Placeholder */}
            <div className="mb-4 bg-muted rounded-2xl aspect-video flex items-center justify-center">
              <span className="text-muted-foreground">Beautiful sunset photo</span>
            </div>
            
            {/* Post Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-border">
              <div className="flex items-center gap-1">
                <button className="p-2 hover:bg-muted rounded-2xl transition-colors">
                  <span className="text-lg">❤️</span>
                </button>
                <button className="p-2 hover:bg-muted rounded-2xl transition-colors">
                  <span className="text-lg">🌍</span>
                </button>
                <button className="p-2 hover:bg-muted rounded-2xl transition-colors">
                  <span className="text-lg">🙌</span>
                </button>
                <span className="text-sm text-muted-foreground ml-2">234 reactions</span>
              </div>
              
              <div className="flex items-center gap-4">
                <button className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  45 comments
                </button>
                <button className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  12 shares
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </MainLayout>
  )
}