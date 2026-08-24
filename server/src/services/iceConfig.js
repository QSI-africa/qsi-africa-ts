const crypto = require("crypto");

const createIceConfig = (env = process.env, now = Date.now()) => {
  const turnUrls = (env.TURN_URLS || env.TURN_URL || "")
    .split(",")
    .map((url) => url.trim())
    .filter(Boolean);
  const turnUsername = env.TURN_USERNAME;
  const turnCredential = env.TURN_CREDENTIAL;
  const turnSharedSecret = env.TURN_SHARED_SECRET;
  const relayConfigured = turnUrls.length > 0 && (Boolean(turnSharedSecret) || (Boolean(turnUsername) && Boolean(turnCredential)));
  let expiresAt;

  const iceServers = [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ];

  if (relayConfigured) {
    const parsedTtl = Number.parseInt(env.TURN_TTL_SECONDS || "3600", 10);
    const ttlSeconds = Number.isFinite(parsedTtl) && parsedTtl > 0 ? parsedTtl : 3600;
    const expiresAtSeconds = Math.floor(now / 1000) + ttlSeconds;
    const ephemeralUsername = `${expiresAtSeconds}:panx`;
    const ephemeralCredential = turnSharedSecret
      ? crypto.createHmac("sha1", turnSharedSecret).update(ephemeralUsername).digest("base64")
      : turnCredential;

    iceServers.push({
      urls: turnUrls,
      username: turnSharedSecret ? ephemeralUsername : turnUsername,
      credential: ephemeralCredential,
    });

    if (turnSharedSecret) expiresAt = expiresAtSeconds * 1000;
  }

  return { iceServers, relayConfigured, expiresAt };
};

module.exports = { createIceConfig };
