import { z } from 'zod';

const tripFormSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(80, 'Title must be 80 characters or less'),

  description: z
    .string()
    .optional(),

  startDate: z
    .string()
    .min(1, 'Start date is required'),

  endDate: z
    .string()
    .min(1, 'End date is required'),

  isPrivate: z
    .boolean(),
}).refine((data) => {
  const startDate = new Date(data.startDate);
  const endDate = new Date(data.endDate);
  return endDate >= startDate;
}, {
  message: 'End date must be after start date',
  path: ['endDate'],
});

export type TripFormData = z.infer<typeof tripFormSchema>;

export { tripFormSchema };