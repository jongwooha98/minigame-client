import Mini from '@karrotmarket/mini';
import {
  emptyKarrotMarketMini,
  KarrotMarketMini,
} from 'services/karrotMarketMini';

import { KarrotMarketMiniConfig } from './config';

let mini: Mini;
export const getMini = () => {
  if (mini) {
    return mini;
  } else {
    return (mini = new Mini());
  }
};

export function createKarrotMarketMini(
  config: KarrotMarketMiniConfig
): KarrotMarketMini {
  const mini = getMini();
  const presetUrl: string = config.presetUrl!;
  const appId: string = config.appId!;

  async function startPreset(runOnSuccess: (code: string) => void) {
    mini.startPreset({
      preset: presetUrl,
      params: {
        appId: appId,
      },
      onSuccess: async function (result) {
        if (result && result.code) {
          try {
            runOnSuccess(result.code);
          } catch (error) {
            console.error(error);
          }
        }
      },
      onFailure() {
        throw new Error('mini-app preset failed');
      },
    });
  }

  async function close() {
    mini.close();
  }

  async function share(url: string, text: string) {
    mini.share({
      url: url,
      text: text,
    });
  }

  if (mini.environment === 'Web') {
    return emptyKarrotMarketMini;
  } else {
    return {
      startPreset,
      close,
      share,
    };
  }
}
