import { css } from '@emotion/react';
import { useSuspenseQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button, ListRow, Spacing, Text } from '_tosslib/components';
import { colors } from '_tosslib/constants/colors';
import { reservationQueries } from '../../api';
import { reservationService } from '../../api';
import { EQUIPMENT_LABELS, roomQueries } from 'services/room';

interface MyReservationListProps {
  onCancelSuccess?: () => void;
  onCancelError?: () => void;
}

export const MyReservationList = ({ onCancelSuccess, onCancelError }: MyReservationListProps) => {
  const queryClient = useQueryClient();

  const { data: rooms } = useSuspenseQuery(roomQueries.list());
  const { data: myReservationList } = useSuspenseQuery(reservationQueries.myList());

  const cancelMutation = useMutation({
    mutationFn: reservationService.deleteReservation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reservationQueries.all() });
      onCancelSuccess?.();
    },
    onError: onCancelError,
  });

  const handleCancel = (id: string) => {
    if (window.confirm('정말 취소하시겠습니까?')) {
      cancelMutation.mutate(id);
    }
  };

  const getRoomName = (roomId: string) => rooms.find(r => r.id === roomId)?.name ?? roomId;

  const isEmpty = myReservationList.length === 0;

  return (
    <div>
      <div css={headerStyle}>
        <Text typography="t5" fontWeight="bold" color={colors.grey900}>
          내 예약
        </Text>
        {!isEmpty && (
          <Text typography="t7" fontWeight="medium" color={colors.grey500}>
            {myReservationList.length}건
          </Text>
        )}
      </div>
      <Spacing size={16} />

      {isEmpty ? (
        blankState
      ) : (
        <div css={listStyle}>
          {myReservationList.map(res => (
            <div key={res.id} css={cardStyle}>
              <ListRow
                contents={
                  <ListRow.Text2Rows
                    top={getRoomName(res.roomId)}
                    topProps={{ typography: 't6', fontWeight: 'bold', color: colors.grey900 }}
                    bottom={`${res.date} ${res.start}~${res.end} · ${res.attendees}명 · ${
                      res.equipment.map(e => EQUIPMENT_LABELS[e]).join(', ') || '장비 없음'
                    }`}
                    bottomProps={{ typography: 't7', color: colors.grey600 }}
                  />
                }
                right={
                  <Button
                    type="danger"
                    style="weak"
                    size="small"
                    onClick={e => {
                      e.stopPropagation();
                      handleCancel(res.id);
                    }}
                  >
                    취소
                  </Button>
                }
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const blankState = (
  <div
    css={css`
      padding: 40px 0;
      text-align: center;
      background: ${colors.grey50};
      border-radius: 14px;
    `}
  >
    <Text typography="t6" color={colors.grey500}>
      예약 내역이 없습니다.
    </Text>
  </div>
);

const headerStyle = css`
  display: flex;
  align-items: baseline;
  gap: 6px;
`;

const listStyle = css`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const cardStyle = css`
  padding: 14px 16px;
  border-radius: 14px;
  background: ${colors.grey50};
  border: 1px solid ${colors.grey200};
`;
