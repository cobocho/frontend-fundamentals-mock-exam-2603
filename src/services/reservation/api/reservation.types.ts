import { roomScheme } from 'services/room/api/rooms.types';
import { z } from 'zod';

export const equipmentScheme = z.enum(['tv', 'whiteboard', 'video', 'speaker']);

export type Equipment = z.infer<typeof equipmentScheme>;

export const reservationScheme = z.object({
  id: z.string(),
  roomId: roomScheme.shape.id,
  date: z.iso.date(),
  start: z.iso.time(),
  end: z.iso.time(),
  attendees: z.number(),
  equipment: z.array(equipmentScheme),
});

export type Reservation = z.infer<typeof reservationScheme>;
