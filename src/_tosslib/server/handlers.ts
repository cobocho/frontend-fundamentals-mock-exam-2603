import { http, HttpResponse } from 'msw';
import { v4 as uuidv4 } from 'uuid';
import { rooms, reservations as initialReservations, myReservations as initialMyReservations } from './data/rooms';
import { Reservation } from './types';

let reservations = [...initialReservations];
let myReservations = [...initialMyReservations];

export function resetData() {
  reservations = [...initialReservations];
  myReservations = [...initialMyReservations];
}

export function handlers() {
  resetData();

  return [
    http.get('/api/rooms', () => {
      return HttpResponse.json(rooms);
    }),

    http.get('/api/reservations', ({ request }) => {
      const url = new URL(request.url);
      const date = url.searchParams.get('date');
      if (!date) {
        return HttpResponse.json({ message: 'date parameter is required' }, { status: 400 });
      }
      const filtered = reservations.filter(r => r.date === date);
      return HttpResponse.json(filtered);
    }),

    http.post('/api/reservations', async ({ request }) => {
      const body = (await request.json()) as any;
      const { roomId, date, start, end, attendees, equipment } = body?.data ?? body ?? {};

      const room = rooms.find(r => r.id === roomId);
      if (!room) {
        return HttpResponse.json(
          { ok: false, code: 'NOT_FOUND', message: '회의실을 찾을 수 없습니다.' },
          { status: 404 }
        );
      }

      if (!start || !end || start >= end) {
        return HttpResponse.json(
          { ok: false, code: 'INVALID', message: '유효하지 않은 시간입니다.' },
          { status: 400 }
        );
      }

      const hasConflict = reservations.some(
        r => r.roomId === roomId && r.date === date && r.start < end && r.end > start
      );
      if (hasConflict) {
        return HttpResponse.json(
          { ok: false, code: 'CONFLICT', message: '해당 시간에 이미 예약이 있습니다.' },
          { status: 409 }
        );
      }

      const newReservation: Reservation = {
        id: uuidv4(),
        roomId,
        date,
        start,
        end,
        attendees,
        equipment: equipment || [],
      };

      reservations.push(newReservation);
      myReservations.push(newReservation);

      return HttpResponse.json({ ok: true, reservation: newReservation });
    }),

    http.get('/api/my-reservations', () => {
      return HttpResponse.json(myReservations);
    }),

    http.delete('/api/reservations/:id', ({ params }) => {
      const { id } = params;
      const index = reservations.findIndex(r => r.id === id);
      if (index === -1) {
        return HttpResponse.json({ ok: false }, { status: 404 });
      }
      reservations.splice(index, 1);
      myReservations = myReservations.filter(r => r.id !== id);
      return HttpResponse.json({ ok: true });
    }),
  ];
}
