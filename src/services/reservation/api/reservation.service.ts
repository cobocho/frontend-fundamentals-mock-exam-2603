import { httpInstance, type BaseService, type HttpInstance } from 'services/common';

import type {
  DeleteReservationResponse,
  GetMyReservationsResponse,
  GetReservationsRequest,
  GetReservationsResponse,
  PostReservationRequest,
  PostReservationResponse,
} from './reservation.types';

export class ReservationService implements BaseService {
  constructor(public httpInstance: HttpInstance) {}

  getReservations(params: GetReservationsRequest): Promise<GetReservationsResponse> {
    return this.httpInstance.get<GetReservationsResponse>(`api/reservations?date=${params.date}`);
  }

  postReservation(body: PostReservationRequest): Promise<PostReservationResponse> {
    return this.httpInstance.post<PostReservationResponse>('api/reservations', { json: body });
  }

  getMyReservations(): Promise<GetMyReservationsResponse> {
    return this.httpInstance.get<GetMyReservationsResponse>('api/my-reservations');
  }

  deleteReservation(id: string): Promise<DeleteReservationResponse> {
    return this.httpInstance.delete<DeleteReservationResponse>(`api/reservations/${id}`);
  }
}
