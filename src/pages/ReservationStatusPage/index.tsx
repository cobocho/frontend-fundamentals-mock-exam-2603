import { css } from '@emotion/react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSuspenseQuery } from '@tanstack/react-query';
import { Top, Spacing, Border, Button, Text } from '_tosslib/components';
import { colors } from '_tosslib/constants/colors';
import { roomQueries } from 'services/room';
import { RoomTimeline, MyReservationList } from 'services/reservation';
import { useLocationMessage } from 'hooks/useLocationMessage';
import { formatDate } from 'utils/date';
import { MessageBanner } from './components/MessageBanner';

export function ReservationStatusPage() {
  const navigate = useNavigate();
  const { message, setSuccessMessage, setErrorMessage } = useLocationMessage();

  const { data: rooms } = useSuspenseQuery(roomQueries.list());

  const [date, setDate] = useState(formatDate(new Date()));

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
        {date && <RoomTimeline rooms={rooms} date={date} />}
      </div>

      <Spacing size={24} />
      <Border size={8} />
      <Spacing size={24} />

      {/* 메시지 배너 */}
      {message && (
        <div css={sectionStyle}>
          <MessageBanner message={message} />
        </div>
      )}

      {/* 내 예약 목록 */}
      <div css={sectionStyle}>
        <MyReservationList
          onCancelSuccess={() => setSuccessMessage('예약이 취소되었습니다.')}
          onCancelError={() => setErrorMessage('취소에 실패했습니다.')}
        />
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
