import { queryOptions } from '@tanstack/react-query';
import { roomService } from './room.service';

export const roomQueries = {
  all: () => ['rooms'] as const,
  list: () =>
    queryOptions({
      queryKey: [...roomQueries.all(), 'list'],
      queryFn: roomService.getRooms,
    }),
};
