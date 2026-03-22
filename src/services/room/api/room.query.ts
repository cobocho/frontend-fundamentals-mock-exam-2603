import { queryOptions } from '@tanstack/react-query';
import { roomService } from './room.service';

export const roomQueries = {
  all: () => ['rooms'] as const,
  list: () =>
    queryOptions({
      queryKey: [...roomQueries.all(), 'list'],
      queryFn: roomService.getRooms,
      staleTime: 1000 * 60,
      gcTime: 1000 * 60,
    }),
};
