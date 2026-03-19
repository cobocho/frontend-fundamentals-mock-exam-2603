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
    }),
  myList: () =>
    queryOptions({
      queryKey: [...reservationQueries.all(), 'myList'],
      queryFn: () => reservationService.getMyReservations(),
    }),
};
