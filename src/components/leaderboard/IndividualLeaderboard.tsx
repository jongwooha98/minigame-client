/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from 'reducers/rootReducer';
import DefaultUserRow from './DefaultUserRow';
import TopUserRow from './TopUserRow';
const axios = require('axios').default;
const baseUrl = process.env.REACT_APP_BASE_URL;
// const accessToken = window.localStorage.getItem('ACCESS_TOKEN');
const divStyle = css`
  padding-top: 10px;
  padding-bottom: 10px;
  max-height: inherit;
  height: inherit'
  box-sizing: border-box;
`;
const leaderboardWrapperStyle = css`
  display: flex;
  flex-flow: column;
  align-items: center;
`;

const infoText = css`
  margin: 17px 0 17px;

  font-style: normal;
  font-weight: normal;
  font-size: 16px;
  line-height: 161.7%;
  /* or 26px */

  text-align: center;

  color: #7c7c7c;
`;

const IndividualLeaderboard = () => {
  const [townRankData, setTownRankData] = useState<any[]>([]);
  const { townId, townName } = useSelector((state: RootState) => ({
    townId: state.userDataReducer.townId,
    townName: state.userDataReducer.townName,
  }));

  async function getTownLeaderboard(townId: string) {
    const { data } = await axios.get(`${baseUrl}/towns/${townId}/user-rank`);
    const responseData = await data.data;
    const indexedTownRankData = await responseData.map(
      (item: any, index: number) => ({
        rank: index + 1,
        ...item,
      })
    );
    setTownRankData(indexedTownRankData);
  }

  useEffect(() => {
    getTownLeaderboard(townId)
      .then((response) => {
        console.log('IndividualLeaderboard, getTownLeaderboard', response);
      })
      .catch(console.error);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div css={divStyle}>
      <div css={leaderboardWrapperStyle}>
        {townRankData.slice(0, 10).map((user) => {
          return (
            <TopUserRow
              key={user.userId}
              rank={user.rank}
              nickname={user.nickname}
              comment={user.comment}
              score={user.score}
            />
          );
        })}
        <p css={infoText}>
          🎉 {townName} TOP 10 🎉 이 되어서
          <br />
          이웃들에게 한 마디를 남겨보세요!
        </p>
        {townRankData.slice(10).map((user) => {
          return (
            <DefaultUserRow
              key={user.userId}
              rank={user.rank}
              nickname={user.nickname}
              score={user.score}
            />
          );
        })}
      </div>
    </div>
  );
};

export default IndividualLeaderboard;
