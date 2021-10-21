/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import DefaultUserRow from 'components/leaderboard/DefaultUserRow';
import TopUserRow from 'components/leaderboard/TopUserRow';
import {
  emphasizedTextStyle,
  largeTextStyle,
  mediumTextStyle,
} from 'styles/textStyle';
import Button from 'components/buttons/Button';
import IndividualLeaderboard from 'components/leaderboard/IndividualLeaderboard';
import { useCallback, useEffect, useState } from 'react';
import { AppEjectionButton } from 'components/buttons/AppEjectionButton';

import { commafy } from 'functions/numberFunctions';
import { useAnalytics } from 'services/analytics';

import { useDispatch, useSelector } from 'react-redux';
import { RootState } from 'reducers/rootReducer';
import { useHistory } from 'react-router-dom';
import { updateUserScore } from 'reducers/userDataReducer';
import { KarrotRaiseApi, useKarrotRaiseApi } from 'services/karrotRaiseApi';

// nav
const customNav = css`
  left: 0;
  width: 100%;
  // height: 100%;
  top: 0;
  display: flex;
  width: 100%;
  height: 44px;
  padding: 0 0.5rem;
`;
const customNavIcon = css`
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  opacity: 1;
  transition: opacity 300ms;
  width: 2.25rem;
  height: 2.75rem;
  text-decoration: none;
  outline: none;
  z-index: 10;
`;
// main div`
const divStyle = css`
  display: flex;
  flex-flow: column;
  height: calc(100% - 2.75rem);
`;
const headingWrapper = css`
  padding: 20px 26px 20px; ;
`;
const leaderboardWrapper = css`
  flex: 1;

  overflow: auto;
  padding: 0 26px;
`;
const actionItemWrapper = css`
  display: flex;
  justify-content: center;
  padding: 16px 24px 34px;
  border-top: 1px solid #ebebeb;
  box-sizing: border-box;
  box-shadow: 0px 0px 15px rgba(0, 0, 0, 0.1);

  text-decoration: none;
`;
const currentuserDataInfoRow = css`
  margin: 20px 0 10px;
`;

interface UserScoreNullProps {
  nickname: string;
}
const UserScoreNull: React.FC<UserScoreNullProps> = (props) => {
  return (
    <>
      <h1 css={largeTextStyle}>
        <span css={emphasizedTextStyle}>{props.nickname}</span>님, 아직 기록이
        없어요
      </h1>
      <h2 css={mediumTextStyle}>
        당근을 수확하고 이웃들에게 한 마디 남겨봐요!
      </h2>
    </>
  );
};
interface UserScoreExistsProps {
  nickname: string;
  rank: number;
  score: number;
  comment: string;
  townName: string;
}
const UserScoreExists: React.FC<UserScoreExistsProps> = (props) => {
  return (
    <>
      <h1 css={largeTextStyle}>
        <span css={emphasizedTextStyle}>{props.nickname}</span>님은
        <br />
        {props.townName}에서
        <span css={emphasizedTextStyle}> {commafy(props.rank)}위</span>
        에요!
      </h1>
      <div css={currentuserDataInfoRow}>
        {props.rank <= 10 ? (
          <TopUserRow
            rank={props.rank}
            nickname={props.nickname}
            score={props.score}
            comment={props.comment}
          />
        ) : (
          <DefaultUserRow
            rank={props.rank}
            nickname={props.nickname}
            score={props.score}
          />
        )}
      </div>
    </>
  );
};
const initialState = {
  nickname: '이웃',
  score: 0,
  rank: 999999,
  comment: '',
};

const ReturningUserHome = () => {
  const [userData, setUserData] = useState(initialState);
  const history = useHistory();
  const dispatch = useDispatch();
  const analytics = useAnalytics();
  const karrotRaiseApi = useKarrotRaiseApi();
  const { townName } = useSelector((state: RootState) => ({
    townName: state.userDataReducer.townName,
  }));

  const handleGameStart = () => {
    analytics.logEvent('click_game_start_button');
    history.push('/game');
  };

  const getUserData = useCallback(
    async (karrotRaiseApi: KarrotRaiseApi) => {
      try {
        const response = await karrotRaiseApi.getUserInfo();
        if (response.isFetched === true && response.data) {
          console.log('returningUserHome, getUserData', response.data);
          const { nickname, score, rank, comment } = response.data.data;
          setUserData({
            nickname: nickname,
            score: score,
            rank: rank,
            comment: comment,
          });
          dispatch(updateUserScore(score));
        }
      } catch (error) {
        console.error(error);
      }
    },
    [dispatch]
  );
  useEffect(() => {
    getUserData(karrotRaiseApi);
    analytics.logEvent('view_returning_user_home_page');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <div css={customNav}>
        <div css={customNavIcon}>
          <AppEjectionButton />
        </div>
      </div>
      <div css={divStyle}>
        <div css={headingWrapper}>
          {userData.rank !== null ? (
            <UserScoreExists
              nickname={userData.nickname}
              rank={userData.rank}
              score={userData.score}
              comment={userData.comment}
              townName={townName}
            />
          ) : (
            <UserScoreNull nickname={userData.nickname} />
          )}
        </div>

        <div css={leaderboardWrapper}>
          <IndividualLeaderboard />
        </div>
        <div
          // to="/game"
          css={actionItemWrapper}
          onClick={handleGameStart}
        >
          <Button
            size={`large`}
            color={`primary`}
            text={`게임 시작`}
            onClick={() => {}}
          />
        </div>
      </div>
    </>
  );
};

export default ReturningUserHome;
