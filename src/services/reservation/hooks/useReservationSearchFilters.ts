import { parseAsArrayOf, parseAsInteger, parseAsString, useQueryStates } from 'nuqs';
import { z } from 'zod';
import { equipmentScheme, postReservationRequestScheme, type Equipment } from '../api/reservation.types';
import { isBeforeThan } from '../components/ReservationSearchForm/ReservationSearchForm.lib';
import { MIN_ATTENDEES, MAX_ATTENDEES } from '../constants/config';
import { formatDate } from 'utils/date';

export const reservationSearchScheme = z
  .object({
    date: postReservationRequestScheme.shape.date,
    start: postReservationRequestScheme.shape.start.nullish(),
    end: postReservationRequestScheme.shape.end.nullish(),
    attendees: postReservationRequestScheme.shape.attendees
      .min(MIN_ATTENDEES, { message: '참석 인원은 1명 이상이어야 합니다.' })
      .max(MAX_ATTENDEES),
    equipment: postReservationRequestScheme.shape.equipment,
    preferredFloor: z.number().nullish(),
  })
  .superRefine((data, ctx) => {
    if (data.start && data.end && !isBeforeThan(data.start, data.end)) {
      ctx.addIssue({
        code: 'custom',
        path: ['root', 'form'],
        message: '종료 시간은 시작 시간보다 늦어야 합니다.',
      });
    } else if (data.attendees < MIN_ATTENDEES) {
      ctx.addIssue({
        code: 'custom',
        path: ['root', 'form'],
        message: '참석 인원은 1명 이상이어야 합니다.',
      });
    }
  });

export type ReservationSearchScheme = z.infer<typeof reservationSearchScheme>;

const queryStatesConfig = {
  date: parseAsString.withDefault(formatDate(new Date())),
  start: parseAsString,
  end: parseAsString,
  attendees: parseAsInteger.withDefault(1),
  equipment: parseAsArrayOf(parseAsString).withDefault([]),
  preferredFloor: parseAsInteger,
};

export function useReservationSearchFilters() {
  const [queryStates, setFilter] = useQueryStates(queryStatesConfig);

  if (queryStates.attendees < MIN_ATTENDEES) {
    setFilter({ attendees: null });
  }

  const filters = {
    ...queryStates,
    equipment: queryStates.equipment.filter((e): e is Equipment => equipmentScheme.safeParse(e).success),
  };

  const parsed = reservationSearchScheme.safeParse(filters);

  return { isValid: parsed.success, errors: parsed.error, filters, setFilter };
}
