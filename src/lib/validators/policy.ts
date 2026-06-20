import { z } from 'zod';

export const policyUploadSchema = z.object({
  title: z.string().min(5).max(255).trim(),
  ministry: z.string().min(2).max(100).trim(),
  category_id: z.number().int().positive(),
  description: z.string().max(1000).trim().optional(),
});

export type PolicyUploadInput = z.infer<typeof policyUploadSchema>;
