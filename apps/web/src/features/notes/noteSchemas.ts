import { z } from 'zod';

/**
 * Validation schemas for note title + content. Reused on the form layer
 * (react-hook-form resolver) and could be reused on a future server.
 */

export const noteSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, 'Title must be at least 3 characters')
    .max(120, 'Title must be at most 120 characters'),
  content: z
    .string()
    .trim()
    .min(1, 'Content is required')
    .max(5000, 'Content must be at most 5000 characters'),
});

export const noteContentSchema = noteSchema.pick({ content: true });

export type NoteFormValues = z.infer<typeof noteSchema>;
export type NoteContentValues = z.infer<typeof noteContentSchema>;
