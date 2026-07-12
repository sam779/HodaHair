// lib/token-store.js - Simple in-memory token storage
// In production, this should use Vercel KV or a database

let adminTokens = {
  refreshToken: null,
  accessToken: null,
  expiresAt: null,
};

export function storeTokens(refreshToken, accessToken, expiresIn) {
  adminTokens = {
    refreshToken,
    accessToken,
    expiresAt: Date.now() + (expiresIn || 3600) * 1000,
  };
}

export function getAccessToken() {
  return adminTokens.accessToken;
}

export function getRefreshToken() {
  return adminTokens.refreshToken;
}

export function isTokenExpired() {
  return !adminTokens.expiresAt || Date.now() > adminTokens.expiresAt;
}

export function updateAccessToken(accessToken, expiresIn) {
  adminTokens.accessToken = accessToken;
  adminTokens.expiresAt = Date.now() + (expiresIn || 3600) * 1000;
}
