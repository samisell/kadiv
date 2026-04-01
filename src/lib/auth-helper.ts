import { jwtVerify, SignJWT } from 'jose';
import { NextRequest, NextResponse } from 'next/server';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret-key');

export interface AuthPayload {
  userId: string;
  email: string;
  role: string;
}

export type AuthResult =
  | { success: true; payload: AuthPayload }
  | { success: false; response: NextResponse };

/**
 * Verify a JWT from the Authorization header of a NextRequest.
 * Returns { success: true, payload } or { success: false, response }.
 */
export async function authenticateRequest(request: NextRequest): Promise<AuthResult> {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return {
        success: false,
        response: NextResponse.json({ error: 'Missing or invalid authorization header' }, { status: 401 }),
      };
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return {
        success: false,
        response: NextResponse.json({ error: 'No token provided' }, { status: 401 }),
      };
    }

    const { payload } = await jwtVerify(token, JWT_SECRET);

    return {
      success: true,
      payload: {
        userId: payload.userId as string,
        email: payload.email as string,
        role: payload.role as string,
      },
    };
  } catch {
    return {
      success: false,
      response: NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 }),
    };
  }
}

/**
 * Sign a JWT with the given payload. Returns the token string.
 */
export async function signToken(payload: AuthPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET);
}
