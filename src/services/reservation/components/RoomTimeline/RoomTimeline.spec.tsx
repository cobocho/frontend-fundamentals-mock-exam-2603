import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, test, expect, vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RoomTimeline } from './RoomTimeline';
import { Suspense } from 'react';

const mockRooms = [
  { id: '1', name: '회의실 A', floor: 1, capacity: 10, equipment: ['tv'] },
  { id: '2', name: '회의실 B', floor: 2, capacity: 5, equipment: [] },
];

const mockReservations = [
  { id: 'r1', roomId: '1', date: '2026-03-20', start: '10:00', end: '11:00', attendees: 3, equipment: ['tv'] },
  { id: 'r2', roomId: '1', date: '2026-03-20', start: '14:00', end: '15:00', attendees: 2, equipment: [] },
  { id: 'r3', roomId: '2', date: '2026-03-20', start: '09:00', end: '10:00', attendees: 4, equipment: [] },
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

function renderTimeline() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    <QueryClientProvider client={queryClient}>
      <Suspense fallback={null}>
        <RoomTimeline date="2026-03-20" />
      </Suspense>
    </QueryClientProvider>
  );
}

describe('RoomTimeline', () => {
  test('회의실 이름이 표시된다', async () => {
    renderTimeline();

    expect(await screen.findByText('회의실 A')).toBeInTheDocument();
    expect(screen.getByText('회의실 B')).toBeInTheDocument();
  });

  test('예약 바를 클릭하면 상세 tooltip이 표시된다', async () => {
    const user = userEvent.setup();
    renderTimeline();

    await screen.findByText('회의실 A');
    await user.click(screen.getByLabelText('회의실 A 10:00-11:00 예약 상세'));

    const tooltip = screen.getByRole('tooltip');
    expect(tooltip).toBeInTheDocument();
    expect(tooltip).toHaveTextContent('10:00 ~ 11:00');
    expect(tooltip).toHaveTextContent('3명');
    expect(tooltip).toHaveTextContent('TV');
  });

  test('tooltip을 다시 클릭하면 닫힌다', async () => {
    const user = userEvent.setup();
    renderTimeline();

    await screen.findByText('회의실 A');
    const bar = screen.getByLabelText('회의실 A 10:00-11:00 예약 상세');

    await user.click(bar);
    expect(screen.getByRole('tooltip')).toBeInTheDocument();

    await user.click(bar);
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  test('다른 예약 바를 클릭하면 이전 tooltip이 닫히고 새 tooltip이 열린다', async () => {
    const user = userEvent.setup();
    renderTimeline();

    await screen.findByText('회의실 A');
    await user.click(screen.getByLabelText('회의실 A 10:00-11:00 예약 상세'));
    expect(screen.getByRole('tooltip')).toHaveTextContent('10:00 ~ 11:00');

    await user.click(screen.getByLabelText('회의실 A 14:00-15:00 예약 상세'));
    expect(screen.getByRole('tooltip')).toHaveTextContent('14:00 ~ 15:00');
  });

  test('장비가 없는 예약은 장비 정보를 표시하지 않는다', async () => {
    const user = userEvent.setup();
    renderTimeline();

    await screen.findByText('회의실 A');
    await user.click(screen.getByLabelText('회의실 A 14:00-15:00 예약 상세'));

    const tooltip = screen.getByRole('tooltip');
    expect(tooltip).toHaveTextContent('2명');
    expect(tooltip).not.toHaveTextContent('TV');
  });
});
