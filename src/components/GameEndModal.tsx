/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { useNavigator } from '@karrotframe/navigator';
import IconClose from 'assets/IconClose';
import { emphasizedTextStyle, largeTextStyle } from 'styles/textStyle';
import IndividualLeaderboard from './IndividualLeaderboard';
import { sampleUserData } from 'sampleUserData';
import Button from './Button';

interface CloseButtonProps {
  handleClose: () => void;
}
const CloseButton = ({ handleClose }: CloseButtonProps) => {
  return (
    // eslint-disable-next-line jsx-a11y/anchor-is-valid
    <a
      onClick={handleClose}
      style={{ display: 'flex', justifyContent: 'flex-end' }}
    >
      <IconClose />
    </a>
  );
};

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
  // top: 25px;
  // inset: 10% 8% 10%;
  padding: 45px 15px 20px;
  border-radius: 21px;
`;

const largeText = css`
  margin: 15px 0;
`;
const horizontalLine = css`
  display: block;
  height: 0;
  width: 100%;
  border: 0.1px solid #e7e7e7;
  // padding: 0;
`;

const totalKarrotText = css`
  font-style: normal;
  font-weight: normal;
  font-size: 14px;
  line-height: 161.7%;
  /* identical to box height, or 23px */

  color: #a9a9a9;

  margin: 15px 0 23px;
`;
interface GameEndModalProps {
  handleCloseModal: () => void;
  score: number;
}
const GameEndModal = ({ handleCloseModal, score }: GameEndModalProps) => {
  const { push } = useNavigator();

  const handleViewLeaderboard = () => {
    push('/leaderboard');
  };

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        backgroundColor: 'rgba(10, 10, 10, .5)',
        backdropFilter: 'blur(3px)',
      }}
    >
      <div css={modalStyle}>
        <CloseButton handleClose={handleCloseModal} />
        <Karrot />
        <h1
          css={[largeTextStyle, largeText]}
          style={{ textAlign: 'center', flex: '0 1 auto' }}
        >
          <span css={emphasizedTextStyle}>{score}개</span>의 당근을
          <br />
          수확했어요!
        </h1>
        {/* <div style={{ flex: '1' }}></div> */}
        <hr css={horizontalLine} />
        <p css={totalKarrotText}>총 당근 234,128개</p>
        <div
          style={{
            width: `100%`,
            display: `flex`,

            flex: '0 1 40px',
            justifyContent: `space-evenly`,
            gap: '10px',
          }}
        >
          <Button
            size={`medium`}
            color={`secondary`}
            text={`이어하기`}
            onClick={handleCloseModal}
          />
          <Button
            size={`medium`}
            color={`primary`}
            text={`랭킹보기`}
            onClick={handleViewLeaderboard}
          />
        </div>
      </div>
    </div>
  );
};

export default GameEndModal;
