import { httpInstance } from 'services/common';
import type { BaseService, HttpInstance, HttpRequestOptions } from 'services/common';
import type {
  DeleteReservationResponse,
  GetMyReservationsResponse,
  GetReservationsRequest,
  GetReservationsResponse,
  PostReservationRequest,
  PostReservationResponse,
} from './reservation.types';

export class ReservationService implements BaseService {
  constructor(private readonly httpInstance: HttpInstance) {}

  getReservations = (params: GetReservationsRequest, options?: HttpRequestOptions): Promise<GetReservationsResponse> => {
    return this.httpInstance.get<GetReservationsResponse>('api/reservations', {
      ...options,
      searchParams: { date: params.date },
    });
  };

  postReservation = (body: PostReservationRequest): Promise<PostReservationResponse> => {
    return this.httpInstance.post<PostReservationResponse>('api/reservations', { json: body });
  };

  getMyReservations = (options?: HttpRequestOptions): Promise<GetMyReservationsResponse> => {
    return this.httpInstance.get<GetMyReservationsResponse>('api/my-reservations', options);
  };

  deleteReservation = (id: string): Promise<DeleteReservationResponse> => {
    return this.httpInstance.delete<DeleteReservationResponse>(`api/reservations/${id}`);
  };
}

export const reservationService = new ReservationService(httpInstance);
