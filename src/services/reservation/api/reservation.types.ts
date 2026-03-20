import { mutationResponseScheme } from 'services/common';
import { roomScheme } from 'services/room/api/rooms.types';
import { z } from 'zod';

export const equipmentScheme = z.enum(['tv', 'whiteboard', 'video', 'speaker']);

export type Equipment = z.infer<typeof equipmentScheme>;

export const reservationScheme = z.object({
  id: z.string(),
  roomId: roomScheme.shape.id,
  date: z.iso.date(),
  start: z.string(), // HH:mm
  end: z.string(), // HH:mm
  attendees: z.number(),
  equipment: z.array(equipmentScheme),
});

export type Reservation = z.infer<typeof reservationScheme>;

// GET /api/reservations?date={date}
export const getReservationsRequestScheme = z.object({
  date: z.iso.date(),
});
export type GetReservationsRequest = z.infer<typeof getReservationsRequestScheme>;

// GET /api/reservations?date={date}
export const getReservationsResponseScheme = z.array(reservationScheme);

export type GetReservationsResponse = z.infer<typeof getReservationsResponseScheme>;

// POST /api/reservations
export const postReservationRequestScheme = z.object({
  roomId: roomScheme.shape.id,
  date: z.iso.date(),
  start: z.string(), // HH:mm
  end: z.string(), // HH:mm
  attendees: z.number(),
  equipment: z.array(equipmentScheme),
});
export type PostReservationRequest = z.infer<typeof postReservationRequestScheme>;

export const postReservationResponseScheme = z.discriminatedUnion('ok', [
  z.object({ ok: z.literal(true), reservation: reservationScheme }),
  z.object({ ok: z.literal(false), code: z.string().optional(), message: z.string().optional() }),
]);
export type PostReservationResponse = z.infer<typeof postReservationResponseScheme>;

// GET /api/my-reservations
export const getMyReservationsResponseScheme = z.array(reservationScheme);
export type GetMyReservationsResponse = z.infer<typeof getMyReservationsResponseScheme>;

// DELETE /api/reservations/:id
export const deleteReservationResponseScheme = mutationResponseScheme;
export type DeleteReservationResponse = z.infer<typeof deleteReservationResponseScheme>;
