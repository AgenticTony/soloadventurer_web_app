'use client'

import { useState, useEffect } from 'react'
import { Compass, Sun, MapPin, Camera, MessageCircle, Heart, Moon, Palette, Type, Box, Zap, Shield } from 'lucide-react'

export default function ThemePreview() {
  const [darkMode, setDarkMode] = useState(false)

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [darkMode])

  const colorGroups = [
    {
      name: 'Theme Colors',
      description: 'CSS variables that adapt to light/dark mode',
      colors: [
        { name: 'background', var: '--background', css: 'bg-background' },
        { name: 'foreground', var: '--foreground', css: 'text-foreground' },
        { name: 'card', var: '--card', css: 'bg-card' },
        { name: 'primary', var: '--primary', css: 'bg-primary' },
        { name: 'secondary', var: '--secondary', css: 'bg-secondary' },
        { name: 'muted', var: '--muted', css: 'bg-muted' },
        { name: 'accent', var: '--accent', css: 'bg-accent' },
        { name: 'destructive', var: '--destructive', css: 'bg-destructive' },
      ]
    },
    {
      name: 'Brand Colors',
      description: 'Teal-based palette for SoloAdventurer brand',
      colors: [
        { name: 'brand-50', bg: 'bg-brand-50', text: 'text-brand-950' },
        { name: 'brand-100', bg: 'bg-brand-100', text: 'text-brand-950' },
        { name: 'brand-200', bg: 'bg-brand-200', text: 'text-brand-950' },
        { name: 'brand-300', bg: 'bg-brand-300', text: 'text-brand-950' },
        { name: 'brand-400', bg: 'bg-brand-400', text: 'text-white' },
        { name: 'brand-500', bg: 'bg-brand-500', text: 'text-white' },
        { name: 'brand-600', bg: 'bg-brand-600', text: 'text-white' },
        { name: 'brand-700', bg: 'bg-brand-700', text: 'text-white' },
        { name: 'brand-800', bg: 'bg-brand-800', text: 'text-white' },
        { name: 'brand-900', bg: 'bg-brand-900', text: 'text-white' },
      ]
    },
    {
      name: 'Accent Colors',
      description: 'Travel-inspired accent colors',
      colors: [
        { name: 'sun-500', bg: 'bg-sun-500', text: 'text-sun-950', desc: 'Sun/sand' },
        { name: 'coral-500', bg: 'bg-coral-500', text: 'text-coral-950', desc: 'Coral accent' },
        { name: 'sky-500', bg: 'bg-sky-500', text: 'text-sky-950', desc: 'Sky blue' },
      ]
    },
    {
      name: 'Neutral Colors',
      description: 'Ink-based neutral palette',
      colors: [
        { name: 'ink-50', bg: 'bg-ink-50', text: 'text-ink-950' },
        { name: 'ink-100', bg: 'bg-ink-100', text: 'text-ink-950' },
        { name: 'ink-200', bg: 'bg-ink-200', text: 'text-ink-950' },
        { name: 'ink-300', bg: 'bg-ink-300', text: 'text-ink-950' },
        { name: 'ink-400', bg: 'bg-ink-400', text: 'text-white' },
        { name: 'ink-500', bg: 'bg-ink-500', text: 'text-white' },
        { name: 'ink-600', bg: 'bg-ink-600', text: 'text-white' },
        { name: 'ink-700', bg: 'bg-ink-700', text: 'text-white' },
        { name: 'ink-800', bg: 'bg-ink-800', text: 'text-white' },
        { name: 'ink-900', bg: 'bg-ink-900', text: 'text-white' },
      ]
    }
  ]

  const components = [
    {
      name: 'Primary Button',
      element: <button className="px-6 py-2.5 bg-primary text-primary-foreground rounded-2xl hover:bg-primary/90 transition-all duration-200 font-medium shadow-sm hover:shadow-md">
        Explore Destinations
      </button>
    },
    {
      name: 'Secondary Button',
      element: <button className="px-6 py-2.5 bg-secondary text-secondary-foreground rounded-2xl hover:bg-secondary/80 transition-all duration-200 font-medium">
        Save Trip
      </button>
    },
    {
      name: 'Accent Button',
      element: <button className="px-6 py-2.5 bg-accent text-accent-foreground rounded-2xl hover:bg-accent/90 transition-all duration-200 font-medium">
        <Sun className="w-4 h-4 mr-2 inline" />
        Find Sunny Spots
      </button>
    },
    {
      name: 'Card Component',
      element: <div className="p-6 card-interactive">
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center flex-shrink-0">
            <Compass className="w-6 h-6 text-primary-foreground" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-foreground text-lg">Adventure Awaits</h3>
            <p className="text-sm text-muted-foreground mt-1">Discover amazing places and meet fellow travelers</p>
            <div className="flex items-center gap-4 mt-3">
              <span className="text-xs text-muted-foreground">234 travelers</span>
              <span className="text-xs text-muted-foreground">45 trips</span>
            </div>
          </div>
        </div>
      </div>
    },
    {
      name: 'Location Badge',
      element: <div className="inline-flex items-center px-4 py-2 bg-muted rounded-2xl">
        <MapPin className="w-4 h-4 text-primary mr-2" />
        <span className="text-sm font-medium text-foreground">Bali, Indonesia</span>
      </div>
    },
    {
      name: 'Notification Card',
      element: <div className="p-4 card-base flex items-start space-x-3">
        <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
        <div className="flex-1">
          <p className="text-sm text-foreground"><span className="font-semibold">Sarah Chen</span> commented on your Bali trip</p>
          <p className="text-xs text-muted-foreground mt-1">2 minutes ago</p>
        </div>
      </div>
    }
  ]

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="card-base p-6 mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold text-foreground flex items-center">
                <Compass className="w-10 h-10 mr-3 text-primary" />
                SoloAdventurer
              </h1>
              <p className="text-muted-foreground mt-2">Design System & Theme Preview</p>
            </div>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="px-6 py-3 bg-primary text-primary-foreground rounded-2xl hover:bg-primary/90 transition-all duration-200 flex items-center gap-2 shadow-md hover:shadow-lg"
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              {darkMode ? 'Light Mode' : 'Dark Mode'}
            </button>
          </div>
        </div>

        {/* Color Tokens */}
        <div className="space-y-8">
          {colorGroups.map((group) => (
            <div key={group.name} className="card-base p-6">
              <div className="mb-4">
                <h2 className="text-2xl font-semibold text-foreground flex items-center gap-2">
                  <Palette className="w-6 h-6 text-primary" />
                  {group.name}
                </h2>
                {group.description && (
                  <p className="text-sm text-muted-foreground mt-1">{group.description}</p>
                )}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                {group.colors.map((color) => {
                  const isThemeColor = 'var' in color && color.var;
                  return (
                    <div key={color.name} className="space-y-2">
                      <div className={`h-24 rounded-2xl ${'bg' in color ? color.bg : 'css' in color ? color.css : ''} flex flex-col items-center justify-center transition-transform hover:scale-105 ${isThemeColor ? 'border-2 border-border' : ''}`}>
                        <span className={`text-xs font-mono ${'text' in color ? color.text : 'text-primary-foreground'}`}>
                          {color.name}
                        </span>
                        {'desc' in color && color.desc && (
                          <span className={`text-xs mt-1 ${'text' in color ? color.text : 'text-primary-foreground'} opacity-80`}>
                            {color.desc}
                          </span>
                        )}
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground">{color.name}</p>
                        {isThemeColor && 'var' in color && (
                          <p className="text-xs text-muted-foreground opacity-60">var({color.var})</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Component Examples */}
        <div className="mt-12">
          <div className="card-base p-6">
            <h2 className="text-2xl font-semibold mb-6 text-foreground flex items-center gap-2">
              <Box className="w-6 h-6 text-primary" />
              Component Examples
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {components.map((component) => (
                <div key={component.name} className="space-y-3">
                  <h3 className="text-sm font-medium text-muted-foreground">{component.name}</h3>
                  <div className="p-6 bg-background border border-border rounded-2xl">
                    {component.element}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Typography */}
        <div className="mt-12">
          <div className="card-base p-6">
            <h2 className="text-2xl font-semibold mb-6 text-foreground flex items-center gap-2">
              <Type className="w-6 h-6 text-primary" />
              Typography Scale
            </h2>
            <div className="space-y-6">
              <div className="pb-4 border-b border-border">
                <h1 className="text-5xl font-bold text-foreground">Explore the World</h1>
                <p className="text-sm text-muted-foreground mt-2">text-5xl font-bold</p>
              </div>
              <div className="pb-4 border-b border-border">
                <h2 className="text-4xl font-bold text-foreground">Adventure Awaits</h2>
                <p className="text-sm text-muted-foreground mt-2">text-4xl font-bold</p>
              </div>
              <div className="pb-4 border-b border-border">
                <h3 className="text-3xl font-semibold text-foreground">Popular Destinations</h3>
                <p className="text-sm text-muted-foreground mt-2">text-3xl font-semibold</p>
              </div>
              <div className="pb-4 border-b border-border">
                <h4 className="text-2xl font-medium text-foreground">Travel Tips & Guides</h4>
                <p className="text-sm text-muted-foreground mt-2">text-2xl font-medium</p>
              </div>
              <div className="pb-4 border-b border-border">
                <p className="text-lg text-foreground">Join our community of solo travelers exploring the world together.</p>
                <p className="text-sm text-muted-foreground mt-2">text-lg (Body Large)</p>
              </div>
              <div className="pb-4 border-b border-border">
                <p className="text-base text-foreground">Connect with like-minded adventurers and share your travel stories.</p>
                <p className="text-sm text-muted-foreground mt-2">text-base (Body Regular)</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Last updated 2 hours ago • 45 travelers online</p>
                <p className="text-xs text-muted-foreground mt-2">text-sm (Body Small)</p>
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Elements */}
        <div className="mt-12">
          <div className="card-base p-6">
            <h2 className="text-2xl font-semibold mb-6 text-foreground flex items-center gap-2">
              <Zap className="w-6 h-6 text-primary" />
              Interactive Elements
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-4">
                <h3 className="font-medium text-foreground">Reactions</h3>
                <div className="p-4 bg-background rounded-2xl">
                  <div className="flex gap-2">
                    <button className="p-3 rounded-2xl hover:bg-muted transition-all duration-200 hover:scale-110">
                      <Heart className="w-5 h-5 text-foreground" />
                    </button>
                    <button className="p-3 rounded-2xl hover:bg-muted transition-all duration-200 hover:scale-110">
                      <span className="text-xl">❤️</span>
                    </button>
                    <button className="p-3 rounded-2xl hover:bg-muted transition-all duration-200 hover:scale-110">
                      <span className="text-xl">🌍</span>
                    </button>
                    <button className="p-3 rounded-2xl hover:bg-muted transition-all duration-200 hover:scale-110">
                      <span className="text-xl">🙌</span>
                    </button>
                    <button className="p-3 rounded-2xl hover:bg-muted transition-all duration-200 hover:scale-110">
                      <span className="text-xl">😮</span>
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="font-medium text-foreground">Navigation Items</h3>
                <div className="space-y-2">
                  <button className="w-full text-left px-4 py-3 rounded-2xl hover:bg-muted transition-all duration-200 flex items-center gap-3 group">
                    <Compass className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
                    <span className="text-sm font-medium text-foreground">Feed</span>
                  </button>
                  <button className="w-full text-left px-4 py-3 rounded-2xl hover:bg-muted transition-all duration-200 flex items-center gap-3 group">
                    <MapPin className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
                    <span className="text-sm font-medium text-foreground">City Hubs</span>
                  </button>
                  <button className="w-full text-left px-4 py-3 rounded-2xl hover:bg-muted transition-all duration-200 flex items-center gap-3 group">
                    <Camera className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
                    <span className="text-sm font-medium text-foreground">Photos</span>
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-medium text-foreground">Action Buttons</h3>
                <div className="space-y-3">
                  <button className="w-full px-5 py-3 bg-primary text-primary-foreground rounded-2xl hover:bg-primary/90 transition-all duration-200 text-sm font-medium shadow-sm hover:shadow-md">
                    Share Story
                  </button>
                  <button className="w-full px-5 py-3 border-2 border-border rounded-2xl hover:bg-muted transition-all duration-200 text-sm font-medium text-foreground">
                    <MessageCircle className="w-4 h-4 mr-2 inline" />
                    Comment
                  </button>
                  <button className="w-full px-5 py-3 text-primary bg-primary/10 hover:bg-primary/20 rounded-2xl transition-all duration-200 text-sm font-medium">
                    Follow Traveler
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Shadows & Effects */}
        <div className="mt-12">
          <div className="card-base p-6">
            <h2 className="text-2xl font-semibold mb-6 text-foreground flex items-center gap-2">
              <Shield className="w-6 h-6 text-primary" />
              Shadows & Effects
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">Card Shadow</h3>
                <div className="p-6 bg-card rounded-2xl shadow-card">
                  <p className="text-sm text-foreground">Default card shadow</p>
                  <p className="text-xs text-muted-foreground mt-1">shadow-card</p>
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">Card Hover Shadow</h3>
                <div className="p-6 bg-card rounded-2xl shadow-card-hover">
                  <p className="text-sm text-foreground">Hover state shadow</p>
                  <p className="text-xs text-muted-foreground mt-1">shadow-card-hover</p>
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">Border Radius</h3>
                <div className="p-6 bg-card rounded-3xl border-2 border-border">
                  <p className="text-sm text-foreground">3xl radius (2rem)</p>
                  <p className="text-xs text-muted-foreground mt-1">rounded-3xl</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}