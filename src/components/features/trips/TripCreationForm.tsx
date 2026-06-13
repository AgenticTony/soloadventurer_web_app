'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { tripService } from '@/services/trips/tripService'
import { TripsApiError } from '@/lib/api'
import { MapPin, Save, X, Sparkles } from 'lucide-react'
import { tripFormSchema, type TripFormData } from '@/lib/validations/trip.schema'

export function TripCreationForm() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [apiError, setApiError] = useState<string>('')

  const {
    register,
    handleSubmit,
    formState: { errors },
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

  const onSubmit = async (data: TripFormData) => {
    setIsSubmitting(true)
    setApiError('')

    try {
      // Convert dates to ISO strings
      const tripData = {
        title: data.title.trim(),
        startDate: new Date(data.startDate).toISOString(),
        endDate: new Date(data.endDate).toISOString(),
        isPrivate: data.isPrivate,
      }

      const response = await tripService.createTrip(tripData)

      // Success - redirect to created trip
      router.push(`/trips/${response.id}`)
    } catch (error: unknown) {
      console.error('Error creating trip:', error)

      // Handle API validation errors
      if (error instanceof TripsApiError) {
        setApiError(error.message)
      } else {
        setApiError('Failed to create trip')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    router.push('/trips')
  }

  return (
    <Card className="mx-auto max-w-2xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Create New Trip
            </CardTitle>
            <CardDescription>
              Plan your next adventure and share it with fellow travelers
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* General Error */}
          {apiError && (
            <div
              className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-600"
              role="alert"
              aria-live="polite"
            >
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
              <p id="title-error" className="text-sm text-red-600" role="alert">
                {errors.title.message}
              </p>
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
              aria-describedby="description-hint"
            />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="startDate" className="text-sm font-medium text-foreground">
                Start Date *
              </label>
              <Input
                id="startDate"
                type="date"
                {...register('startDate')}
                className={errors.startDate ? 'border-red-500' : ''}
                aria-invalid={errors.startDate ? 'true' : 'false'}
                aria-describedby={errors.startDate ? 'startDate-error' : undefined}
                required
              />
              {errors.startDate && (
                <p id="startDate-error" className="text-sm text-red-600" role="alert">
                  {errors.startDate.message}
                </p>
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
                aria-invalid={errors.endDate ? 'true' : 'false'}
                aria-describedby={errors.endDate ? 'endDate-error' : undefined}
                required
              />
              {errors.endDate && (
                <p id="endDate-error" className="text-sm text-red-600" role="alert">
                  {errors.endDate.message}
                </p>
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
                aria-describedby="privacy-hint"
              />
              <label htmlFor="isPrivate" className="text-sm font-medium text-foreground">
                Make this trip private
              </label>
            </div>
            <p id="privacy-hint" className="text-xs text-muted-foreground">
              Private trips are only visible to you and people you share them with
            </p>
          </div>

          {/* Form Actions */}
          <div className="flex gap-4 pt-4">
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? (
                <>
                  <div
                    className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"
                    aria-hidden="true"
                  />
                  Creating Trip...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Create Trip
                </>
              )}
            </Button>
            <Button type="button" variant="outline" onClick={handleCancel} disabled={isSubmitting}>
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
