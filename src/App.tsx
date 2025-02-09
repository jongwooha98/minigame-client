import React, { useCallback, useEffect, useState } from 'react';
import '@karrotframe/navigator/index.css';
import { Navigator, Screen } from '@karrotframe/navigator';
import { Home } from 'pages/Home';
import { Game2048Home } from 'pages/Game2048/Home';
import { Game2048Game } from 'pages/Game2048/Game';
import { Game2048Leaderboard } from 'pages/Game2048/Leaderboard';
import { KarrotClickerHome } from 'pages/KarrotClicker/Home';
import { KarrotClickerGame } from 'pages/KarrotClicker/Game';
import { KarrotClickerLeaderboard } from 'pages/KarrotClicker/Leaderboard';
import { Survey } from 'pages/Survey';
// import { LoadingScreen } from 'components/LoadingScreen';

import {
  createFirebaseAnalytics,
  loadFromEnv as loadFirebaseAnalyticsConfig,
} from 'services/analytics/firebase';
import { AnalyticsContext, emptyAnalytics } from 'services/analytics';
import {
  KarrotMarketMiniContext,
  emptyKarrotMarketMini,
} from 'services/karrotMarketMini';
import {
  createKarrotMarketMini,
  loadFromEnv as loadKarrotMarketMiniConfig,
} from 'services/karrotMarket/mini';

import { useAccessToken, useSignAccessToken, useUserData } from 'hooks';
import { useMinigameApi } from 'services/api/minigameApi';

import { v4 as uuidv4 } from 'uuid';
import { useUser } from 'redux/user';

const App: React.FC = () => {
  // const dispatch = useDispatch();
  const minigameApi = useMinigameApi();
  const { setRegionInfo, setTownInfo, setIsInstalled } = useUserData();
  const { accessToken } = useAccessToken();
  const { signAccessToken, removeCookie } = useSignAccessToken();
  const [analytics, setAnalytics] = useState(emptyAnalytics);
  const [karrotMarketMini, setKarrotMarketMini] = useState(
    emptyKarrotMarketMini
  );

  const { saveUserInfo } = useUser();

  // Firebase Analytics가 설정되어 있으면 인스턴스를 초기화하고 교체합니다.
  useEffect(() => {
    try {
      // check analytics
      const config = loadFirebaseAnalyticsConfig();
      const analytics = createFirebaseAnalytics(config);
      setAnalytics(analytics);
    } catch (error) {
      console.error(error);
    }
  }, []);
  // Mini...
  useEffect(() => {
    try {
      // check karrot-mini
      const karrotMarketMiniConfig = loadKarrotMarketMiniConfig();
      const karrotMarketMini = createKarrotMarketMini(karrotMarketMiniConfig);
      setKarrotMarketMini(karrotMarketMini);
    } catch (error) {
      console.error(error);
      // no-op
    }
  }, []);

  const getQueryParams = () => {
    const searchParams = new URLSearchParams(window.location.search);
    const preload: string | null = searchParams.get('preload');
    const code: string | null = searchParams.get('code');
    const regionId: string | null = searchParams.get('region_id');
    const installed: string | null = searchParams.get('installed');
    const referer: string | null = searchParams.get('referer');
    return [preload, code, regionId, installed, referer];
  };

  const getDistrictInfo = useCallback(
    async (regionId: string) => {
      try {
        const {
          data: { data },
        } = await minigameApi.regionApi.getTownInfoUsingGET(regionId);
        if (data) {
          setTownInfo(data.townId, data.name1, data.name2, data.name3);
        }
      } catch (error) {
        console.error(error);
      }
    },

    [minigameApi.regionApi, setTownInfo]
  );

  const isSubscribed = (installed: string | null) => {
    return installed === 'true' ? true : false;
  };

  const fetchData = useCallback(
    async (uuid: string, code: string, regionId: string) => {
      await signAccessToken(uuid, code, regionId);
      // await updateUserInfo();
    },
    [signAccessToken]
  );

  const retrieveUUID = () => {
    if (localStorage.getItem('uuid') !== null) {
      console.log('localstorage uuid', localStorage.getItem('uuid'));
      return;
    } else {
      const uuid = uuidv4();
      localStorage.setItem('uuid', uuid);
    }
  };

  useEffect(() => {
    retrieveUUID();
    if (accessToken) {
      removeCookie('accessToken');
    }
    const [preload, code, regionId, installed, referer] = getQueryParams();
    // if (code)... returning user handler
    // else... new user handler

    analytics.logEvent('launch_app');

    setRegionInfo(regionId as string);
    getDistrictInfo(regionId as string);
    setIsInstalled(isSubscribed(installed));
    console.log(preload, code, regionId, installed, referer);

    saveUserInfo({
      uuid: localStorage.getItem('uuid'),
      regionId: regionId as string,
      isSubscribed: isSubscribed(installed),
      referer: referer?.toUpperCase() as
        | 'FEED'
        | 'NEAR_BY'
        | 'SHARE_GAME_2048'
        | 'SHARE_GAME_KARROT'
        | 'SHARE_PLATFORM'
        | 'SHARE_COMMUNITY'
        | 'LOGIN'
        | 'UNKNOWN',
    });
    fetchData(
      localStorage.getItem('uuid') as string,
      code as string,
      regionId as string
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AnalyticsContext.Provider value={analytics}>
      <KarrotMarketMiniContext.Provider value={karrotMarketMini}>
        <Navigator
          theme="Cupertino"
          onClose={() => {
            karrotMarketMini.close();
          }}
        >
          <Screen path="/" component={Home} />
          {/* Game 2048 */}
          <Screen path="/game-2048" component={Game2048Home} />
          <Screen path="/game-2048/game" component={Game2048Game} />
          <Screen
            path="/game-2048/leaderboard"
            component={Game2048Leaderboard}
          />
          {/* Karrot Clicker */}
          <Screen path="/karrot-clicker" component={KarrotClickerHome} />
          <Screen path="/karrot-clicker/game" component={KarrotClickerGame} />
          <Screen
            path="/karrot-clicker/leaderboard"
            component={KarrotClickerLeaderboard}
          />
          <Screen path="/survey" component={Survey} />
        </Navigator>
      </KarrotMarketMiniContext.Provider>
    </AnalyticsContext.Provider>
  );
};

export default App;
