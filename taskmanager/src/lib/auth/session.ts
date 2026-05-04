import { verifyAccessToken } from '@/lib/auth/token';
import { readAccessCookie } from '@/lib/auth/cookies';

export async function auth(): Promise<{ userId: string } | null> {
  const token = await readAccessCookie();
  if (!token) return null;
  return verifyAccessToken(token);
}
