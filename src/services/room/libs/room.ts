import { Room } from '../api';

export const getFloorsByRooms = (rooms: Room[]) => {
  const floors = new Set<number>();

  rooms.forEach(room => {
    floors.add(room.floor);
  });

  return Array.from(floors);
};
