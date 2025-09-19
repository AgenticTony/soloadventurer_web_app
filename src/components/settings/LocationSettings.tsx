'use client';

import { useState } from 'react';
import { MapPin, Eye, EyeOff, Users, Globe, Lock, Info, AlertTriangle } from 'lucide-react';
import { usePrivacy, LocationSharingLevel, formatPrivacyLevel, getPrivacyIcon } from '@/contexts/PrivacyContext';

interface LocationSettingsProps {
  className?: string;
}

interface SharingOption {
  value: LocationSharingLevel;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  warning?: string;
}

const SHARING_OPTIONS: SharingOption[] = [
  {
    value: 'off',
    label: 'Off',
    description: 'Your location is completely private and not shared with anyone',
    icon: Lock,
    color: 'text-red-600 bg-red-50 border-red-200',
    warning: undefined,
  },
  {
    value: 'friends',
    label: 'Friends Only',
    description: 'Only people you follow and who follow you back can see your location',
    icon: Users,
    color: 'text-blue-600 bg-blue-50 border-blue-200',
    warning: undefined,
  },
  {
    value: 'everyone',
    label: 'Everyone',
    description: 'All users can see your location when you appear in search results',
    icon: Globe,
    color: 'text-yellow-600 bg-yellow-50 border-yellow-200',
    warning: 'This setting makes your location visible to all users. Consider your privacy carefully.',
  },
];

export function LocationSettings({ className = '' }: LocationSettingsProps) {
  const {
    settings,
    updateLocationSharing,
    togglePreciseLocation,
    togglePrivacyStatus,
  } = usePrivacy();

  const [showAdvanced, setShowAdvanced] = useState(false);

  const currentOption = SHARING_OPTIONS.find(opt => opt.value === settings.locationSharing) || SHARING_OPTIONS[0];

  const handleSharingChange = (level: LocationSharingLevel) => {
    updateLocationSharing(level);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
          <MapPin className="h-5 w-5 text-blue-600" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Location Privacy</h2>
          <p className="text-sm text-gray-500 mt-1">
            Control who can see your location and how precise it appears
          </p>
        </div>
      </div>

      {/* Current Status */}
      <div className={`p-4 rounded-lg border-2 ${currentOption.color}`}>
        <div className="flex items-center gap-3">
          <currentOption.icon className="h-5 w-5" />
          <div>
            <div className="font-medium">
              Current Setting: {currentOption.label}
            </div>
            <div className="text-sm opacity-90 mt-1">
              {currentOption.description}
            </div>
          </div>
        </div>
        {currentOption.warning && (
          <div className="flex items-start gap-2 mt-3 p-2 bg-white/50 rounded border">
            <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-yellow-800">
              {currentOption.warning}
            </p>
          </div>
        )}
      </div>

      {/* Location Sharing Options */}
      <div className="space-y-3">
        <h3 className="font-medium text-gray-900">Who can see your location?</h3>
        <div className="space-y-2">
          {SHARING_OPTIONS.map((option) => (
            <label
              key={option.value}
              className={`flex items-start gap-3 p-4 border rounded-lg cursor-pointer transition-colors hover:bg-gray-50 ${
                settings.locationSharing === option.value
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200'
              }`}
            >
              <input
                type="radio"
                name="locationSharing"
                value={option.value}
                checked={settings.locationSharing === option.value}
                onChange={() => handleSharingChange(option.value)}
                className="mt-1 text-blue-600 focus:ring-blue-500"
              />
              <div className="flex items-start gap-3 flex-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  settings.locationSharing === option.value
                    ? 'bg-blue-100 text-blue-600'
                    : 'bg-gray-100 text-gray-400'
                }`}>
                  <option.icon className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{option.label}</div>
                  <div className="text-sm text-gray-500 mt-1">{option.description}</div>
                </div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Precise Location Toggle */}
      {settings.locationSharing !== 'off' && (
        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-start gap-3">
              <Eye className="h-5 w-5 text-gray-600 mt-0.5" />
              <div>
                <div className="font-medium text-gray-900">Precise Location</div>
                <div className="text-sm text-gray-500 mt-1">
                  {settings.preciseLocation
                    ? 'Your exact location is visible to allowed users'
                    : 'Only your approximate area (city/region) is visible'
                  }
                </div>
              </div>
            </div>
            <button
              onClick={togglePreciseLocation}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                settings.preciseLocation
                  ? 'bg-blue-600'
                  : 'bg-gray-200'
              }`}
              aria-label="Toggle precise location"
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.preciseLocation ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          {settings.preciseLocation && (
            <div className="flex items-center gap-2 mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
              <Info className="h-4 w-4 flex-shrink-0" />
              <span>Your exact coordinates will be visible. Consider your privacy carefully.</span>
            </div>
          )}
        </div>
      )}

      {/* Advanced Settings Toggle */}
      <button
        onClick={() => setShowAdvanced(!showAdvanced)}
        className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
      >
        {showAdvanced ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        {showAdvanced ? 'Hide' : 'Show'} Advanced Settings
      </button>

      {/* Advanced Settings */}
      {showAdvanced && (
        <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-medium text-gray-900">Advanced Privacy</h3>

          {/* Privacy Status Indicator */}
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-gray-900">Show Privacy Status</div>
              <div className="text-sm text-gray-500 mt-1">
                Display privacy indicator {getPrivacyIcon(settings.locationSharing)} on your profile
              </div>
            </div>
            <button
              onClick={togglePrivacyStatus}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                settings.showPrivacyStatus
                  ? 'bg-blue-600'
                  : 'bg-gray-200'
              }`}
              aria-label="Toggle privacy status display"
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.showPrivacyStatus ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Privacy Summary */}
          <div className="p-3 bg-white border border-gray-200 rounded">
            <h4 className="font-medium text-gray-900 mb-2">Current Privacy Level</h4>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-lg">{getPrivacyIcon(settings.locationSharing)}</span>
              <span className="font-medium">{formatPrivacyLevel(settings.locationSharing)}</span>
              {settings.locationSharing !== 'off' && (
                <>
                  <span className="text-gray-400">•</span>
                  <span className="text-gray-600">
                    {settings.preciseLocation ? 'Exact location' : 'Approximate area'}
                  </span>
                </>
              )}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {settings.blockedUsers.length > 0 && `${settings.blockedUsers.length} users blocked • `}
              {settings.hideFromUsers.length > 0 && `Hidden from ${settings.hideFromUsers.length} users • `}
              Privacy status {settings.showPrivacyStatus ? 'visible' : 'hidden'}
            </div>
          </div>

          {/* Location Data Notice */}
          <div className="p-3 bg-blue-50 border border-blue-200 rounded text-sm text-blue-800">
            <div className="flex items-start gap-2">
              <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Location Data Usage</p>
                <p className="mt-1">
                  Your location is only used to show you on maps and help other travelers find you.
                  We never sell or share your location data with third parties.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}