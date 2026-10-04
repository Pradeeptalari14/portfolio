import { describe, it, expect } from 'vitest';
import { SignInChatGPTIdentityGenerator } from '../src/js/generators/signin-chatgpt-identity-gen.js';

describe('SignInChatGPTIdentityGenerator', () => {
  it('should initialize with correct default properties', () => {
    const generator = new SignInChatGPTIdentityGenerator();
    expect(generator.name).toBe('Sign in with ChatGPT Identity Generator');
    expect(generator.version).toBe('1.0.0');
  });

  it('should generate valid OIDC metadata and client config', () => {
    const generator = new SignInChatGPTIdentityGenerator();
    const result = generator.generate({
      clientId: 'custom_client_prod',
      scopes: 'openid_enterprise_zdr',
      ttl: 7200,
      pkce: 'S256'
    });

    expect(result.issuer).toBe('https://auth.openai.com/oauth');
    expect(result.clientConfiguration.clientId).toBe('custom_client_prod');
    expect(result.clientConfiguration.tokenTtlSeconds).toBe(7200);
    expect(result.claimsValidation.enforceZdrTokenClaim).toBe(true);
    expect(result.sampleDecodedClaims.zdr_enabled).toBe(true);
  });

  it('should generate FastAPI authentication middleware code', () => {
    const generator = new SignInChatGPTIdentityGenerator();
    const middleware = generator.generateFastAPIMiddleware({ clientId: 'app_test_123' });
    expect(middleware).toContain('def verify_chatgpt_identity_token');
    expect(middleware).toContain('EXPECTED_AUDIENCE = "app_test_123"');
    expect(middleware).toContain('zdr_enabled');
  });
});
