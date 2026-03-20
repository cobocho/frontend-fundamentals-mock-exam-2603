import { describe, test, expect } from 'vitest';
import { byFloor, byMinCapacity, byEquipment, byAvailableTime, combineFilters } from './AvailableRoomList.lib';
import type { Room } from 'services/room/api';
import type { Reservation } from 'services/reservation';

const createRoom = (overrides: Partial<Room> = {}): Room => ({
  id: '1',
  name: '회의실 A',
  floor: 1,
  capacity: 10,
  equipment: [],
  ...overrides,
});

const createReservation = (overrides: Partial<Reservation> = {}): Reservation => ({
  id: 'r1',
  roomId: '1',
  date: '2026-03-20',
  start: '10:00',
  end: '11:00',
  attendees: 3,
  equipment: [],
  ...overrides,
});

describe('byFloor', () => {
  test('해당 층의 방만 통과한다', () => {
    const filter = byFloor(3);

    expect(filter(createRoom({ floor: 3 }))).toBe(true);
    expect(filter(createRoom({ floor: 1 }))).toBe(false);
  });
});

describe('byMinCapacity', () => {
  test('수용 인원이 최소 인원 이상인 방만 통과한다', () => {
    const filter = byMinCapacity(5);

    expect(filter(createRoom({ capacity: 10 }))).toBe(true);
    expect(filter(createRoom({ capacity: 5 }))).toBe(true);
    expect(filter(createRoom({ capacity: 3 }))).toBe(false);
  });
});

describe('byEquipment', () => {
  test('요구 장비를 모두 갖춘 방만 통과한다', () => {
    const filter = byEquipment(['tv', 'whiteboard']);

    expect(filter(createRoom({ equipment: ['tv', 'whiteboard', 'speaker'] }))).toBe(true);
    expect(filter(createRoom({ equipment: ['tv'] }))).toBe(false);
    expect(filter(createRoom({ equipment: [] }))).toBe(false);
  });

  test('빈 장비 목록이면 모든 방이 통과한다', () => {
    const filter = byEquipment([]);

    expect(filter(createRoom({ equipment: [] }))).toBe(true);
    expect(filter(createRoom({ equipment: ['tv'] }))).toBe(true);
  });
});

describe('byAvailableTime', () => {
  const reservations = [
    createReservation({ roomId: '1', start: '10:00', end: '11:00' }),
    createReservation({ roomId: '1', start: '14:00', end: '15:00' }),
    createReservation({ roomId: '2', start: '09:00', end: '10:00' }),
  ];

  test('예약이 없는 시간대면 통과한다', () => {
    const filter = byAvailableTime(reservations, '12:00', '13:00');

    expect(filter(createRoom({ id: '1' }))).toBe(true);
  });

  test('예약과 시간이 겹치면 통과하지 못한다', () => {
    const filter = byAvailableTime(reservations, '10:30', '11:30');

    expect(filter(createRoom({ id: '1' }))).toBe(false);
  });

  test('예약이 없는 방은 통과한다', () => {
    const filter = byAvailableTime(reservations, '10:00', '11:00');

    expect(filter(createRoom({ id: '3' }))).toBe(true);
  });

  test('예약 끝 시간과 시작 시간이 같으면 겹치지 않는다', () => {
    const filter = byAvailableTime(reservations, '11:00', '12:00');

    expect(filter(createRoom({ id: '1' }))).toBe(true);
  });
});

describe('combineFilters', () => {
  test('모든 필터를 통과해야 통과한다', () => {
    const filter = combineFilters(byFloor(3), byMinCapacity(5));

    expect(filter(createRoom({ floor: 3, capacity: 10 }))).toBe(true);
    expect(filter(createRoom({ floor: 3, capacity: 3 }))).toBe(false);
    expect(filter(createRoom({ floor: 1, capacity: 10 }))).toBe(false);
  });

  test('필터가 없으면 모든 방이 통과한다', () => {
    const filter = combineFilters();

    expect(filter(createRoom())).toBe(true);
  });
});
