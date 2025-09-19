export interface TripTemplate {
  id: string;
  name: string;
  description: string;
  category: 'adventure' | 'relaxation' | 'culture' | 'nature' | 'urban' | 'business';
  icon: string;
  estimatedDuration: number; // days
  template: {
    title: string;
    description: string;
    isPrivate: boolean;
  };
  suggestions?: {
    activities?: string[];
    packingTips?: string[];
    budgetRange?: string;
  };
}

// Helper function to get dates for templates
function getTemplateDate(daysFromNow: number): string {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return date.toISOString().split('T')[0];
}

export const TRIP_TEMPLATES: TripTemplate[] = [
  {
    id: 'weekend-getaway',
    name: 'Weekend Getaway',
    description: 'Perfect for a quick escape from the daily routine',
    category: 'relaxation',
    icon: '🏖️',
    estimatedDuration: 2,
    template: {
      title: 'Weekend Getaway',
      description: 'A refreshing 2-day escape to recharge and explore somewhere new. Perfect for unwinding and creating memorable moments.',
      isPrivate: false,
    },
    suggestions: {
      activities: ['Spa & Wellness', 'Local Dining', 'Nature Walks', 'Photography'],
      packingTips: ['Comfortable shoes', 'Camera', 'Light jacket', 'Essentials only'],
      budgetRange: '$200-500',
    },
  },
  {
    id: 'road-trip-adventure',
    name: 'Road Trip Adventure',
    description: 'Epic journey across scenic routes and hidden gems',
    category: 'adventure',
    icon: '🚗',
    estimatedDuration: 7,
    template: {
      title: 'Cross-Country Road Trip',
      description: 'An unforgettable week-long adventure exploring scenic highways, charming small towns, and breathtaking landscapes along the way.',
      isPrivate: false,
    },
    suggestions: {
      activities: ['Scenic Drives', 'Roadside Attractions', 'Local Food Stops', 'Hiking'],
      packingTips: ['Road atlas', 'Snacks', 'First aid kit', 'Portable charger'],
      budgetRange: '$800-1500',
    },
  },
  {
    id: 'city-explorer',
    name: 'City Explorer',
    description: 'Dive deep into urban culture, food, and nightlife',
    category: 'urban',
    icon: '🏙️',
    estimatedDuration: 4,
    template: {
      title: 'Urban City Adventure',
      description: 'Immerse yourself in the pulse of city life - from world-class museums and restaurants to vibrant neighborhoods and local experiences.',
      isPrivate: false,
    },
    suggestions: {
      activities: ['Museums', 'Street Food Tours', 'Architecture Walks', 'Nightlife'],
      packingTips: ['Comfortable walking shoes', 'Public transit cards', 'Power bank'],
      budgetRange: '$600-1200',
    },
  },
  {
    id: 'nature-retreat',
    name: 'Nature Retreat',
    description: 'Reconnect with nature in pristine wilderness',
    category: 'nature',
    icon: '🏔️',
    estimatedDuration: 5,
    template: {
      title: 'Mountain & Forest Retreat',
      description: 'Escape to pristine wilderness for hiking, camping, and reconnecting with nature. Perfect for digital detox and outdoor adventures.',
      isPrivate: false,
    },
    suggestions: {
      activities: ['Hiking', 'Camping', 'Wildlife Watching', 'Stargazing'],
      packingTips: ['Hiking boots', 'Sleeping bag', 'Weather gear', 'Navigation tools'],
      budgetRange: '$400-800',
    },
  },
  {
    id: 'cultural-immersion',
    name: 'Cultural Immersion',
    description: 'Deep dive into local traditions and heritage',
    category: 'culture',
    icon: '🏛️',
    estimatedDuration: 6,
    template: {
      title: 'Cultural Heritage Journey',
      description: 'Immerse yourself in rich local culture, traditions, and history. Experience authentic customs, festivals, and connect with local communities.',
      isPrivate: false,
    },
    suggestions: {
      activities: ['Historical Sites', 'Cultural Festivals', 'Local Workshops', 'Traditional Cuisine'],
      packingTips: ['Respectful clothing', 'Language guide', 'Cultural guidebook'],
      budgetRange: '$700-1400',
    },
  },
  {
    id: 'beach-paradise',
    name: 'Beach Paradise',
    description: 'Sun, sand, and crystal-clear waters',
    category: 'relaxation',
    icon: '🌴',
    estimatedDuration: 7,
    template: {
      title: 'Tropical Beach Escape',
      description: 'Relax on pristine beaches with crystal-clear waters, enjoy water sports, and soak up the tropical paradise atmosphere.',
      isPrivate: false,
    },
    suggestions: {
      activities: ['Swimming', 'Snorkeling', 'Beach Volleyball', 'Sunset Watching'],
      packingTips: ['Sunscreen', 'Swimwear', 'Beach towel', 'Waterproof phone case'],
      budgetRange: '$900-2000',
    },
  },
  {
    id: 'adventure-sports',
    name: 'Adventure Sports',
    description: 'Adrenaline-pumping activities and extreme sports',
    category: 'adventure',
    icon: '🧗',
    estimatedDuration: 4,
    template: {
      title: 'Extreme Adventure Challenge',
      description: 'Push your limits with thrilling adventure sports - rock climbing, white-water rafting, and other heart-pumping activities.',
      isPrivate: false,
    },
    suggestions: {
      activities: ['Rock Climbing', 'White-water Rafting', 'Bungee Jumping', 'Zip Lining'],
      packingTips: ['Adventure gear', 'Safety equipment', 'Quick-dry clothing', 'GoPro'],
      budgetRange: '$800-1600',
    },
  },
  {
    id: 'business-trip',
    name: 'Business Trip',
    description: 'Professional travel with networking opportunities',
    category: 'business',
    icon: '💼',
    estimatedDuration: 3,
    template: {
      title: 'Business Conference & Networking',
      description: 'Professional business trip combining work commitments with strategic networking and potential sightseeing opportunities.',
      isPrivate: true,
    },
    suggestions: {
      activities: ['Conference Attendance', 'Networking Events', 'Business Meetings', 'Local Dining'],
      packingTips: ['Business attire', 'Presentation materials', 'Business cards', 'Laptop'],
      budgetRange: '$600-1500',
    },
  },
  {
    id: 'foodie-tour',
    name: 'Foodie Adventure',
    description: 'Culinary journey through local flavors',
    category: 'culture',
    icon: '🍜',
    estimatedDuration: 5,
    template: {
      title: 'Culinary Discovery Tour',
      description: 'Embark on a delicious journey exploring local cuisine, street food, cooking classes, and authentic dining experiences.',
      isPrivate: false,
    },
    suggestions: {
      activities: ['Food Tours', 'Cooking Classes', 'Market Visits', 'Wine Tasting'],
      packingTips: ['Comfortable pants', 'Digestive aids', 'Food journal', 'Good camera'],
      budgetRange: '$700-1300',
    },
  },
  {
    id: 'backpacking-journey',
    name: 'Backpacking Journey',
    description: 'Budget-friendly adventure with authentic experiences',
    category: 'adventure',
    icon: '🎒',
    estimatedDuration: 14,
    template: {
      title: 'Backpacker\'s Adventure',
      description: 'Two weeks of budget-friendly travel, staying in hostels, meeting fellow travelers, and experiencing authentic local culture.',
      isPrivate: false,
    },
    suggestions: {
      activities: ['Hostel Stays', 'Local Transport', 'Free Walking Tours', 'Budget Dining'],
      packingTips: ['Lightweight backpack', 'Travel insurance', 'Hostel gear', 'Budget tracker'],
      budgetRange: '$500-1000',
    },
  },
];

// Helper functions for working with templates
export function getTemplateById(id: string): TripTemplate | undefined {
  return TRIP_TEMPLATES.find(template => template.id === id);
}

export function getTemplatesByCategory(category: TripTemplate['category']): TripTemplate[] {
  return TRIP_TEMPLATES.filter(template => template.category === category);
}

export function getTemplateCategories(): TripTemplate['category'][] {
  return ['adventure', 'relaxation', 'culture', 'nature', 'urban', 'business'];
}

// Function to generate form data from template with proper dates
export function generateFormDataFromTemplate(template: TripTemplate, startDaysFromNow: number = 7) {
  const startDate = getTemplateDate(startDaysFromNow);
  const endDate = getTemplateDate(startDaysFromNow + template.estimatedDuration);

  return {
    title: template.template.title,
    description: template.template.description,
    startDate,
    endDate,
    isPrivate: template.template.isPrivate,
  };
}