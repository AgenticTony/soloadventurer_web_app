import Link from 'next/link'
import { MapPin, Instagram, Twitter, Facebook } from 'lucide-react'

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">SA</span>
              </div>
              <span className="text-xl font-bold">SoloAdventurer</span>
            </div>
            <p className="text-gray-400 mb-4">
              Connect with fellow solo travelers and create unforgettable adventures together.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Instagram size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Facebook size={20} />
              </a>
            </div>
          </div>

          {/* Explore */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Explore</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/destinations" className="text-gray-400 hover:text-white transition-colors">
                  Popular Destinations
                </Link>
              </li>
              <li>
                <Link href="/travel-guides" className="text-gray-400 hover:text-white transition-colors">
                  Travel Guides
                </Link>
              </li>
              <li>
                <Link href="/stories" className="text-gray-400 hover:text-white transition-colors">
                  Travel Stories
                </Link>
              </li>
              <li>
                <Link href="/safety-tips" className="text-gray-400 hover:text-white transition-colors">
                  Safety Tips
                </Link>
              </li>
            </ul>
          </div>

          {/* Community */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Community</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/buddies" className="text-gray-400 hover:text-white transition-colors">
                  Find Travel Buddies
                </Link>
              </li>
              <li>
                <Link href="/events" className="text-gray-400 hover:text-white transition-colors">
                  Meetups & Events
                </Link>
              </li>
              <li>
                <Link href="/forum" className="text-gray-400 hover:text-white transition-colors">
                  Community Forum
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-gray-400 hover:text-white transition-colors">
                  Travel Blog
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/help" className="text-gray-400 hover:text-white transition-colors">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="/safety" className="text-gray-400 hover:text-white transition-colors">
                  Safety Center
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-400 hover:text-white transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-gray-400 hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-gray-400 hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <MapPin size={16} />
              <span className="text-gray-400">Connecting solo travelers worldwide since 2024</span>
            </div>
            <div className="text-gray-400 text-sm">
              © 2024 SoloAdventurer. All rights reserved.
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}