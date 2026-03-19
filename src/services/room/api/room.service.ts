import { httpInstance, type BaseService, type HttpInstance } from 'services/common';
import { type GetRoomsResponse } from './rooms.types';

export class RoomService implements BaseService {
  constructor(public httpInstance: HttpInstance) {}

  getRooms(): Promise<GetRoomsResponse> {
    return this.httpInstance.get<GetRoomsResponse>('api/rooms');
  }
}
