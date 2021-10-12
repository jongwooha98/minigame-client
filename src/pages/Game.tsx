/** @jsxImportSource @emotion/react */
import { css, keyframes } from '@emotion/react';
import DefaultGameEndModal from 'components/modals/DefaultGameEndModal';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  // increase,
  // increaseKarrotCount,
  incrementClickCount,
} from 'reducers/counterReducer';
import { RootState } from '../reducers/rootReducer';
import background from 'assets/Seocho_background.png';
import IconBack from 'assets/IconBack';
import { Link } from 'react-router-dom';
import { ReactComponent as BigKarrot } from 'assets/Seocho_daangn.svg';
import Modal from 'react-modal';
import GameDirectionPopupModal from 'components/modals/GameDirectionPopupModal';
import { commafy } from 'components/functions/commafy';
import ClickAnimation from 'components/game/ClickAnimation';

const axios = require('axios').default;

// nav
const customNav = css`
  left: 0;
  width: 100%;
  top: 0;
  display: flex;
  flex-flow: row;
  justify-content: space-between;
  width: 100%;
  height: 44px;
  padding: 0 0.5rem;
`;
const customNavIcon1 = css`
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
const customNavIcon2 = css`
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  opacity: 1;
  transition: opacity 300ms;
  width: auto;
  height: 2.75rem;
  text-decoration: none;
  outline: none;
  z-index: 10;
`;
const gameEndButtonStyle = css`
  padding: 6px 13px;

  background: #ffffff;
  border-radius: 10px;
  border: none;
  font-style: normal;
  font-weight: bold;
  font-size: 14px;
  line-height: 161.7%;
  /* identical to box height, or 23px */

  color: #cc6023;
`;
// main div
const divStyle = css`
  background-image: url(${background});
  background-size: cover;
  height: calc(100% - 2.75rem);
  display: flex;
  flex-flow: column;
`;
const scoreWrapper = css`
  display: flex;
  flex-flow: column;
  align-items: center;
  justify-content: center;
`;
const clickCountStyle = css`
  margin-top: 10%;
  font-style: normal;
  font-weight: bold;
  font-size: 50px;

  color: #85370c;
`;
// const clickCountStyle = css`
//   font-style: normal;
//   font-weight: bold;
//   font-size: 18px;

//   color: #bc9c8a;
// `;
// game end modal
const modalStyle = css`
  position: absolute;
  left: 0;
  right: 0;
  margin-left: auto;
  margin-right: auto;
  top: 50%;
  transform: translateY(-50%);
  width: 80%;
  max-width: 400px;
  display: flex;
  flex-flow: column;
  align-items: center;
  background: #fff;

  padding: 45px 15px 20px;
  border-radius: 21px;
`;
// pop-up modal
const fadeout = keyframes`
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
`;
const popupModalStyle = css`
  position: absolute;
  left: 0;
  right: 0;
  margin-left: auto;
  margin-right: auto;
  top: 50%;
  transform: translateY(-50%);
  width: fit-content;
  max-width: 400px;
  display: flex;
  flex-flow: column;
  gap: 26px;
  align-items: center;
  background: rgba(80, 80, 80, 0.5);

  padding: 55px 20px 25px;
  border-radius: 21px;

  animation: ${fadeout} 3s;
`;
// big karrot animation
const fullScreenClickable = css`
  // height: 100%;
  position: absolute;
  height: calc(100% - 2.75rem);
  width: 100vw;
  overflow: hidden;
`;
const shakeRight = css`
  transform: rotate(10deg);
`;
const shakeLeft = css`
  transform: rotate(-10deg);
`;

Modal.setAppElement(document.createElement('div'));

interface GameEndButtonProps {
  handleGameEnd: () => void;
}
const GameEndButton = ({ handleGameEnd }: GameEndButtonProps) => {
  return (
    <button css={gameEndButtonStyle} onClick={handleGameEnd}>
      그만하기
    </button>
  );
};

