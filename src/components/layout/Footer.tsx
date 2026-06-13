import Link from 'next/link'
import { MapPin, Instagram, Twitter, Facebook } from 'lucide-react'

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="col-span-1">
            <div className="mb-4 flex items-center space-x-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
                <span className="font-bold text-white">SA</span>
              </div>
              <span className="text-xl font-bold">SoloAdventurer</span>
            </div>
            <p className="mb-4 text-gray-400">
              Connect with fellow solo travelers and create unforgettable adventures together.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 transition-colors hover:text-white">
                <Instagram size={20} />
              </a>
              <a href="#" className="text-gray-400 transition-colors hover:text-white">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-gray-400 transition-colors hover:text-white">
                <Facebook size={20} />
              </a>
            </div>
          </div>

          {/* Explore */}
          <div>
            <h3 className="mb-4 text-lg font-semibold">Explore</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/destinations"
                  className="text-gray-400 transition-colors hover:text-white"
                >
                  Popular Destinations
                </Link>
              </li>
              <li>
                <Link
                  href="/travel-guides"
                  className="text-gray-400 transition-colors hover:text-white"
                >
                  Travel Guides
                </Link>
              </li>
              <li>
                <Link href="/stories" className="text-gray-400 transition-colors hover:text-white">
                  Travel Stories
                </Link>
              </li>
              <li>
                <Link
                  href="/safety-tips"
                  className="text-gray-400 transition-colors hover:text-white"
                >
                  Safety Tips
                </Link>
              </li>
            </ul>
          </div>

          {/* Community */}
          <div>
            <h3 className="mb-4 text-lg font-semibold">Community</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/buddies" className="text-gray-400 transition-colors hover:text-white">
                  Find Travel Buddies
                </Link>
              </li>
              <li>
                <Link href="/events" className="text-gray-400 transition-colors hover:text-white">
                  Meetups & Events
                </Link>
              </li>
              <li>
                <Link href="/forum" className="text-gray-400 transition-colors hover:text-white">
                  Community Forum
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-gray-400 transition-colors hover:text-white">
                  Travel Blog
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="mb-4 text-lg font-semibold">Support</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/help" className="text-gray-400 transition-colors hover:text-white">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="/safety" className="text-gray-400 transition-colors hover:text-white">
                  Safety Center
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-400 transition-colors hover:text-white">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-gray-400 transition-colors hover:text-white">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-gray-400 transition-colors hover:text-white">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-gray-800 pt-8">
          <div className="flex flex-col items-center justify-between md:flex-row">
            <div className="mb-4 flex items-center space-x-2 md:mb-0">
              <MapPin size={16} />
              <span className="text-gray-400">Connecting solo travelers worldwide since 2024</span>
            </div>
            <div className="text-sm text-gray-400">
              © 2024 SoloAdventurer. All rights reserved.
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
