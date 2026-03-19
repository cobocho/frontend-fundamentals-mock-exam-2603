import { httpInstance } from 'services/common';
import type { BaseService, HttpInstance, HttpRequestOptions } from 'services/common';
import { type GetRoomsResponse } from './rooms.types';

export class RoomService implements BaseService {
  constructor(private readonly httpInstance: HttpInstance) {}

  getRooms = (options?: HttpRequestOptions): Promise<GetRoomsResponse> => {
    return this.httpInstance.get<GetRoomsResponse>('api/rooms', options);
  };
}

export const roomService = new RoomService(httpInstance);
