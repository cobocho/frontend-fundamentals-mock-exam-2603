import { queryOptions } from '@tanstack/react-query';
import { reservationService } from './reservation.service';
import type { GetReservationsRequest } from './reservation.types';

export const reservationQueries = {
  all: () => ['reservations'] as const,
  lists: () => [...reservationQueries.all(), 'list'] as const,
  list: (params: GetReservationsRequest) =>
    queryOptions({
      queryKey: [...reservationQueries.lists(), params],
      queryFn: () => reservationService.getReservations(params),
      staleTime: 1000 * 60,
      gcTime: 1000 * 60,
    }),
  myList: () =>
    queryOptions({
      queryKey: [...reservationQueries.all(), 'myList'],
      queryFn: () => reservationService.getMyReservations(),
      staleTime: 1000 * 60 * 30,
      gcTime: 1000 * 60 * 30,
    }),
};
