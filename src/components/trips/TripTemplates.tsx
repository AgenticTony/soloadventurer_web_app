'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  TRIP_TEMPLATES,
  TripTemplate,
  getTemplateCategories,
  getTemplatesByCategory,
  generateFormDataFromTemplate
} from '@/data/tripTemplates';
import { Clock, DollarSign, MapPin, Sparkles, X } from 'lucide-react';

interface TripFormData {
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  isPrivate: boolean;
}

interface TripTemplatesProps {
  onSelectTemplate: (formData: TripFormData) => void;
  onClose: () => void;
  isOpen: boolean;
}

export function TripTemplates({ onSelectTemplate, onClose, isOpen }: TripTemplatesProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTemplate, setSelectedTemplate] = useState<TripTemplate | null>(null);

  if (!isOpen) return null;

  const categories = getTemplateCategories();
  const filteredTemplates = selectedCategory === 'all'
    ? TRIP_TEMPLATES
    : getTemplatesByCategory(selectedCategory as TripTemplate['category']);

  const handleTemplateSelect = (template: TripTemplate) => {
    setSelectedTemplate(template);
  };

  const handleUseTemplate = () => {
    if (selectedTemplate) {
      const formData = generateFormDataFromTemplate(selectedTemplate);
      onSelectTemplate(formData);
      onClose();
    }
  };

  const getCategoryDisplayName = (category: string) => {
    const names: Record<string, string> = {
      'adventure': 'Adventure',
      'relaxation': 'Relaxation',
      'culture': 'Culture',
      'nature': 'Nature',
      'urban': 'Urban',
      'business': 'Business',
    };
    return names[category] || category;
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'adventure': 'bg-orange-100 text-orange-700',
      'relaxation': 'bg-blue-100 text-blue-700',
      'culture': 'bg-purple-100 text-purple-700',
      'nature': 'bg-green-100 text-green-700',
      'urban': 'bg-gray-100 text-gray-700',
      'business': 'bg-indigo-100 text-indigo-700',
    };
    return colors[category] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-yellow-500" />
                Trip Templates
              </h2>
              <p className="text-gray-600 mt-1">Choose a template to get started quickly</p>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Category Filter */}
          <div className="flex gap-2 mt-4 flex-wrap">
            <Button
              variant={selectedCategory === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory('all')}
              className="text-xs"
            >
              All Templates
            </Button>
            {categories.map(category => (
              <Button
                key={category}
                variant={selectedCategory === category ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className="text-xs"
              >
                {getCategoryDisplayName(category)}
              </Button>
            ))}
          </div>
        </div>

        <div className="flex h-[calc(90vh-140px)]">
          {/* Templates List */}
          <div className="w-1/2 border-r border-gray-200 overflow-y-auto p-4">
            <div className="space-y-3">
              {filteredTemplates.map(template => (
                <Card
                  key={template.id}
                  className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                    selectedTemplate?.id === template.id
                      ? 'ring-2 ring-blue-500 shadow-md'
                      : 'hover:shadow-sm'
                  }`}
                  onClick={() => handleTemplateSelect(template)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{template.icon}</span>
                        <div>
                          <CardTitle className="text-lg">{template.name}</CardTitle>
                          <CardDescription className="text-sm">
                            {template.description}
                          </CardDescription>
                        </div>
                      </div>
                      <Badge className={getCategoryColor(template.category)}>
                        {getCategoryDisplayName(template.category)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {template.estimatedDuration} days
                      </div>
                      {template.suggestions?.budgetRange && (
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4" />
                          {template.suggestions.budgetRange}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Template Preview */}
          <div className="w-1/2 overflow-y-auto p-6">
            {selectedTemplate ? (
              <div className="space-y-6">
                {/* Template Header */}
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-3xl">{selectedTemplate.icon}</span>
                    <div>
                      <h3 className="text-xl font-bold">{selectedTemplate.name}</h3>
                      <p className="text-gray-600">{selectedTemplate.description}</p>
                    </div>
                  </div>
                  <Badge className={getCategoryColor(selectedTemplate.category)}>
                    {getCategoryDisplayName(selectedTemplate.category)}
                  </Badge>
                </div>

                {/* Trip Details Preview */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Trip Details
                  </h4>
                  <div className="space-y-2">
                    <div>
                      <span className="font-medium">Title:</span>
                      <p className="text-gray-700">{selectedTemplate.template.title}</p>
                    </div>
                    <div>
                      <span className="font-medium">Description:</span>
                      <p className="text-gray-700">{selectedTemplate.template.description}</p>
                    </div>
                    <div className="flex items-center gap-4 pt-2">
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Clock className="h-4 w-4" />
                        {selectedTemplate.estimatedDuration} days
                      </div>
                      <div className="text-sm text-gray-600">
                        Privacy: {selectedTemplate.template.isPrivate ? 'Private' : 'Public'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Suggestions */}
                {selectedTemplate.suggestions && (
                  <div className="space-y-4">
                    {selectedTemplate.suggestions.activities && (
                      <div>
                        <h4 className="font-semibold mb-2">Suggested Activities</h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedTemplate.suggestions.activities.map((activity, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {activity}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedTemplate.suggestions.packingTips && (
                      <div>
                        <h4 className="font-semibold mb-2">Packing Tips</h4>
                        <ul className="text-sm text-gray-700 space-y-1">
                          {selectedTemplate.suggestions.packingTips.map((tip, index) => (
                            <li key={index} className="flex items-center gap-2">
                              <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                              {tip}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {selectedTemplate.suggestions.budgetRange && (
                      <div>
                        <h4 className="font-semibold mb-2">Estimated Budget</h4>
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                          <DollarSign className="h-4 w-4" />
                          {selectedTemplate.suggestions.budgetRange}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Use Template Button */}
                <div className="pt-4 border-t border-gray-200">
                  <Button
                    onClick={handleUseTemplate}
                    className="w-full"
                    size="lg"
                  >
                    Use This Template
                  </Button>
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    You can modify all details after selecting this template
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                  <MapPin className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Select a template to see details and preview</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}