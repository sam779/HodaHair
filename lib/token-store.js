// lib/token-store.js - Token storage using Redis (REDIS_URL)

import { createClient } from 'redis';

const TOKEN_KEY = 'admin:tokens';
let client = null;

async function getRedisClient() {
  if (client) {
    return client;
  }

  if (!process.env.REDIS_URL) {
    throw new Error('REDIS_URL environment variable not set');
  }

  client = createClient({
    url: process.env.REDIS_URL,
  });

  client.on('error', (err) => console.error('Redis client error:', err));

  await client.connect();
  return client;
}

export async function storeTokens(refreshToken, accessToken, expiresIn) {
  const expiresAt = Date.now() + (expiresIn || 3600) * 1000;

  try {
    const redis = await getRedisClient();
    await redis.hSet(TOKEN_KEY, {
      refreshToken,
      accessToken,
      expiresAt: expiresAt.toString(),
    });
    console.log('[token-store] Tokens stored in Redis');
  } catch (error) {
    console.error('[token-store] Failed to store tokens in Redis:', error);
    throw error;
  }
}

export async function getAccessToken() {
  try {
    const redis = await getRedisClient();
    const tokens = await redis.hGetAll(TOKEN_KEY);
    if (!tokens || !tokens.accessToken) {
      console.log('[token-store] No access token found in Redis');
      return null;
    }
    console.log('[token-store] Retrieved access token from Redis');
    return tokens.accessToken;
  } catch (error) {
    console.error('[token-store] Failed to get access token from Redis:', error);
    return null;
  }
}

export async function getRefreshToken() {
  try {
    const redis = await getRedisClient();
    const tokens = await redis.hGetAll(TOKEN_KEY);
    if (!tokens || !tokens.refreshToken) {
      console.log('[token-store] No refresh token found in Redis');
      return null;
    }
    return tokens.refreshToken;
  } catch (error) {
    console.error('[token-store] Failed to get refresh token from Redis:', error);
    return null;
  }
}

export async function isTokenExpired() {
  try {
    const redis = await getRedisClient();
    const tokens = await redis.hGetAll(TOKEN_KEY);
    if (!tokens || !tokens.expiresAt) {
      console.log('[token-store] No expiry info found - token expired');
      return true;
    }
    const expired = Date.now() > parseInt(tokens.expiresAt);
    console.log('[token-store] Token expired:', expired);
    return expired;
  } catch (error) {
    console.error('[token-store] Failed to check token expiry:', error);
    return true;
  }
}

export async function updateAccessToken(accessToken, expiresIn) {
  const expiresAt = Date.now() + (expiresIn || 3600) * 1000;

  try {
    const redis = await getRedisClient();
    await redis.hSet(TOKEN_KEY, {
      accessToken,
      expiresAt: expiresAt.toString(),
    });
    console.log('[token-store] Access token updated in Redis');
  } catch (error) {
    console.error('[token-store] Failed to update access token in Redis:', error);
    throw error;
  }
}
