// import { Button } from './components/Button';
import { Game } from './components/Game';

// import './App.less';

export const App = () => {
  // const [date, setDate] = useState<Date>(new Date());

  // const handleRestart = () => {
  //   setDate(new Date());
  // };

  return (
    <div className="App">
      <div className="header">
        <div>
          <h1>Play 2048</h1>
        </div>
        {/* <div>
          <Button onClick={handleRestart}>Restart</Button>
        </div> */}
      </div>
      <Game />
    </div>
  );
};
