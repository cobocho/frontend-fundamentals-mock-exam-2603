import { describe, test, expect } from 'vitest';
import { getFloorsByRooms } from './room';
import type { Room } from '../api';

const createRoom = (overrides: Partial<Room> = {}): Room => ({
  id: '1',
  name: '회의실 A',
  floor: 1,
  capacity: 10,
  equipment: [],
  ...overrides,
});

describe('getFloorsByRooms', () => {
  test('빈 배열이면 빈 배열을 반환한다', () => {
    expect(getFloorsByRooms([])).toEqual([]);
  });

  test('방 목록에서 중복 없이 층 목록을 반환한다', () => {
    const rooms = [
      createRoom({ id: '1', floor: 1 }),
      createRoom({ id: '2', floor: 3 }),
      createRoom({ id: '3', floor: 1 }),
      createRoom({ id: '4', floor: 5 }),
    ];

    expect(getFloorsByRooms(rooms)).toEqual([1, 3, 5]);
  });

  test('모든 방이 같은 층이면 하나만 반환한다', () => {
    const rooms = [
      createRoom({ id: '1', floor: 2 }),
      createRoom({ id: '2', floor: 2 }),
    ];

    expect(getFloorsByRooms(rooms)).toEqual([2]);
  });

  test('방이 하나면 해당 층만 반환한다', () => {
    const rooms = [createRoom({ floor: 7 })];

    expect(getFloorsByRooms(rooms)).toEqual([7]);
  });
});
