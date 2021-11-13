import styled from '@emotion/styled';
import { useCurrentScreen, useNavigator } from '@karrotframe/navigator';
import { Button } from 'components/Button';
import { useMini } from 'hooks';
import { rem } from 'polished';
import { useEffect, useState } from 'react';
import ReactModal from 'react-modal';
import { useSwipeable } from 'react-swipeable';
import { useMinigameApi } from 'services/api/minigameApi';
import { useThrottledCallback } from 'use-debounce/lib';
import { useMyGame2048Data } from '../hooks';
import { Board } from './Game/Board';
import { useGame } from './Game/hooks';
import { animationDuration } from './Game/styles';
import { PostComment } from './Modal';
import { CurrentScore, MyBestScore, TownieBestScore } from './Score';

export const Game: React.FC = () => {
  const { isTop } = useCurrentScreen();
  const { replace } = useNavigator();
  const minigameApi = useMinigameApi();
  const { isInWebEnvironment } = useMini();
  const {
    score: myBestScore,
    highestScore,
    gameType,
    updateMyScore,
    updateMyComment,
  } = useMyGame2048Data();
  const {
    score: currentScore,
    tileList,
    moveRight,
    moveLeft,
    moveUp,
    moveDown,
    resetGame,
  } = useGame();
  const [isUserNew, setIsUserNew] = useState<boolean>(false);
  const [isUserInTopTen, setIsUserInTopTen] = useState<boolean>(false);
  // const [townieBestScore, setTownieBestScore] = useState<number>(0);
  // game controller
  // =================================================================
  // mobile(touch) friendly
  const handlers = useSwipeable({
    onSwiped: (eventData) => console.log('User Swiped!', eventData),
    onSwipedLeft: useThrottledCallback(() => moveLeft(), animationDuration, {
      leading: true,
      trailing: false,
    }),
    onSwipedRight: useThrottledCallback(() => moveRight(), animationDuration, {
      leading: true,
      trailing: false,
    }),
    onSwipedUp: useThrottledCallback(() => moveUp(), animationDuration, {
      leading: true,
      trailing: false,
    }),
    onSwipedDown: useThrottledCallback(() => moveDown(), animationDuration, {
      leading: true,
      trailing: false,
    }),
    preventDefaultTouchmoveEvent: true,
  });
  // desktop(keyboard) friendly
  const handleKeyDown = useThrottledCallback(
    (e: KeyboardEvent) => {
      // disables page scrolling with keyboard arrows
      e.preventDefault();

      switch (e.code) {
        case 'ArrowRight':
          moveRight();
          break;
        case 'ArrowLeft':
          moveLeft();
          break;
        case 'ArrowUp':
          moveUp();
          break;
        case 'ArrowDown':
          moveDown();
          break;
      }
    },
    animationDuration,
    { leading: true, trailing: false }
  );
  // =================================================================
  useEffect(() => {
    console.log(highestScore);
    if (isTop) {
      if (highestScore === 0) {
        setIsUserNew(true);
        console.log('guide is on for new user');
      }
    }
  }, [highestScore, isTop]);

  // page navigation
  // =================================================================
  const goToLeaderboardPage = () => {
    replace(`/game-2048/leaderboard`);
  };
  const handlePlayAgain = () => {
    resetGame();
    console.log('handle play again');
  };

  // const getTownieBestScoreEver = async () => {
  //   const {
  //     data: { data },
  //   } = await minigameApi.gameTownApi.getLeaderBoardByTownUsingGET(
  //     gameType,
  //     undefined,
  //     1
  //   );
  //   if (data) {
  //     setTownieBestScore(data[0].score);
  //   }
  // };

  //
  const updateMyBestScore = async () => {
    await minigameApi.gamePlayApi.updateScoreUsingPATCH(gameType, {
      score: currentScore,
    });
  };
  const updateMyData = async () => {
    const {
      data: { data },
    } = await minigameApi.gameUserApi.getMyRankInfoUsingGET(gameType);
    if (data) {
      if (data.score && data.rank) {
        updateMyScore(data.score, data.rank);
      }
      if (data.comment) {
        updateMyComment(data.comment);
      }
      return data;
    }
  };

  const handleGameOver = async () => {
    // resetGame();
    if (isInWebEnvironment) {
      console.log(`bypass in web environment: go from game to leaderboard`);
      goToLeaderboardPage();
    }
    // only patch score to db if current score is higher than the best score
    console.log(myBestScore, currentScore);
    if (currentScore > myBestScore) {
      updateMyBestScore().then((response) => {
        console.log(response);
        updateMyData().then((response) => {
          if (response?.rank! <= 10 && response?.rank! > 0) {
            // open post-comment modal if user is in top ten
            setIsUserInTopTen(true);
          }
        });
        goToLeaderboardPage();
      });
    } else {
      updateMyData().then((response) => {
        console.log(response);

        if (response?.rank! <= 10 && response?.rank! > 0) {
          // open post-comment modal if user is in top ten
          setIsUserInTopTen(true);
        }
      });
      goToLeaderboardPage();
    }
  };

  // useEffect(() => {
  //   setIsUserInTopTen(true);
  // }, []);
  return (
    <Page className="game-page">
      <HighScoreContainer>
        <MyBestScore myBestScore={myBestScore} />
        <TownieBestScore />
      </HighScoreContainer>
      <CurrentScore score={currentScore} />
      <Board
        tileList={tileList}
        handlers={handlers}
        handleKeyDown={handleKeyDown}
        isUserNew={isUserNew}
        setIsUserNew={setIsUserNew}
      />
      <ActionItems>
        <Button
          size={`tiny`}
          fontSize={rem(14)}
          color={`secondary2`}
          onClick={handleGameOver}
        >
          그만하기
        </Button>
        <Button
          size={`tiny`}
          fontSize={rem(14)}
          color={`secondary2`}
          onClick={handlePlayAgain}
        >
          다시하기
        </Button>
      </ActionItems>

      <ReactModal
        isOpen={isUserInTopTen}
        shouldCloseOnOverlayClick={false}
        contentLabel="Game Over"
        style={{
          overlay: {
            background: 'rgba(40, 40, 40, 0.8)',
            zIndex: 100,
          },
          content: {
            height: `fit-content`,
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
        <PostComment setIsUserInTopTen={setIsUserInTopTen} />
      </ReactModal>
    </Page>
  );
};

const Page = styled.div`
  height: 100%;
  background-color: #f3f8ff;
`;

const HighScoreContainer = styled.div`
  display: flex;
  flex-flow: row;
  justify-content: center;
  gap: 0.625rem;
  width: 100%;
  padding-top: 3.438rem;
`;

const ActionItems = styled.div`
  display: flex;
  flex-flow: row;
  justify-content: space-between;
  margin: 0 1.25rem;
`;
