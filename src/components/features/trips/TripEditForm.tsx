'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useUnsavedChanges } from '@/hooks/useUnsavedChanges'
import { Edit, Save, X, Info } from 'lucide-react'
import { tripService } from '@/services/trips/tripService'
import { TripsApiError } from '@/lib/api'
import type { Trip } from '@/lib/api'
import { tripFormSchema, type TripFormData } from '@/lib/validations/trip.schema'


interface TripEditFormProps {
  trip: Trip
  onCancel: () => void
  onSave?: (updatedTrip: Trip) => void
}

export function TripEditForm({ trip, onCancel, onSave }: TripEditFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [apiError, setApiError] = useState<string>('')

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
    watch,
  } = useForm<TripFormData>({
    resolver: zodResolver(tripFormSchema),
    defaultValues: {
      title: '',
      description: '',
      startDate: '',
      endDate: '',
      isPrivate: false,
    },
  })

  const watchedValues = watch()

  // Convert trip dates to form format and populate initial data
  useEffect(() => {
    if (trip) {
      const startDate = new Date(trip.startDate)
      const endDate = new Date(trip.endDate)

      reset({
        title: trip.title || '',
        description: '', // Description field available in future update
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        isPrivate: trip.isPrivate || false,
      })
    }
  }, [trip, reset])

  // Check if form has been modified from original
  const hasUnsavedChanges = () => {
    return isDirty
  }

  // Use unsaved changes hook
  const { confirmNavigation } = useUnsavedChanges({
    hasUnsavedChanges: hasUnsavedChanges()
  })


  const onSubmit = async (data: TripFormData) => {
    setIsSubmitting(true)
    setApiError('')

    try {
      // Prepare update data
      const updateData = {
        title: data.title.trim(),
        startDate: new Date(data.startDate).toISOString(),
        endDate: new Date(data.endDate).toISOString(),
        isPrivate: data.isPrivate,
      }

      // Call API to update trip
      const updatedTrip = await tripService.updateTrip(trip.id, updateData)

      // Success - call onSave callback if provided
      if (onSave) {
        onSave(updatedTrip)
      } else {
        onCancel() // Fall back to closing the form
      }

    } catch (error: unknown) {
      console.error('Error updating trip:', error)

      // Handle API validation errors
      if (error instanceof TripsApiError) {
        setApiError(error.message)
      } else {
        setApiError('Failed to update trip')
      }
    } finally {
      setIsSubmitting(false)
    }
  }



  const handleCancel = () => {
    confirmNavigation(onCancel)
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5" />
            Edit Trip
          </CardTitle>
          <CardDescription>
            Update your trip details and preferences
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* General Error */}
            {apiError && (
              <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                {apiError}
              </div>
            )}

            {/* Title */}
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium text-foreground">
                Trip Title *
              </label>
              <Input
                id="title"
                type="text"
                {...register('title')}
                placeholder="e.g., Costa Rica Adventure"
                maxLength={80}
                className={errors.title ? 'border-red-500' : ''}
                aria-invalid={errors.title ? 'true' : 'false'}
                aria-describedby={errors.title ? 'title-error title-hint' : 'title-hint'}
                required
              />
              {errors.title && (
                <p id="title-error" className="text-sm text-red-600" role="alert">{errors.title.message}</p>
              )}
              <p id="title-hint" className="text-xs text-muted-foreground">
                {watchedValues.title?.length || 0}/80 characters
              </p>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium text-foreground">
                Description
              </label>
              <Textarea
                id="description"
                {...register('description')}
                placeholder="Describe your trip plans, activities, or what you're looking for..."
                rows={4}
              />
              <p className="text-xs text-muted-foreground">
                Description field will be available in a future update
              </p>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="startDate" className="text-sm font-medium text-foreground">
                  Start Date *
                </label>
                <Input
                  id="startDate"
                  type="date"
                  {...register('startDate')}
                  className={errors.startDate ? 'border-red-500' : ''}
                />
                {errors.startDate && (
                  <p className="text-sm text-red-600">{errors.startDate.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="endDate" className="text-sm font-medium text-foreground">
                  End Date *
                </label>
                <Input
                  id="endDate"
                  type="date"
                  {...register('endDate')}
                  className={errors.endDate ? 'border-red-500' : ''}
                  min={watchedValues.startDate} // Prevent selecting end date before start date
                />
                {errors.endDate && (
                  <p className="text-sm text-red-600">{errors.endDate.message}</p>
                )}
              </div>
            </div>

            {/* Privacy */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <input
                  id="isPrivate"
                  type="checkbox"
                  {...register('isPrivate')}
                  className="rounded border-gray-300 text-brand-500 focus:ring-brand-500"
                />
                <label htmlFor="isPrivate" className="text-sm font-medium text-foreground">
                  Make this trip private
                </label>
              </div>
              <p className="text-xs text-muted-foreground">
                Private trips are only visible to you and people you share them with
              </p>
            </div>


            {/* Unsaved Changes Indicator */}
            {hasUnsavedChanges() && (
              <div className="p-3 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-md flex items-center gap-2">
                <Info className="w-4 h-4" />
                <span>You have unsaved changes</span>
              </div>
            )}

            {/* Form Actions */}
            <div className="flex gap-4 pt-4">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" aria-hidden="true" />
                    Saving Changes...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isSubmitting}
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

    </>
  )
}