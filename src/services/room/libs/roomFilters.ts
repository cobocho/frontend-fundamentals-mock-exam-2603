import type { Room, Equipment } from '../api';
import type { Reservation } from 'services/reservation';

export type RoomFilter = (room: Room) => boolean;

export const byFloor =
  (floor: number): RoomFilter =>
  room =>
    room.floor === floor;

export const byMinCapacity =
  (minCapacity: number): RoomFilter =>
  room =>
    room.capacity >= minCapacity;

export const byEquipment =
  (required: Equipment[]): RoomFilter =>
  room =>
    required.every(e => room.equipment.includes(e));

export const byAvailableTime =
  (reservations: Reservation[], start: string, end: string): RoomFilter =>
  room => {
    const roomReservations = reservations.filter(r => r.roomId === room.id);
    return roomReservations.every(r => end <= r.start || start >= r.end);
  };

export const combineFilters =
  (...filters: RoomFilter[]): RoomFilter =>
  room =>
    filters.every(filter => filter(room));