const Game = () => {
  const [count, setCount] = useState(0);
  const [alreadyPatchedKarrot, setAlreadyPatchedKarrot] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [shouldPopup, setShouldPopup] = useState(false);
  const [shakeToggle, setShakeToggle] = useState(false);

  const { userScore } = useSelector((state: RootState) => ({
    userScore: state.userDataReducer.score,
  }));

  const { clickCount } = useSelector((state: RootState) => ({
    clickCount: state.counterReducer.clickCount,
    // karrotCount: state.counterReducer.karrotCount,
  }));
  const dispatch = useDispatch();
  const clickCountUp = async () => dispatch(incrementClickCount());
  // const countUpKarrot = async () => dispatch(increaseKarrotCount());

  const handleClick = async (e: { clientX: any; clientY: any }) => {
    await handleAddItem(e);
    await clickCountUp();
    // await countUp();
    setShakeToggle((prevState) => !prevState);
    setCount(count + 1);
    // console.log('count');
    // if (count >= 9) {
    // await countUpKarrot();
    // setKarrotCountToPatch((prev) => prev + 1);
    // setCount(0);
    // }
  };

  const handleGameEnd = () => {
    let karrotToPatch = clickCount - alreadyPatchedKarrot;
    setAlreadyPatchedKarrot(clickCount);
    console.log(clickCount, alreadyPatchedKarrot, karrotToPatch);

    axios.patch(
      `${process.env.REACT_APP_BASE_URL}/user-rank`,
      {
        // score: karrotCountToPatch,
        score: karrotToPatch,
      },
      {
        headers: {
          Authorization: window.localStorage.getItem('ACCESS_TOKEN'),
          'Content-Type': 'application/json',
        },
      }
    );
    setIsModalOpen(true);
  };

  function closeModal() {
    setIsModalOpen(false);
    // setAlreadyPatchedKarrot(0);
  }

  useEffect(() => {
    if (userScore === 0) {
      setShouldPopup(true);
      const timer = setTimeout(() => {
        setShouldPopup(false);
      }, 3000);
      return () => {
        clearTimeout(timer);
      };
    }
  }, [userScore]);

  interface testArrProps {
    posX: number;
    posY: number;
  }
  const [testArr, setTestArr] = useState<testArrProps[]>([]);
  const handleAddItem = async (e: { clientX: any; clientY: any }) => {
    setTestArr((testArr) => [
      ...testArr,
      { posX: e.clientX - 25, posY: e.clientY - 50 },
    ]);
    setTimeout(() => {
      setTestArr((testArr) => {
        const newArr = testArr.slice(1);
        return newArr;
      });
    }, 1000);
  };
  return (
    <>
      <div css={customNav}>
        <div css={customNavIcon1}>
          <Link to="/">
            <IconBack />
          </Link>
        </div>
        <div css={customNavIcon2}>
          <GameEndButton handleGameEnd={handleGameEnd} />
        </div>
      </div>

      <div
        className="wrapper"
        css={fullScreenClickable}
        onClick={handleAddItem}
      >
        {testArr.map((item, index) => (
          <ClickAnimation posX={item.posX} posY={item.posY} key={index} />
        ))}
      </div>

      <div css={divStyle}>
        <div css={scoreWrapper}>
          <h1 css={clickCountStyle}>{commafy(clickCount)}</h1>
          {/* <h2 css={clickCountStyle}>{}</h2> */}
        </div>
        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            paddingBottom: '20%',
          }}
        >
          <BigKarrot
            onClick={handleClick}
            css={shakeToggle ? shakeLeft : shakeRight}
            style={{
              height: '25rem',
              width: 'auto',
            }}
          />
        </div>
      </div>
      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        shouldCloseOnOverlayClick={false}
        contentLabel="Default Game End Modal"
        css={modalStyle}
        style={{
          overlay: {
            background: 'rgba(40, 40, 40, 0.8)',
            zIndex: 100,
          },
        }}
      >
        <DefaultGameEndModal closeModal={closeModal} />
      </Modal>
      <Modal
        isOpen={shouldPopup}
        onRequestClose={() => setShouldPopup(false)}
        shouldCloseOnOverlayClick={true}
        contentLabel="Game Direction Popup Modal"
        css={popupModalStyle}
        style={{
          overlay: {
            background: `none`,
          },
        }}
        // onClick={handleClick}
      >
        <GameDirectionPopupModal />
      </Modal>
    </>
  );
};

export default Game;
