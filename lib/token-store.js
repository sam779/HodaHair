// lib/token-store.js - Token storage using Vercel KV (Redis)

import { kv } from '@vercel/kv';

const TOKEN_KEY = 'admin:tokens';

export async function storeTokens(refreshToken, accessToken, expiresIn) {
  const expiresAt = Date.now() + (expiresIn || 3600) * 1000;

  try {
    await kv.hset(TOKEN_KEY, {
      refreshToken,
      accessToken,
      expiresAt: expiresAt.toString(),
    });
    console.log('Tokens stored in KV');
  } catch (error) {
    console.error('Failed to store tokens in KV:', error);
    throw error;
  }
}

export async function getAccessToken() {
  try {
    const tokens = await kv.hgetall(TOKEN_KEY);
    if (!tokens || !tokens.accessToken) {
      return null;
    }
    return tokens.accessToken;
  } catch (error) {
    console.error('Failed to get access token from KV:', error);
    return null;
  }
}

export async function getRefreshToken() {
  try {
    const tokens = await kv.hgetall(TOKEN_KEY);
    if (!tokens || !tokens.refreshToken) {
      return null;
    }
    return tokens.refreshToken;
  } catch (error) {
    console.error('Failed to get refresh token from KV:', error);
    return null;
  }
}

export async function isTokenExpired() {
  try {
    const tokens = await kv.hgetall(TOKEN_KEY);
    if (!tokens || !tokens.expiresAt) {
      return true;
    }
    return Date.now() > parseInt(tokens.expiresAt);
  } catch (error) {
    console.error('Failed to check token expiry:', error);
    return true;
  }
}

export async function updateAccessToken(accessToken, expiresIn) {
  const expiresAt = Date.now() + (expiresIn || 3600) * 1000;

  try {
    await kv.hset(TOKEN_KEY, {
      accessToken,
      expiresAt: expiresAt.toString(),
    });
  } catch (error) {
    console.error('Failed to update access token in KV:', error);
    throw error;
  }
}
