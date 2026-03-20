import { css } from '@emotion/react';
import { Top, Spacing, Border, Button, Text, Select, ListRow } from '_tosslib/components';
import { colors } from '_tosslib/constants/colors';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ReservationForm } from 'services/reservation';

export function RoomBookingPage() {
  const navigate = useNavigate();

  return (
    <div css={containerStyle}>
      <div css={headerStyle}>
        <button type="button" onClick={() => navigate('/')} aria-label="뒤로가기" css={goBackButtonStyle}>
          ← 예약 현황으로
        </button>
      </div>
      <Top.Top03 css={topStyle}>예약하기</Top.Top03>
      <Spacing size={24} />
      <div css={contentStyle}>
        <Text typography="t5" fontWeight="bold" color={colors.grey900}>
          예약 조건
        </Text>
        <Spacing size={16} />
        <ReservationForm
          floors={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]}
          startTime="09:00"
          endTime="18:00"
          timeStep={30}
          onChange={({ isValid, values }) => {
            console.log(isValid, values);
          }}
        />
        <Spacing size={16} />
      </div>
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

const contentStyle = css`
  padding: 0 24px;
`;

const topStyle = css`
  padding-left: 24px;
  padding-right: 24px;
`;
