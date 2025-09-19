'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { ItineraryItem } from '@/types/trip';
import {
  Plus,
  GripVertical,
  MapPin,
  Clock,
  CheckCircle2,
  Circle,
  Trash2,
  Edit,
  Save,
  X,
  Car,
  Bed,
  UtensilsCrossed,
  Calendar,
  Star
} from 'lucide-react';

interface TripItineraryProps {
  items: ItineraryItem[];
  onChange: (items: ItineraryItem[]) => void;
  editable?: boolean;
  className?: string;
}

interface NewItemForm {
  title: string;
  description: string;
  location: string;
  startTime: string;
  endTime: string;
  type: ItineraryItem['type'];
}

const ITEM_TYPES: Array<{ value: ItineraryItem['type']; label: string; icon: React.ElementType }> = [
  { value: 'activity', label: 'Activity', icon: Star },
  { value: 'transport', label: 'Transport', icon: Car },
  { value: 'accommodation', label: 'Accommodation', icon: Bed },
  { value: 'meal', label: 'Meal', icon: UtensilsCrossed },
  { value: 'other', label: 'Other', icon: Calendar },
];

export function TripItinerary({ items, onChange, editable = true, className = '' }: TripItineraryProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [newItem, setNewItem] = useState<NewItemForm>({
    title: '',
    description: '',
    location: '',
    startTime: '',
    endTime: '',
    type: 'activity',
  });

  const dragCounter = useRef(0);

  const getTypeIcon = (type: ItineraryItem['type']) => {
    const typeConfig = ITEM_TYPES.find(t => t.value === type);
    return typeConfig?.icon || Calendar;
  };

  const getTypeColor = (type: ItineraryItem['type']) => {
    const colors = {
      activity: 'bg-blue-100 text-blue-700',
      transport: 'bg-green-100 text-green-700',
      accommodation: 'bg-purple-100 text-purple-700',
      meal: 'bg-orange-100 text-orange-700',
      other: 'bg-gray-100 text-gray-700',
    };
    return colors[type] || colors.other;
  };

  const generateId = () => {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  };

  const handleAddItem = () => {
    if (!newItem.title.trim()) return;

    const item: ItineraryItem = {
      id: generateId(),
      title: newItem.title.trim(),
      description: newItem.description.trim() || undefined,
      location: newItem.location.trim() || undefined,
      startTime: newItem.startTime || undefined,
      endTime: newItem.endTime || undefined,
      type: newItem.type,
      order: items.length,
      completed: false,
    };

    onChange([...items, item]);
    setNewItem({
      title: '',
      description: '',
      location: '',
      startTime: '',
      endTime: '',
      type: 'activity',
    });
    setShowAddForm(false);
  };

  const handleDeleteItem = (id: string) => {
    const filtered = items.filter(item => item.id !== id);
    // Reorder remaining items
    const reordered = filtered.map((item, index) => ({ ...item, order: index }));
    onChange(reordered);
  };

  const handleToggleComplete = (id: string) => {
    const updated = items.map(item =>
      item.id === id ? { ...item, completed: !item.completed } : item
    );
    onChange(updated);
  };

  const handleUpdateItem = (id: string, updates: Partial<ItineraryItem>) => {
    const updated = items.map(item =>
      item.id === id ? { ...item, ...updates } : item
    );
    onChange(updated);
    setEditingId(null);
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.currentTarget.outerHTML);
    dragCounter.current = 0;
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    dragCounter.current = 0;
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragEnter = () => {
    dragCounter.current++;
  };

  const handleDragLeave = () => {
    dragCounter.current--;
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();

    if (draggedIndex === null || draggedIndex === dropIndex) return;

    const reorderedItems = [...items];
    const draggedItem = reorderedItems[draggedIndex];

    // Remove the dragged item
    reorderedItems.splice(draggedIndex, 1);

    // Insert at new position
    reorderedItems.splice(dropIndex, 0, draggedItem);

    // Update order numbers
    const finalItems = reorderedItems.map((item, index) => ({
      ...item,
      order: index
    }));

    onChange(finalItems);
    setDraggedIndex(null);
  };

  const sortedItems = [...items].sort((a, b) => a.order - b.order);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Itinerary</h3>
        {editable && (
          <Button
            onClick={() => setShowAddForm(true)}
            size="sm"
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Item
          </Button>
        )}
      </div>

      {/* Add Item Form */}
      {showAddForm && editable && (
        <Card className="border-dashed border-2 border-blue-300">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Add New Item</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Title *</label>
                <Input
                  value={newItem.title}
                  onChange={(e) => setNewItem(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g., Visit Eiffel Tower"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Type</label>
                <select
                  value={newItem.type}
                  onChange={(e) => setNewItem(prev => ({ ...prev, type: e.target.value as ItineraryItem['type'] }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {ITEM_TYPES.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={newItem.description}
                onChange={(e) => setNewItem(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Optional details about this item"
                rows={2}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium">Location</label>
                <Input
                  value={newItem.location}
                  onChange={(e) => setNewItem(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="Optional location"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Start Time</label>
                <Input
                  type="time"
                  value={newItem.startTime}
                  onChange={(e) => setNewItem(prev => ({ ...prev, startTime: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-sm font-medium">End Time</label>
                <Input
                  type="time"
                  value={newItem.endTime}
                  onChange={(e) => setNewItem(prev => ({ ...prev, endTime: e.target.value }))}
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button onClick={handleAddItem} size="sm">
                <Save className="h-4 w-4 mr-2" />
                Add Item
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAddForm(false)}
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Itinerary Items */}
      <div className="space-y-3">
        {sortedItems.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Calendar className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p>No itinerary items yet</p>
            {editable && (
              <p className="text-sm">Add your first item to get started</p>
            )}
          </div>
        ) : (
          sortedItems.map((item, index) => {
            const TypeIcon = getTypeIcon(item.type);
            const isEditing = editingId === item.id;

            return (
              <Card
                key={item.id}
                className={`transition-all duration-200 ${
                  draggedIndex === index ? 'opacity-50' : ''
                } ${item.completed ? 'bg-gray-50' : ''}`}
                draggable={editable}
                onDragStart={(e) => handleDragStart(e, index)}
                onDragEnd={handleDragEnd}
                onDragOver={handleDragOver}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, index)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    {/* Drag Handle */}
                    {editable && (
                      <div className="flex flex-col items-center gap-1 pt-1">
                        <GripVertical className="h-4 w-4 text-gray-400 cursor-grab active:cursor-grabbing" />
                        <button
                          onClick={() => handleToggleComplete(item.id)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          {item.completed ? (
                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                          ) : (
                            <Circle className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                    )}

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <TypeIcon className="h-4 w-4 text-gray-500" />
                          {isEditing ? (
                            <Input
                              defaultValue={item.title}
                              onBlur={(e) => handleUpdateItem(item.id, { title: e.target.value })}
                              className="text-base font-medium"
                              autoFocus
                            />
                          ) : (
                            <h4 className={`text-base font-medium ${item.completed ? 'line-through text-gray-500' : ''}`}>
                              {item.title}
                            </h4>
                          )}
                          <Badge className={getTypeColor(item.type)}>
                            {ITEM_TYPES.find(t => t.value === item.type)?.label}
                          </Badge>
                        </div>

                        {/* Actions */}
                        {editable && (
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setEditingId(isEditing ? null : item.id)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteItem(item.id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>

                      {/* Details */}
                      <div className="space-y-1 text-sm text-gray-600">
                        {item.description && (
                          <p className={item.completed ? 'line-through' : ''}>{item.description}</p>
                        )}

                        <div className="flex items-center gap-4 text-xs">
                          {item.location && (
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {item.location}
                            </div>
                          )}
                          {(item.startTime || item.endTime) && (
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {item.startTime && item.endTime
                                ? `${item.startTime} - ${item.endTime}`
                                : item.startTime || item.endTime}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}