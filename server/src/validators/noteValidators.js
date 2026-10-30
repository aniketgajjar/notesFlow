import { z } from 'zod';
import { NOTE_COLORS } from '../models/Note.js';

const tags = z.array(z.string().trim().min(1).max(24).transform((tag) => tag.toLowerCase())).max(10)
  .refine((items) => new Set(items).size === items.length, 'Tags must be unique');

export const createNoteSchema = z.object({
  title: z.string().trim().min(1).max(120),
  content: z.string().trim().min(1).max(20000),
  color: z.enum(NOTE_COLORS).optional(),
  tags: tags.optional(),
}).strict();

export const updateNoteSchema = createNoteSchema.partial().refine((value) => Object.keys(value).length > 0, 'At least one note field is required');
export const noteActionSchema = z.object({ value: z.boolean() }).strict();

const optionalBoolean = z.enum(['true', 'false']).default('false').transform((value) => value === 'true');
export const listNotesSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),
  search: z.string().trim().max(100).optional(),
  tag: z.string().trim().min(1).max(24).optional(),
  archived: optionalBoolean,
  sortBy: z.enum(['updatedAt', 'createdAt', 'title']).default('updatedAt'),
  order: z.enum(['asc', 'desc']).default('desc'),
}).strict();
