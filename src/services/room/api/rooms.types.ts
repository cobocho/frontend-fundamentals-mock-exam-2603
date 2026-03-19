import { z } from 'zod';

export const roomScheme = z.object({
  id: z.string(),
  name: z.string(),
  floor: z.number(),
  capacity: z.number(),
  equipment: z.array(z.string()),
});

export type Room = z.infer<typeof roomScheme>;

// GET /api/rooms
export const getRoomsResponseScheme = z.array(roomScheme);

export type GetRoomsResponse = z.infer<typeof getRoomsResponseScheme>;
