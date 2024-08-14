// TODO - add more robust error handling

import { ZuploContext, ZuploRequest, MemoryZoneReadThroughCache, environment, ContextData } from "@zuplo/runtime";

interface KeyData {
  clientId: string,
  clientSecret: string,
  entityId: string
}

interface TokenCacheEntry {
  accessToken: string,
  refreshToken: string
}

function getBody(clientId: string, clientSecret: string) {
  return `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
    <soap:Body>
        <TokenGet xmlns="http://www.visorsoftware.com/visor/accountsiq/dashboard/Integration/">
            <clientId>${clientId}</clientId>
            <clientSecret>${clientSecret}</clientSecret>
        </TokenGet>
  </soap:Body>
</soap:Envelope>`;
}

export default async function policy(
  request: ZuploRequest,
  context: ZuploContext,
  options: never,
  policyName: string
) {
  const cache = new MemoryZoneReadThroughCache<TokenCacheEntry>("TOKEN_CACHE", context);

  const data: KeyData = request.user.data;

  // load from the cache based on user 'subject'
  let tokens: TokenCacheEntry = await cache.get(request.user.sub);

  context.log.info('after-cache', { tokens });

  if (tokens === undefined) {

    // if no token, go fetch it
    const body = getBody(data.clientId, data.clientSecret);
    const url = environment.BASE_URL;
    const headers = {
      "content-type": "text/xml; charset=utf-8",
    }
    const method = "POST";

    context.log.info({ url, body, headers, method });

    const tokenResponse = await fetch(environment.BASE_URL,
      {
        method,
        body,
        headers,
      });

    // extract the tokens
    const text = await tokenResponse.text();

    context.log.info({ text, status: tokenResponse.status });
    tokens = extractTokens(text);

    if (!tokens || !tokens.accessToken) {
      throw new Error(`Failed to get accessToken:
      
${text}`);
    }

    void cache.put(request.user.sub, tokens, 60);
  }

  // TODO - check expiry of access token, if expired use refresh token
  context.custom.accessToken = tokens.accessToken;
  context.custom.entityId = data.entityId;

  return request;
}

function extractTokens(xmlString: string): TokenCacheEntry | null {
  // Helper function to extract content between tags
  function extractContent(xml: string, tagName: string): string | null {
    const regex = new RegExp(`<${tagName}>([^<]+)</${tagName}>`, 'i');
    const match = xml.match(regex);
    return match ? match[1] : null;
  }

  // Extract AccessToken
  const accessToken = extractContent(xmlString, 'AccessToken');

  // Extract RefreshToken
  const refreshToken = extractContent(xmlString, 'RefreshToken');

  if (accessToken && refreshToken) {
    return { accessToken, refreshToken };
  } else {
    return null;
  }
}

