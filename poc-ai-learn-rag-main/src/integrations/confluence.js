'use strict';

const nodeFetch = require('node-fetch');

// ── Confluence REST API v2 client ────────────────────────────────────────────
class ConfluenceClient {
  constructor(opts) {
    this.authMethod = opts.authMethod || 'apitoken';

    if (this.authMethod === 'oauth') {
      this.cloudId     = opts.cloudId;
      this.baseUrl     = 'https://api.atlassian.com/ex/confluence/' + this.cloudId + '/wiki/api/v2';
      this.accessToken = opts.accessToken;
    } else {
      const instanceUrl = (opts.url || '').replace(/\/+$/, '');
      this.baseUrl = instanceUrl + '/wiki/api/v2';
      const creds  = Buffer.from((opts.email || '') + ':' + (opts.apiToken || '')).toString('base64');
      this._basicAuth = 'Basic ' + creds;
    }
  }

  _headers() {
    const h = { Accept: 'application/json' };
    if (this.authMethod === 'oauth') h['Authorization'] = 'Bearer ' + this.accessToken;
    else                             h['Authorization'] = this._basicAuth;
    return h;
  }

  async _get(relPath, retries = 3) {
    const url = this.baseUrl + relPath;
    for (let attempt = 0; attempt < retries; attempt++) {
      let r;
      try {
        r = await nodeFetch(url, { headers: this._headers(), timeout: 30000 });
      } catch (e) {
        if (attempt === retries - 1) throw e;
        await new Promise(res => setTimeout(res, 1000 * (attempt + 1)));
        continue;
      }
      if (r.status === 429) {
        const wait = parseInt(r.headers.get('Retry-After') || '5', 10) * 1000;
        await new Promise(res => setTimeout(res, wait));
        continue;
      }
      if (r.status === 401) {
        const body = await r.text().catch(() => '');
        throw new Error('Confluence API 401 — check email and API token' + (body ? ': ' + body.slice(0, 200) : ''));
      }
      if (r.status === 403) {
        return null; // space/page not accessible — caller checks for null
      }
      if (!r.ok) {
        const body = await r.text().catch(() => '');
        throw new Error('Confluence API ' + r.status + ' ' + r.statusText + (body ? ': ' + body.slice(0, 300) : ''));
      }
      return r.json();
    }
    return null;
  }

  // Extract next-page cursor from _links.next (handles both relative and absolute URLs)
  _nextPath(data) {
    if (!data._links || !data._links.next) return null;
    const next = data._links.next;
    const pathname = next.startsWith('http') ? new URL(next).pathname + (new URL(next).search || '') : next;
    const m = pathname.match(/\/wiki\/api\/v2(.+)/);
    return m ? m[1] : null;
  }

  async testConnection() {
    const data = await this._get('/spaces?limit=1&type=global&status=current');
    return { ok: true, spaceCount: (data.results || []).length };
  }

  async getSpaces() {
    const results = [];
    let next = '/spaces?limit=50&type=global&status=current';
    while (next) {
      const data = await this._get(next);
      results.push(...(data.results || []));
      next = this._nextPath(data);
    }
    return results;
  }

  async getPagesInSpace(spaceId) {
    const results = [];
    let next = '/spaces/' + spaceId + '/pages?limit=50&depth=all&body-format=storage&status=current';
    while (next) {
      const data = await this._get(next);
      if (!data) break; // 403 — space not accessible
      results.push(...(data.results || []));
      next = this._nextPath(data);
    }
    return results;
  }
}

// ── OAuth 2.0 (3LO) helpers ──────────────────────────────────────────────────
const ATLASSIAN_AUTH_URL  = 'https://auth.atlassian.com/authorize';
const ATLASSIAN_TOKEN_URL = 'https://auth.atlassian.com/oauth/token';
const OAUTH_SCOPES = [
  'read:confluence-content.all',
  'read:confluence-space.summary',
  'offline_access',
].join(' ');

function buildOAuthUrl(clientId, callbackUrl, state) {
  return ATLASSIAN_AUTH_URL +
    '?audience=api.atlassian.com' +
    '&client_id='    + encodeURIComponent(clientId) +
    '&scope='        + encodeURIComponent(OAUTH_SCOPES) +
    '&redirect_uri=' + encodeURIComponent(callbackUrl) +
    '&state='        + encodeURIComponent(state) +
    '&response_type=code' +
    '&prompt=consent';
}

async function exchangeOAuthCode(clientId, clientSecret, code, callbackUrl) {
  const r = await nodeFetch(ATLASSIAN_TOKEN_URL, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({
      grant_type:    'authorization_code',
      client_id:     clientId,
      client_secret: clientSecret,
      code,
      redirect_uri:  callbackUrl,
    }),
  });
  if (!r.ok) throw new Error('Token exchange failed (' + r.status + '): ' + await r.text());
  const tokens = await r.json();

  // Get cloudId from accessible resources
  const rr = await nodeFetch('https://api.atlassian.com/oauth/token/accessible-resources', {
    headers: { Authorization: 'Bearer ' + tokens.access_token, Accept: 'application/json' },
  });
  if (!rr.ok) throw new Error('Could not fetch Atlassian resources: ' + await rr.text());
  const resources = await rr.json();
  // Find the Confluence cloud resource
  const resource = resources.find(r => r.scopes && r.scopes.some(s => s.includes('confluence')))
    || resources[0]
    || {};

  return {
    accessToken:  tokens.access_token,
    refreshToken: tokens.refresh_token,
    expiresIn:    tokens.expires_in,
    cloudId:      resource.id || '',
    cloudName:    resource.name || '',
    cloudUrl:     resource.url || '',
  };
}

async function refreshOAuthToken(clientId, clientSecret, refreshToken) {
  const r = await nodeFetch(ATLASSIAN_TOKEN_URL, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({
      grant_type:    'refresh_token',
      client_id:     clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
    }),
  });
  if (!r.ok) throw new Error('Token refresh failed (' + r.status + '): ' + await r.text());
  return r.json();
}

module.exports = { ConfluenceClient, buildOAuthUrl, exchangeOAuthCode, refreshOAuthToken };
