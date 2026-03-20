import { css } from '@emotion/react';
import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Top, Spacing, Border, Button, Text, ListRow } from '_tosslib/components';
import { colors } from '_tosslib/constants/colors';
import { roomQueries } from 'services/room';
import { reservationQueries, reservationService } from 'services/reservation';
import { LocationMessage, useLocationMessage } from 'hooks/useLocationMessage';
import { formatDate } from 'utils/date';

const EQUIPMENT_LABELS: Record<string, string> = {
  tv: 'TV',
  whiteboard: '화이트보드',
  video: '화상장비',
  speaker: '스피커',
};

const TIME_SLOTS: string[] = [];
for (let h = 9; h <= 20; h++) {
  TIME_SLOTS.push(`${String(h).padStart(2, '0')}:00`);
  if (h < 20) {
    TIME_SLOTS.push(`${String(h).padStart(2, '0')}:30`);
  }
}

const HOUR_LABELS = TIME_SLOTS.filter(t => t.endsWith(':00'));
const TIMELINE_START = 9;
const TIMELINE_END = 20;
const TOTAL_MINUTES = (TIMELINE_END - TIMELINE_START) * 60;

function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return (h - TIMELINE_START) * 60 + m;
}

export function ReservationStatusPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [date, setDate] = useState(formatDate(new Date()));

  const { locationMessage, createLocationMessage } = useLocationMessage();

  const [message, setMessage] = useState<LocationMessage | null>(locationMessage);

  const { data: rooms = [] } = useQuery(roomQueries.list());
  const { data: reservations = [] } = useQuery(reservationQueries.list({ date }));
  const { data: myReservationList = [] } = useQuery(reservationQueries.myList());

  const cancelMutation = useMutation({
    mutationFn: reservationService.deleteReservation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reservationQueries.all() });
    },
  });

  const handleCancel = async (id: string) => {
    try {
      await cancelMutation.mutateAsync(id);
      setMessage({ text: '예약이 취소되었습니다.', type: 'success' });
    } catch {
      setMessage({ text: '취소에 실패했습니다.', type: 'error' });
    }
  };

  const [activeReservation, setActiveReservation] = useState<string | null>(null);

  const getRoomName = (roomId: string) => rooms.find(r => r.id === roomId)?.name ?? roomId;

  return (
    <div css={containerStyle}>
      <Top.Top03 css={topStyle}>회의실 예약</Top.Top03>

      <Spacing size={24} />

      {/* 날짜 선택 */}
      <div css={sectionStyle}>
        <Text typography="t5" fontWeight="bold" color={colors.grey900}>
          날짜 선택
        </Text>
        <Spacing size={16} />
        <div css={dateFieldWrapperStyle}>
          <input
            type="date"
            value={date}
            min={formatDate(new Date())}
            onChange={e => setDate(e.target.value)}
            aria-label="날짜"
            css={dateInputStyle}
          />
        </div>
      </div>

      <Spacing size={24} />
      <Border size={8} />
      <Spacing size={24} />

      {/* 예약 현황 타임라인 */}
      <div css={sectionStyle}>
        <Text typography="t5" fontWeight="bold" color={colors.grey900}>
          예약 현황
        </Text>
        <Spacing size={16} />

        <div css={timelineContainerStyle}>
          {/* 시간 헤더 */}
          <div css={timelineHeaderStyle}>
            <div css={roomLabelSpacerStyle} />
            <div css={timelineBarContainerStyle}>
              {HOUR_LABELS.map(t => {
                const left = (timeToMinutes(t) / TOTAL_MINUTES) * 100;
                return (
                  <Text
                    key={t}
                    typography="t7"
                    fontWeight="regular"
                    color={colors.grey400}
                    css={hourLabelStyle(left)}
                  >
                    {t.slice(0, 2)}
                  </Text>
                );
              })}
            </div>
          </div>

          {/* 회의실별 타임라인 */}
          {rooms.map((room, index) => {
            const roomReservations = reservations.filter(r => r.roomId === room.id);
            return (
              <div key={room.id} css={timelineRowStyle(index)}>
                <div css={roomLabelSpacerStyle}>
                  <Text
                    typography="t7"
                    fontWeight="medium"
                    color={colors.grey700}
                    ellipsisAfterLines={1}
                    css={roomNameStyle}
                  >
                    {room.name}
                  </Text>
                </div>
                <div css={timelineTrackStyle}>
                  {roomReservations.map(res => {
                    const left = (timeToMinutes(res.start) / TOTAL_MINUTES) * 100;
                    const width = ((timeToMinutes(res.end) - timeToMinutes(res.start)) / TOTAL_MINUTES) * 100;
                    const isActive = activeReservation === res.id;
                    return (
                      <div key={res.id} css={reservationSlotStyle(left, width)}>
                        <div
                          role="button"
                          aria-label={`${room.name} ${res.start}-${res.end} 예약 상세`}
                          onClick={() => setActiveReservation(isActive ? null : res.id)}
                          css={reservationBarStyle(isActive)}
                        />
                        {isActive && (
                          <div role="tooltip" css={tooltipStyle}>
                            <div>
                              {res.start} ~ {res.end}
                            </div>
                            <div>{res.attendees}명</div>
                            {res.equipment.length > 0 && (
                              <div>{res.equipment.map((e: string) => EQUIPMENT_LABELS[e]).join(', ')}</div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <Spacing size={24} />
      <Border size={8} />
      <Spacing size={24} />

      {/* 메시지 배너 */}
      {message && (
        <div css={sectionStyle}>
          <div css={messageBannerStyle(message.type)}>
            <Text
              typography="t7"
              fontWeight="medium"
              color={message.type === 'success' ? colors.blue600 : colors.red500}
            >
              {message.text}
            </Text>
          </div>
          <Spacing size={12} />
        </div>
      )}

      {/* 내 예약 목록 */}
      <div css={sectionStyle}>
        <div css={sectionHeaderStyle}>
          <Text typography="t5" fontWeight="bold" color={colors.grey900}>
            내 예약
          </Text>
          {myReservationList.length > 0 && (
            <Text typography="t7" fontWeight="medium" color={colors.grey500}>
              {myReservationList.length}건
            </Text>
          )}
        </div>
        <Spacing size={16} />

        {myReservationList.length === 0 ? (
          <div css={emptyStateStyle}>
            <Text typography="t6" color={colors.grey500}>
              예약 내역이 없습니다.
            </Text>
          </div>
        ) : (
          <div css={listStyle}>
            {myReservationList.map(res => (
              <div key={res.id} css={reservationCardStyle}>
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
                        if (window.confirm('정말 취소하시겠습니까?')) {
                          handleCancel(res.id);
                        }
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

      <Spacing size={24} />
      <Border size={8} />
      <Spacing size={24} />

      {/* 예약하기 버튼 */}
      <div css={sectionStyle}>
        <Button display="full" onClick={() => navigate('/booking')}>
          예약하기
        </Button>
      </div>
      <Spacing size={24} />
    </div>
  );
}

const containerStyle = css`
  background: ${colors.white};
  padding-bottom: 40px;
`;

const topStyle = css`
  padding-left: 24px;
  padding-right: 24px;
`;

const sectionStyle = css`
  padding: 0 24px;
`;

const dateFieldWrapperStyle = css`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const dateInputStyle = css`
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

const timelineContainerStyle = css`
  background: ${colors.grey50};
  border-radius: 14px;
  padding: 16px;
`;

const timelineHeaderStyle = css`
  display: flex;
  align-items: flex-end;
  margin-bottom: 8px;
`;

const roomLabelSpacerStyle = css`
  width: 80px;
  flex-shrink: 0;
  padding-right: 8px;
`;

const timelineBarContainerStyle = css`
  flex: 1;
  position: relative;
  height: 18px;
`;

const hourLabelStyle = (left: number) => css`
  position: absolute;
  left: ${left}%;
  transform: translateX(-50%);
  font-size: 10px;
  letter-spacing: -0.3px;
`;

const timelineRowStyle = (index: number) => css`
  display: flex;
  align-items: center;
  height: 32px;
  ${index > 0 ? 'margin-top: 4px;' : ''}
`;

const roomNameStyle = css`
  font-size: 12px;
`;

const timelineTrackStyle = css`
  flex: 1;
  height: 24px;
  background: ${colors.white};
  border-radius: 6px;
  position: relative;
  overflow: visible;
`;

const reservationSlotStyle = (left: number, width: number) => css`
  position: absolute;
  left: ${left}%;
  width: ${width}%;
  height: 100%;
`;

const reservationBarStyle = (isActive: boolean) => css`
  width: 100%;
  height: 100%;
  background: ${colors.blue400};
  border-radius: 4px;
  opacity: ${isActive ? 1 : 0.75};
  cursor: pointer;
  transition: opacity 0.15s;
  &:hover {
    opacity: 1;
  }
`;

const tooltipStyle = css`
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  margin-top: 6px;
  background: ${colors.grey900};
  color: ${colors.white};
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 12px;
  white-space: nowrap;
  z-index: 10;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
  line-height: 1.6;
`;

const messageBannerStyle = (type: 'success' | 'error') => css`
  padding: 10px 14px;
  border-radius: 10px;
  background: ${type === 'success' ? colors.blue50 : colors.red50};
  display: flex;
  align-items: center;
  gap: 8px;
`;

const sectionHeaderStyle = css`
  display: flex;
  align-items: baseline;
  gap: 6px;
`;

const emptyStateStyle = css`
  padding: 40px 0;
  text-align: center;
  background: ${colors.grey50};
  border-radius: 14px;
`;

const listStyle = css`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const reservationCardStyle = css`
  padding: 14px 16px;
  border-radius: 14px;
  background: ${colors.grey50};
  border: 1px solid ${colors.grey200};
`;
