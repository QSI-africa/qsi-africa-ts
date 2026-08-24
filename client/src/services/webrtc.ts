/* global RTCConfiguration */
import api from '../api';

export interface PanXIceConfiguration extends RTCConfiguration {
  relayConfigured: boolean;
  expiresAt?: number;
}

const FALLBACK_CONFIGURATION: PanXIceConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' }
  ],
  iceCandidatePoolSize: 10,
  relayConfigured: false
};

let configurationPromise: Promise<PanXIceConfiguration> | null = null;
let configurationExpiresAt = 0;

export const getIceConfiguration = () => {
  if (configurationExpiresAt && Date.now() >= configurationExpiresAt - 60_000) {
    configurationPromise = null;
    configurationExpiresAt = 0;
  }

  if (!configurationPromise) {
    configurationPromise = api.get('/ice-config')
      .then(({ data }) => {
        const iceServers = Array.isArray(data?.iceServers) && data.iceServers.length > 0
          ? data.iceServers
          : FALLBACK_CONFIGURATION.iceServers;

        const configuration = {
          iceServers,
          iceCandidatePoolSize: 10,
          relayConfigured: Boolean(data?.relayConfigured),
          expiresAt: typeof data?.expiresAt === 'number' ? data.expiresAt : undefined,
        } satisfies PanXIceConfiguration;

        configurationExpiresAt = configuration.expiresAt || 0;
        return configuration;
      })
      .catch((error) => {
        console.warn('Using fallback STUN configuration because ICE config could not be loaded.', error);
        return FALLBACK_CONFIGURATION;
      });
  }

  return configurationPromise;
};

export const toRtcConfiguration = ({ relayConfigured: _relayConfigured, expiresAt: _expiresAt, ...configuration }: PanXIceConfiguration): RTCConfiguration => configuration;
