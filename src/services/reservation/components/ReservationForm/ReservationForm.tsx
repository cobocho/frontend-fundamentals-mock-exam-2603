import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Equipment, postReservationRequestScheme } from '../../api/reservation.types';
import { z } from 'zod';
import { Form, FormField, FormItem, FormLabel } from 'components/Form';
import { css } from '@emotion/react';
import { Select, Spacing } from '_tosslib/components';
import { colors } from '_tosslib/constants/colors';
import { useEffect, useEffectEvent, useMemo } from 'react';
import { getTimeOptions, getToday, isBeforeThan } from './ReservationForm.lib';
import { EQUIPMENT_OPTIONS } from 'services/room/constants';
import {
  DEFAULT_RESERVATION_START_TIME,
  DEFAULT_RESERVATION_END_TIME,
  DEFAULT_RESERVATION_TIME_STEP,
  MAX_ATTENDEES,
  MIN_ATTENDEES,
} from '../../constants/config';

export const reservationFormSchema = z
  .object({
    roomId: postReservationRequestScheme.shape.roomId,
    date: postReservationRequestScheme.shape.date,
    start: postReservationRequestScheme.shape.start,
    end: postReservationRequestScheme.shape.end,
    attendees: postReservationRequestScheme.shape.attendees.min(MIN_ATTENDEES).max(MAX_ATTENDEES),
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
    }
  });

export type ReservationFormSchema = z.infer<typeof reservationFormSchema>;

export interface ReservationFormProps {
  floors: number[];
  startTime?: string;
  endTime?: string;
  timeStep?: number;
  initialValues?: Partial<ReservationFormSchema>;
  onChange: ({ isValid, values }: { isValid: boolean; values: z.infer<typeof reservationFormSchema> }) => void;
}

export const ReservationForm = ({
  floors,
  startTime = DEFAULT_RESERVATION_START_TIME,
  endTime = DEFAULT_RESERVATION_END_TIME,
  timeStep = DEFAULT_RESERVATION_TIME_STEP,
  initialValues,
  onChange,
}: ReservationFormProps) => {
  const sortedFloors = useMemo(() => [...floors].sort((a, b) => a - b), [floors]);

  const form = useForm({
    resolver: zodResolver(reservationFormSchema),
    mode: 'onChange',
    defaultValues: {
      roomId: '',
      date: getToday(),
      start: '',
      end: '',
      attendees: 1,
      equipment: [],
      ...initialValues,
    },
  });

  const onChangeEvent = useEffectEvent(onChange);

  useEffect(
    function handleChange() {
      const subscription = form.watch(() =>
        onChangeEvent({ isValid: form.formState.isValid, values: form.getValues() })
      );
      return () => subscription.unsubscribe();
    },
    [floors, startTime, endTime, timeStep]
  );

  const toggleEquipment = (equipment: Equipment) => {
    const prevEquipment = form.getValues('equipment');
    const hasEquipment = prevEquipment.includes(equipment);
    if (hasEquipment) {
      form.setValue(
        'equipment',
        prevEquipment.filter(e => e !== equipment)
      );
      return;
    }
    form.setValue('equipment', [...prevEquipment, equipment]);
  };

  const timeOptions = useMemo(() => getTimeOptions(startTime, endTime, timeStep), [startTime, endTime, timeStep]);

  return (
    <Form {...form}>
      <form>
        <div
          css={css`
            display: flex;
            flex-direction: column;
            gap: 6px;
          `}
        >
          <FormField
            name="date"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>날짜</FormLabel>
                <input
                  type="date"
                  value={field.value}
                  onChange={e => field.onChange(e.target.value)}
                  aria-label="날짜"
                  css={inputStyle}
                />
              </FormItem>
            )}
          />
        </div>
        <Spacing size={14} />
        <div css={rowStyle}>
          <FormField
            name="start"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>시작 시간</FormLabel>
                <Select
                  value={field.value}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                    field.onChange(e.target.value === '' ? null : e.target.value)
                  }
                  aria-label="시작 시간"
                >
                  <option value="">선택</option>
                  {timeOptions.map(({ label }) => (
                    <option key={label} value={label}>
                      {label}
                    </option>
                  ))}
                </Select>
              </FormItem>
            )}
          />
          <FormField
            name="end"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>종료 시간</FormLabel>
                <Select
                  value={field.value}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                    field.onChange(e.target.value === '' ? null : e.target.value);
                    form.trigger();
                  }}
                  aria-label="종료 시간"
                >
                  <option value="">선택</option>
                  {timeOptions.map(({ label }) => (
                    <option key={label} value={label}>
                      {label}
                    </option>
                  ))}
                </Select>
              </FormItem>
            )}
          />
        </div>
        <Spacing size={14} />
        <div css={rowStyle}>
          <FormField
            name="attendees"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>참석 인원</FormLabel>
                <input
                  type="number"
                  value={field.value}
                  onChange={e => field.onChange(e.target.value)}
                  aria-label="참석 인원"
                  css={inputStyle}
                />
              </FormItem>
            )}
          />
          <FormField
            name="preferredFloor"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>선호 층</FormLabel>
                <Select
                  value={field.value ?? ''}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => field.onChange(e.target.value)}
                  aria-label="선호 층"
                >
                  <option value="all">전체</option>
                  {sortedFloors.map(f => (
                    <option key={f} value={f}>
                      {f}층
                    </option>
                  ))}
                </Select>
              </FormItem>
            )}
          />
        </div>
        <Spacing size={14} />
        <div css={rowStyle}>
          <FormField
            name="equipment"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>필요 장비</FormLabel>
                <div css={equipmentListStyle}>
                  {EQUIPMENT_OPTIONS.map(({ label, value }) => (
                    <button
                      key={value}
                      type="button"
                      css={equipmentToggleStyle(field.value.includes(value))}
                      onClick={() => toggleEquipment(value)}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </FormItem>
            )}
          />
        </div>
      </form>
      {form.formState.errors.root?.form && <p css={errorStyle}>{form.formState.errors.root.form.message}</p>}
    </Form>
  );
};

const inputStyle = css`
  box-sizing: border-box;
  font-size: 16px;
  font-weight: 500;
  line-height: 1.5;
  height: 48px;
  background-color: ${colors.grey50};
  border-radius: 12px;
  color: ${colors.grey800};
  width: 100%;
  border: 1px solid ${colors.grey200};
  padding: 0 16px;
  outline: none;
  transition: border-color 0.15s;
  &:focus {
    border-color: ${colors.blue500};
  }
`;

const rowStyle = css`
  display: flex;
  gap: 12px;
`;

const equipmentToggleStyle = (selected: boolean) => css`
  padding: 8px 16px;
  border-radius: 20px;
  border: 1px solid ${selected ? colors.blue500 : colors.grey200};
  background: ${selected ? colors.blue50 : colors.grey50};
  color: ${selected ? colors.blue600 : colors.grey700};
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
  &:hover {
    border-color: ${selected ? colors.blue500 : colors.grey400};
  }
`;

const equipmentListStyle = css`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

const errorStyle = css`
  color: ${colors.red500};
  font-size: 14px;
`;
