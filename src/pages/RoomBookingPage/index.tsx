import { css } from '@emotion/react';
import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { reservationQueries, reservationService } from 'services/reservation';
import { Top, Spacing, Text, Border, Button } from '_tosslib/components';
import { colors } from '_tosslib/constants/colors';
import { useNavigate } from 'react-router-dom';
import { ReservationSearchForm, useReservationSearchFilters } from 'services/reservation';
import { Room, roomQueries } from 'services/room';
import { getFloorsByRooms } from 'services/room/libs';
import { AvailableRoomList } from './components/AvailableRoomList';
import { Suspense, useState } from 'react';
import { HttpError } from 'services/common';
import { useLocationMessage } from 'hooks/useLocationMessage';

export function RoomBookingPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { createLocationMessage } = useLocationMessage();

  const { filters, isValid, setFilter } = useReservationSearchFilters();

  const createMutation = useMutation({
    mutationFn: reservationService.postReservation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reservationQueries.all() });
      setSelectedRoom(null);
      setBookingError(null);
      navigate('/', { state: createLocationMessage('success', '예약이 완료되었습니다!') });
    },
    onError: error => {
      if (error instanceof HttpError) {
        setBookingError(error.message);
      }
    },
  });

  if (isValid) {
    queryClient.prefetchQuery(reservationQueries.list({ date: filters.date }));
  }

  const { data: rooms } = useSuspenseQuery(roomQueries.list());

  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [bookingError, setBookingError] = useState<string | null>(null);

  return (
    <div css={containerStyle}>
      <div css={headerStyle}>
        <button type="button" onClick={() => navigate('/')} aria-label="뒤로가기" css={goBackButtonStyle}>
          ← 예약 현황으로
        </button>
      </div>
      <Top.Top03 css={topStyle}>예약하기</Top.Top03>

      {bookingError && (
        <div css={contentStyle}>
          <Spacing size={12} />
          <div css={bookingErrorBoxStyle}>
            <Text typography="t7" fontWeight="medium" color={colors.red500}>
              {bookingError}
            </Text>
          </div>
        </div>
      )}

      <Spacing size={24} />
      <div css={contentStyle}>
        <Text typography="t5" fontWeight="bold" color={colors.grey900}>
          예약 조건
        </Text>
        <Spacing size={16} />
        <ReservationSearchForm
          floors={getFloorsByRooms(rooms)}
          onChange={({ values }) => {
            setFilter({
              ...values,
              start: values.start || null,
              end: values.end || null,
              preferredFloor: values.preferredFloor || null,
            });
            setBookingError(null);
            setSelectedRoom(null);
          }}
          initialValues={{
            date: filters.date,
            start: filters.start ?? undefined,
            end: filters.end ?? undefined,
            attendees: filters.attendees,
            equipment: filters.equipment,
            preferredFloor: filters.preferredFloor,
          }}
        />
      </div>
      <Spacing size={24} />
      <Border size={8} />
      <Spacing size={24} />
      <Suspense>
        {isValid && (
          <div css={contentStyle}>
            <AvailableRoomList
              rooms={rooms}
              filters={filters}
              defaultSelectedRoomId={selectedRoom?.id}
              onSelect={setSelectedRoom}
            />
            <Spacing size={16} />
            <Button
              display="full"
              onClick={() => {
                if (!selectedRoom) {
                  setBookingError('회의실을 선택해주세요.');
                  return;
                }

                createMutation.mutate({
                  roomId: selectedRoom!.id,
                  date: filters.date,
                  start: filters.start!,
                  end: filters.end!,
                  attendees: filters.attendees,
                  equipment: filters.equipment,
                });
              }}
              disabled={createMutation.isPending || !isValid}
            >
              {createMutation.isPending ? '예약 중...' : '확정'}
            </Button>
          </div>
        )}
      </Suspense>
    </div>
  );
}

const containerStyle = css`
  background: ${colors.white};
  padding-bottom: 40px;
`;

const headerStyle = css`
  padding: 12px 24px 0;
`;

const goBackButtonStyle = css`
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  font-size: 14px;
  color: ${colors.grey600};
  &:hover {
    color: ${colors.grey900};
  }
`;

const bookingErrorBoxStyle = css`
  padding: 10px 14px;
  border-radius: 10px;
  background: ${colors.red50};
  display: flex;
  align-items: center;
  gap: 8px;
`;

const contentStyle = css`
  padding: 0 24px;
`;

const topStyle = css`
  padding-left: 24px;
  padding-right: 24px;
`;
