import { useNavigator } from '@karrotframe/navigator';
import styled from '@emotion/styled';
// import { useMini } from 'hooks';
import React, { useState } from 'react';
import ReactModal from 'react-modal';
import { PostComment } from './PostComment';
import gameOverSvgUrl from 'assets/svg/game2048/gameover.svg';
import { Button } from 'components/Button';
import { useMinigameApi } from 'services/api/minigameApi';
import { useMyGame2048Data } from 'pages/Game2048/hooks';
import { useMini } from 'hooks';
import { rem } from 'polished';
import xUrl from 'assets/svg/x.svg';
import { useAnalytics } from 'services/analytics';
type Props = {
  currentScore: number;
  myBestScore: number;
};
export const GameOver: React.FC<Props> = (props) => {
  const { replace } = useNavigator();
  const analytics = useAnalytics();
  const minigameApi = useMinigameApi();
  const { isInWebEnvironment, shareApp } = useMini();
  const { rank, gameType, updateMyScore } = useMyGame2048Data();
  const [shouldModalOpen, setShouldModalOpen] = useState<boolean>(false);

  const goToLeaderboardPage = () => {
    replace(`/game-2048/leaderboard`);
  };

  const handleViewLeaderboard = async () => {
    console.log('try to view leaderboard');
    if (isInWebEnvironment) {
      goToLeaderboardPage();
      return;
    }

    try {
      const {
        data: { data },
      } = await minigameApi.gameUserApi.getMyRankInfoUsingGET(gameType);

      if (data) {
        if (data.score && data.rank) {
          updateMyScore(data.score, data.rank);
          if (data.rank > 0 && data.rank <= 10) {
            setShouldModalOpen(true);
          } else {
            goToLeaderboardPage();
          }
        }
      }
    } catch (error) {
      console.error(error);
    }
  };
  const handleShare = () => {
    console.log('trigger share handler');
    const url = 'https://daangn.onelink.me/HhUa/3a219555';
    const text = `2048 퍼즐을 플레이 하고 이웃들에게 한 마디를 남겨보세요!`;

    shareApp(url, text);
    analytics.logEvent('click_share_button', {
      game_type: 'game-2048',
    });
  };

  return (
    <>
      <img
        src={xUrl}
        alt="close"
        onClick={handleViewLeaderboard}
        style={{
          position: 'absolute',
          top: 39,
          right: 27,
        }}
      />
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

        <Final>
          <p className="text">최종 스코어</p>
          <p className="number">{props.currentScore}</p>
        </Final>
        <Final>
          <p className="text">최종 랭킹</p>
          <p className="number">{rank}</p>
        </Final>
      </div>
      <Button
        size={`large`}
        fontSize={`16`}
        color={`primary`}
        onClick={handleShare}
      >
        자랑하기
      </Button>

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

const Final = styled.div`
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
    font-weight: bold;
    font-size: ${rem(30)};
    line-height: 103.7%;
  }
`;
