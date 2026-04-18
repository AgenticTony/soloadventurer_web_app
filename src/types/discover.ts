export type DiscoverTabId = 'near-you' | 'people' | 'feed' | 'meetups';

export interface CityHero {
  name: string;
  country: string;
  travelerCount: number;
  weather: {
    temp: number;
    condition: 'sunny' | 'cloudy' | 'rainy';
  };
}

export interface TrendingSpot {
  id: string;
  name: string;
  visitorCount: number;
}

export interface MeetupPreview {
  id: string;
  title: string;
  date: string;
  location: string;
  attendeeCount: number;
  category: string;
  description: string;
  host: { name: string; avatar: string | null };
}

export interface DiscoverFilter {
  id: string;
  label: string;
}
