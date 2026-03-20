import { css } from '@emotion/react';
import { Text, Spacing } from '_tosslib/components';
import { colors } from '_tosslib/constants/colors';
import type { LocationMessage } from 'hooks/useLocationMessage';

interface MessageBannerProps {
  message: LocationMessage;
}

export const MessageBanner = ({ message }: MessageBannerProps) => {
  return (
    <div>
      <div css={bannerStyle(message.type)}>
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
  );
};

const bannerStyle = (type: 'success' | 'error') => css`
  padding: 10px 14px;
  border-radius: 10px;
  background: ${type === 'success' ? colors.blue50 : colors.red50};
  display: flex;
  align-items: center;
  gap: 8px;
`;
