import { useCurrentScreen, useNavigator } from '@karrotframe/navigator';
import styled from '@emotion/styled';
import React, { useState, useEffect, useCallback } from 'react';
import ReactModal from 'react-modal';
import { PostComment } from './PostComment';
import gameOverSvgUrl from 'assets/svg/game2048/gameover.svg';
import { Button } from 'components/Button';
import { useMinigameApi } from 'services/api/minigameApi';
import { useMyGame2048Data } from 'pages/Game2048/hooks';
import { useMini, useUserData } from 'hooks';
import { rem } from 'polished';
import { useAnalytics } from 'services/analytics';
import { AnimatePresence, motion } from 'framer-motion';
import { commafy } from 'utils';

type Props = {
  currentScore: number;
  myBestScore: number;
};
export const GameOver: React.FC<Props> = (props) => {
  const { isTop } = useCurrentScreen();
  const { replace } = useNavigator();
  const analytics = useAnalytics();
  const minigameApi = useMinigameApi();
  const { isInWebEnvironment, shareApp } = useMini();
  const { nickname } = useUserData();
  const { rank, gameType, updateMyScore } = useMyGame2048Data();
  const [shouldModalOpen, setShouldModalOpen] = useState<boolean>(false);

  const goToLeaderboardPage = () => {
    replace(`/game-2048/leaderboard`);
  };

  const handleShare = () => {
    analytics.logEvent('click_share_button', {
      game_type: '2048_puzzle',
      location: 'game_over_modal',
    });
    const url = 'https://daangn.onelink.me/HhUa/37719e67';
    const text = `${nickname}님은 2048 퍼즐에서 전국 ${rank}등!`;
    shareApp(url, text);
  };

  const getMyData = useCallback(async () => {
    try {
      const {
        data: { data },
      } = await minigameApi.gameUserApi.getMyRankInfoUsingGET(gameType);

      return data;
    } catch (error) {
      console.error(error);
    }
  }, [gameType, minigameApi.gameUserApi]);

  const retrieveMyData = async () => {
    const response = await getMyData();
    if (response !== undefined) {
      updateMyScore(response.score, response.rank);
    }
  };

  useEffect(() => {
    if (isTop) {
      analytics.logEvent('view_game_over_modal', {
        game_type: '2048_puzzle',
      });
      retrieveMyData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [analytics, isTop]);

  // button to view leaderbaord (open commment modal if condition is met)
  const handleViewLeaderboard = async () => {
    if (isInWebEnvironment) {
      goToLeaderboardPage();
      return;
    }
    analytics.logEvent('click_view_leaderboard_button', {
      game_type: '2048_puzzle',
    });
    const response = await getMyData();

    console.log(response);
    if (response !== undefined) {
      response.rank > 0 && response.rank <= 10
        ? setShouldModalOpen(true)
        : goToLeaderboardPage();
    }
  };

  // animation handler
  const [showScore, setShowScore] = useState(false);
  const [showRank, setShowRank] = useState(false);
  useEffect(() => {
    const timerId1 = setTimeout(() => {
      setShowScore(true);
    }, 300);
    const timerId2 = setTimeout(() => {
      setShowRank(true);
    }, 500);

    return () => {
      clearTimeout(timerId1);
      clearTimeout(timerId2);
    };
  });
  return (
    <>
      <div
        style={{
          flex: 1,
          display: `flex`,
          flexFlow: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          gap: `16px`,
          marginBottom: `20%`,
        }}
      >
        <img
          src={gameOverSvgUrl}
          alt="gameOverSvgUrl"
          style={{
            marginBottom: `50px`,
          }}
        />

        <AnimatePresence>
          {showScore && (
            <Final
              key="final-score"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
            >
              <p className="text">최종 스코어</p>
              <p className="number">{commafy(props.currentScore)}</p>
            </Final>
          )}
          {showRank && (
            <Final
              key="final-rank"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
            >
              <p className="text">최종 랭킹</p>
              <p className="number">{rank}</p>
            </Final>
          )}
        </AnimatePresence>
      </div>
      {rank !== 0 && rank <= 10 && (
        <TopUserDirection>
          <p>Top10에게 혜택이 있어요!</p>
        </TopUserDirection>
      )}

      <ActionItems>
        <Button
          size={`large`}
          fontSize={rem(16)}
          color={`secondary1`}
          onClick={handleViewLeaderboard}
        >
          랭킹보기
        </Button>
        <Button
          size={`large`}
          fontSize={rem(16)}
          color={`primary`}
          onClick={handleShare}
        >
          자랑하기
        </Button>
      </ActionItems>
      <ReactModal
        // isOpen={shouldOpen.current}
        isOpen={shouldModalOpen}
        shouldCloseOnOverlayClick={false}
        contentLabel="Post Comment"
        style={{
          overlay: {
            background: 'rgba(40, 40, 40, 0.8)',
            zIndex: 100,
          },
          content: {
            height: `fit-content`,
            width: `80%`,
            top: '50%',
            left: '50%',
            right: 'auto',
            bottom: 'auto',
            marginRight: '-50%',
            transform: 'translate(-50%, -50%)',
            borderRadius: `21px`,
            padding: `24px 18px`,
            display: `flex`,
            flexFlow: `column`,
            justifyContent: 'center',
            alignItems: 'center',
          },
        }}
      >
        <PostComment setShouldModalOpen={setShouldModalOpen} />
      </ReactModal>
    </>
  );
};

const Final = styled(motion.div)`
  width: 100%;
  padding: 10px 15px 15px;
  text-align: center;
  font-style: normal;
  background: #ffffff;
  border-radius: 21px;
  color: #0e74ff;

  p.text {
    font-weight: normal;
    font-size: 14px;
    line-height: 161.7%;
    margin-bottom: 7px;
  }

  p.number {
    font-weight: 700;
    font-family: 'Montserrat', sans-serif;
    font-size: ${rem(30)};
    line-height: 103.7%;
  }
`;

const ActionItems = styled.div`
  display: flex;
  flex-flow: row;
  gap: 12px;
  justify-content: center;

  width: 100%;
`;

const TopUserDirection = styled.div`
  position: relative;
  margin-bottom: 14px;
  align-self: flex-start;
  background: #e3efff;
  border-radius: 5px;

  font-family: Cafe24SsurroundAir;
  font-style: normal;
  font-size: ${rem(10)};
  line-height: 161.7%;

  color: #ffffff;

  width: fit-content;
  padding: 5px 10px;

  &:after {
    z-index: 1000;
    content: '';
    position: absolute;
    bottom: 0;
    left: 50%;
    width: 0;
    height: 0;
    border-style: solid;
    border-color: transparent;
    border-width: 14px 8px;
    border-radius: 10px;
    border-top-color: #e3efff;
    border-bottom: 0;

    margin-left: -15px;
    margin-bottom: -8px;
  }

  p {
    font-family: Cafe24SsurroundAir;
    font-style: normal;
    font-weight: normal;
    font-size: ${rem(10)};
    line-height: 161.7%;
    /* or 16px */

    color: #0e74ff;
  }
`;
