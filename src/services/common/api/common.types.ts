import { z } from 'zod';

export const mutationResponseScheme = z.discriminatedUnion('ok', [
  z.object({ ok: z.literal(true) }),
  z.object({ ok: z.literal(false), code: z.string().optional(), message: z.string().optional() }),
]);

export type MutationResponse = z.infer<typeof mutationResponseScheme>;
