import styled from '@emotion/styled';
import { RefreshButton } from 'components/Button';
import { WeeklyCountdown } from 'components/Timer';
import { rem } from 'polished';
import React from 'react';

const Text = styled.p`
  color: #5b5b5b;
  font-weight: bold;
  font-size: ${rem(16)};
  line-height: 122.2%;
  margin-left: 8px;
`;

const Countdown = styled.span`
  display: inline;
  margin-left: 5px;
  font-weight: normal;
  color: #5b5b5b;
  font-size: ${rem(10)};

  span {
    color: #0e74ff;
    font-size: ${rem(10)};
    margin-left: 2px;
  }
`;

type Props = {
  handleRefresh: () => void;
};
export const Refresh: React.FC<Props> = (props) => {
  return (
    <>
      <Text>
        이번 주 랭킹
        <Countdown>
          | 초기화까지
          <span>
            <WeeklyCountdown />
          </span>
        </Countdown>
      </Text>
      <RefreshButton handleRefresh={props.handleRefresh} />
    </>
  );
};
