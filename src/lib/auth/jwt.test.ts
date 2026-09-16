// @vitest-environment node

import { describe, expect, it, beforeEach } from 'vitest';
import { signAccessToken, verifyAccessToken, signRefreshToken, verifyRefreshToken } from './jwt';

describe('JWT helpers', () => {
  beforeEach(() => {
    process.env.JWT_ACCESS_SECRET = 'test-access-secret-1234567890';
    process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-1234567890';
  });

  it('signs and verifies an access token', async () => {
    const token = await signAccessToken({
      sub: 'user-123',
      role: 'EXECUTIVE_COMMITTEE',
      postId: 'post-1',
      committeeId: 'committee-1',
    });

    const payload = await verifyAccessToken(token);

    expect(payload).not.toBeNull();
    expect(payload?.sub).toBe('user-123');
    expect(payload?.role).toBe('EXECUTIVE_COMMITTEE');
  });

  it('signs and verifies a refresh token', async () => {
    process.env.JWT_ACCESS_SECRET = 'test-access-secret-1234567890';
    process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-1234567890';

    const token = await signRefreshToken({
      sub: 'user-456',
      jti: 'token-abc',
    });

    const payload = await verifyRefreshToken(token);

    expect(payload).not.toBeNull();
    expect(payload?.sub).toBe('user-456');
    expect(payload?.jti).toBe('token-abc');
  });
});
