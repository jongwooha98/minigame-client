/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { ScreenHelmet } from '@karrotframe/navigator';
import { AppEjectionButton } from 'components/AppEjectionButton';
import Button from 'components/Button';
import GameEndModal from 'components/GameEndModal';
import { useDispatch, useSelector } from 'react-redux';
import { Route, useHistory } from 'react-router';
import { increase } from 'reducers/counterReducer';
import ClickerGame from '../components/ClickerGame';
import { RootState } from '../reducers/rootReducer';

const gameEndDivStyle = css`
  display: flex;
  position: absolute;
  bottom: 0;
  padding: 30px;
`;
const Game = () => {
  const [topUserText, setTopUserText] = useState<string>('');
  const handleTopUserText = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTopUserText(e.target.value);
  };
  console.log(topUserText);
  const history = useHistory();

  const handleGameEnd = () => {
    history.push('/game/modal');
  };
  const handleCloseModal = () => {
    history.goBack();
  };
  // Get state of redux store using useSelector
  const { score } = useSelector((state: RootState) => ({
    score: state.counterReducer.score,
  }));

  // useDispatch to dispatch actions
  const dispatch = useDispatch();
  const onIncrease = () => dispatch(increase());

  let currentRank = 4;

  return (
    <div>
      <ScreenHelmet />
      <div style={{ display: `flex`, justifyContent: `center` }}>
        <ClickerGame score={score} onIncrease={onIncrease} />
        <div css={gameEndDivStyle}>
          <Button
            size={`medium`}
            color={`primary`}
            text={`게임끝`}
            onClick={handleGameEnd}
          />
        </div>
      </div>

      <Route path="/game/modal">
        <GameEndModal
          handleCloseModal={handleCloseModal}
          currentRank={currentRank}
          score={score}
          topUserText={topUserText}
          handleTopUserText={handleTopUserText}
        />
      </Route>
    </div>
  );
};

export default Game;
