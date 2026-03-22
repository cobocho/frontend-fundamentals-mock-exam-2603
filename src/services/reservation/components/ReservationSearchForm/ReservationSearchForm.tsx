import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { Equipment } from 'services/room';
import { z } from 'zod';
import { Form, FormField, FormItem, FormLabel } from 'components/Form';
import { css } from '@emotion/react';
import { Select, Spacing } from '_tosslib/components';
import { colors } from '_tosslib/constants/colors';
import { useEffect, useEffectEvent, useMemo } from 'react';
import { getTimeOptions, getToday } from './ReservationSearchForm.lib';
import { EQUIPMENT_OPTIONS } from 'services/room/constants';
import {
  DEFAULT_RESERVATION_START_TIME,
  DEFAULT_RESERVATION_END_TIME,
  DEFAULT_RESERVATION_TIME_STEP,
  MIN_ATTENDEES,
} from '../../constants/config';
import { reservationSearchScheme, type ReservationSearch } from '../../hooks/useReservationSearchFilters';
import { roomQueries } from 'services/room';
import { useSuspenseQuery } from '@tanstack/react-query';
import { getFloorsByRooms } from 'services/room/libs';

export interface ReservationSearchFormProps {
  availableTime?: {
    startTime: string;
    endTime: string;
    timeStep: number;
  };
  initialValues?: Partial<ReservationSearch>;
  onChange: ({ isValid, values }: { isValid: boolean; values: z.infer<typeof reservationSearchScheme> }) => void;
}

export const ReservationSearchForm = ({
  availableTime = {
    startTime: DEFAULT_RESERVATION_START_TIME,
    endTime: DEFAULT_RESERVATION_END_TIME,
    timeStep: DEFAULT_RESERVATION_TIME_STEP,
  },
  initialValues,
  onChange,
}: ReservationSearchFormProps) => {
  const { data: rooms } = useSuspenseQuery(roomQueries.list());

  const floors = useMemo(() => getFloorsByRooms(rooms), [rooms]);

  const form = useForm({
    resolver: zodResolver(reservationSearchScheme),
    mode: 'onChange',
    defaultValues: {
      date: getToday(),
      start: '',
      end: '',
      attendees: 1,
      equipment: [],
      ...initialValues,
    },
  });

  const { errors } = form.formState;

  const onChangeEvent = useEffectEvent(onChange);

  useEffect(function handleChange() {
    form.trigger();
    const subscription = form.watch(() => onChangeEvent({ isValid: form.formState.isValid, values: form.getValues() }));
    return () => subscription.unsubscribe();
  }, []);

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

  const changeTime = (name: 'start' | 'end', value: string) => {
    form.setValue(name, value);
    form.trigger();
  };

  const timeOptions = useMemo(
    () => getTimeOptions(availableTime.startTime, availableTime.endTime, availableTime.timeStep),
    [availableTime]
  );

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
                  value={field.value ?? ''}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => changeTime('start', e.target.value)}
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
                  value={field.value ?? ''}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => changeTime('end', e.target.value)}
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
                  onChange={e => field.onChange(e.target.valueAsNumber)}
                  aria-label="참석 인원"
                  min={reservationSearchScheme.shape.attendees.minValue || MIN_ATTENDEES}
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
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                    const v = e.target.value;
                    field.onChange(v === '' ? null : Number(v));
                  }}
                  aria-label="선호 층"
                >
                  <option value="">전체</option>
                  {floors.map(f => (
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
                      aria-label={label}
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
      {errors.root?.form && <p css={errorStyle}>{errors.root.form.message}</p>}
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
  max-width: 100%;
  border: 1px solid ${colors.grey200};
  padding: 0 16px;
  outline: none;
  -webkit-appearance: none;
  appearance: none;
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
