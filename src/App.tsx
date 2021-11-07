import React, { useEffect, useState } from 'react';
import '@karrotframe/navigator/index.css';
import { Navigator, Screen } from '@karrotframe/navigator';
import { Home } from 'pages/Home';
import { Game2048Home } from 'pages/Game2048/Home';
import { Game2048Game } from 'pages/Game2048/Game';
import { Game2048Leaderboard } from 'pages/Game2048/Leaderboard';
import { KarrotClickerHome } from 'pages/KarrotClicker/Home';
import { KarrotClickerGame } from 'pages/KarrotClicker/Game';
import { KarrotClickerLeaderboard } from 'pages/KarrotClicker/Leaderboard';
import {
  createFirebaseAnalytics,
  loadFromEnv as loadFirebaseAnalyticsConfig,
} from 'services/analytics/firebase';
import {
  emptyKarrotRaiseApi,
  KarrotRaiseApiContext,
} from 'services/karrotRaiseApi';
import {
  createKarrotRaiseApi,
  loadFromEnv as loadKarrotRaiseApiConfig,
} from 'services/api/karrotRaise';
import {
  emptyKarrotMarketMini,
  KarrotMarketMiniContext,
} from 'services/karrotMarketMini';
import {
  createKarrotMarketMini,
  loadFromEnv as loadKarrotMarketMiniConfig,
} from 'services/karrotMarket/mini';
import { AnalyticsContext, emptyAnalytics } from 'services/analytics';
import { NonServiceArea } from 'pages/NonServiceArea';

import { MinigameApiProvider } from 'services/api/minigameApi';
import { useUserData } from 'hooks';
import { useAccessToken } from 'hooks/useAccessToken';
const App: React.FC = () => {
  const { setRegionInfo } = useUserData();
  const { getAccessToken } = useAccessToken();
  const [analytics, setAnalytics] = useState(emptyAnalytics);
  const [karrotRaiseApi, setKarrotRaiseApi] = useState(emptyKarrotRaiseApi);
  const [karrotMarketMini, setKarrotMarketMini] = useState(
    emptyKarrotMarketMini
  );
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
  // KarrotRaiseApi...
  useEffect(() => {
    try {
      // check karrot-raise api
      const karrotRaiseApiConfig = loadKarrotRaiseApiConfig();
      const karrotRaiseApi = createKarrotRaiseApi(karrotRaiseApiConfig);
      setKarrotRaiseApi(karrotRaiseApi);
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
    const code: string | null = searchParams.get('code');
    const regionId: string | null = searchParams.get('region_id');
    return [code, regionId];
  };

  useEffect(() => {
    // if(cookies.accessToken !== undefined) {
    // }
    try {
      const [code, regionId] = getQueryParams();
      analytics.logEvent('launch_app');
      console.log(code, regionId);
      if (regionId) {
        setRegionInfo(regionId);
        if (code) {
          getAccessToken(code, regionId);
        }
      }
    } catch (error) {
      console.error(error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Navigator
      theme="Cupertino"
      onClose={() => {
        console.log('Close button is pressed');
        karrotMarketMini.close();
      }}
    >
      <MinigameApiProvider>
        <KarrotRaiseApiContext.Provider value={karrotRaiseApi}>
          <AnalyticsContext.Provider value={analytics}>
            <KarrotMarketMiniContext.Provider value={karrotMarketMini}>
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
              <Screen
                path="/karrot-clicker/game"
                component={KarrotClickerGame}
              />
              <Screen
                path="/karrot-clicker/leaderboard"
                component={KarrotClickerLeaderboard}
              />

              <Screen path="/non-service-area" component={NonServiceArea} />
            </KarrotMarketMiniContext.Provider>
          </AnalyticsContext.Provider>
        </KarrotRaiseApiContext.Provider>
      </MinigameApiProvider>
    </Navigator>
  );
};

export default App;
