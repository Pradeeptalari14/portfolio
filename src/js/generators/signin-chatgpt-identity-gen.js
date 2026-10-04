/**
 * SignInChatGPTIdentityGenerator
 * Generates OIDC discovery configuration, PKCE challenge parameters,
 * and JWT validation schemes for Sign in with ChatGPT identity token gateway.
 */
export class SignInChatGPTIdentityGenerator {
  constructor() {
    this.name = 'Sign in with ChatGPT Identity Generator';
    this.version = '1.0.0';
  }

  generate(config = {}) {
    const {
      clientId = 'app_chatgpt_enterprise_prod',
      scopes = 'openid_profile_email',
      ttl = 3600,
      pkce = 'S256'
    } = config;

    return {
      issuer: 'https://auth.openai.com/oauth',
      authorizationEndpoint: 'https://auth.openai.com/oauth/authorize',
      tokenEndpoint: 'https://auth.openai.com/oauth/token',
      userinfoEndpoint: 'https://auth.openai.com/oauth/userinfo',
      jwksUri: 'https://auth.openai.com/oauth/.well-known/jwks.json',
      clientConfiguration: {
        clientId: clientId,
        pkceCodeChallengeMethod: pkce,
        responseType: 'code',
        tokenTtlSeconds: ttl,
        scopesRequested: scopes.split('_')
      },
      claimsValidation: {
        enforceZdrTokenClaim: scopes.includes('zdr'),
        audExpected: clientId,
        issExpected: 'https://auth.openai.com/oauth',
        signatureAlgorithm: 'RS256'
      },
      sampleDecodedClaims: {
        sub: 'usr_chatgpt_987654321',
        email: 'engineer@enterprise.ai',
        email_verified: true,
        org_id: 'org_openai_enterprise_apex',
        zdr_enabled: true,
        exp: Math.floor(Date.now() / 1000) + ttl,
        iat: Math.floor(Date.now() / 1000)
      }
    };
  }

  generateFastAPIMiddleware(config = {}) {
    const clientId = config.clientId || 'app_chatgpt_enterprise_prod';
    return `import jwt
from fastapi import Request, HTTPException, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

security = HTTPBearer()
OPENAI_JWKS_URL = "https://auth.openai.com/oauth/.well-known/jwks.json"
EXPECTED_AUDIENCE = "${clientId}"

def verify_chatgpt_identity_token(credentials: HTTPAuthorizationCredentials = Security(security)):
    token = credentials.credentials
    try:
        # In production, cache JWKS public keys and verify against RS256 signature
        claims = jwt.decode(token, options={"verify_signature": False}, audience=EXPECTED_AUDIENCE)
        if not claims.get("zdr_enabled"):
            raise HTTPException(status_code=403, detail="Non-ZDR tokens rejected by policy")
        return claims
    except Exception as exc:
        raise HTTPException(status_code=401, detail=f"Invalid ChatGPT Identity Token: {exc}")
`;
  }
}
