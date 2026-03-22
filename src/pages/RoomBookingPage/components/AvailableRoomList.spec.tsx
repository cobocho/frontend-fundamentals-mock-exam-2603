import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, test, expect, vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AvailableRoomList } from './AvailableRoomList';
import type { Room } from 'services/room/api';
import type { ReservationSearch } from 'services/reservation';
import { Suspense } from 'react';

const mockRooms: Room[] = [
  { id: '1', name: '회의실 A', floor: 1, capacity: 5, equipment: ['tv'] },
  { id: '2', name: '회의실 B', floor: 2, capacity: 10, equipment: ['tv', 'whiteboard'] },
  { id: '3', name: '회의실 C', floor: 1, capacity: 3, equipment: [] },
];

const mockReservations = [
  { id: 'r1', roomId: '1', date: '2026-03-20', start: '10:00', end: '11:00', attendees: 3, equipment: [] },
  { id: 'r2', roomId: '2', date: '2026-03-20', start: '14:00', end: '15:00', attendees: 2, equipment: [] },
];

vi.mock('services/room', async () => {
  const actual = await vi.importActual('services/room');
  return {
    ...actual,
    roomQueries: {
      all: () => ['rooms'],
      list: () => ({
        queryKey: ['rooms', 'list'],
        queryFn: () => Promise.resolve(mockRooms),
      }),
    },
  };
});

vi.mock('services/reservation', async () => {
  const actual = await vi.importActual('services/reservation');
  return {
    ...actual,
    reservationQueries: {
      all: () => ['reservations'],
      lists: () => ['reservations', 'list'],
      list: (params: { date: string }) => ({
        queryKey: ['reservations', 'list', params],
        queryFn: () => Promise.resolve(mockReservations),
      }),
    },
  };
});

const defaultFilters: ReservationSearch = {
  date: '2026-03-20',
  start: '12:00',
  end: '13:00',
  attendees: 1,
  equipment: [],
  preferredFloor: null,
};

function renderComponent(overrides: { filters?: Partial<ReservationSearch>; onSelect?: (room: Room) => void } = {}) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const onSelect = overrides.onSelect ?? vi.fn();
  const filters = { ...defaultFilters, ...overrides.filters };

  render(
    <QueryClientProvider client={queryClient}>
      <Suspense fallback={null}>
        <AvailableRoomList filters={filters} onSelect={onSelect} />
      </Suspense>
    </QueryClientProvider>
  );

  return { onSelect };
}

describe('AvailableRoomList', () => {
  test('예약 시간과 겹치지 않는 방만 표시된다', async () => {
    renderComponent({ filters: { start: '12:00', end: '13:00' } });

    expect(await screen.findByText('회의실 A')).toBeInTheDocument();
    expect(screen.getByText('회의실 B')).toBeInTheDocument();
    expect(screen.getByText('회의실 C')).toBeInTheDocument();
    expect(screen.getByText('3개')).toBeInTheDocument();
  });

  test('예약 시간이 겹치는 방은 제외된다', async () => {
    renderComponent({ filters: { start: '10:00', end: '11:00' } });

    await screen.findByText('회의실 B');
    expect(screen.queryByText('회의실 A')).not.toBeInTheDocument();
    expect(screen.getByText('회의실 C')).toBeInTheDocument();
    expect(screen.getByText('2개')).toBeInTheDocument();
  });

  test('참석 인원보다 수용 인원이 적은 방은 제외된다', async () => {
    renderComponent({ filters: { attendees: 5 } });

    await screen.findByText('회의실 A');
    expect(screen.getByText('회의실 B')).toBeInTheDocument();
    expect(screen.queryByText('회의실 C')).not.toBeInTheDocument();
    expect(screen.getByText('2개')).toBeInTheDocument();
  });

  test('선호 층으로 필터링된다', async () => {
    renderComponent({ filters: { preferredFloor: 2 } });

    await screen.findByText('회의실 B');
    expect(screen.queryByText('회의실 A')).not.toBeInTheDocument();
    expect(screen.queryByText('회의실 C')).not.toBeInTheDocument();
  });

  test('필요 장비로 필터링된다', async () => {
    renderComponent({ filters: { equipment: ['tv', 'whiteboard'] } });

    await screen.findByText('회의실 B');
    expect(screen.queryByText('회의실 A')).not.toBeInTheDocument();
    expect(screen.queryByText('회의실 C')).not.toBeInTheDocument();
  });

  test('방을 클릭하면 onSelect이 호출된다', async () => {
    const user = userEvent.setup();
    const { onSelect } = renderComponent();

    await screen.findByLabelText('회의실 A');
    await user.click(screen.getByLabelText('회의실 A'));

    expect(onSelect).toHaveBeenCalledWith(mockRooms[0]);
  });

  test('조건에 맞는 방이 없으면 0개가 표시된다', async () => {
    renderComponent({ filters: { attendees: 100 } });

    expect(await screen.findByText('0개')).toBeInTheDocument();
  });
});
