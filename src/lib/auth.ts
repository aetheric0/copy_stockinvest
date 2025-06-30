import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET!;

export interface TokenPayload {
  id: string;
  username?: string;
  email?: string;
  isVerified?: boolean;
  exp?: number;
}

/**
 * Verifies a JWT from the authToken cookie.
 * Throws on invalid or expired token.
 */
export function verifyToken(token: string): TokenPayload {
    try {
      return jwt.verify(token, JWT_SECRET) as TokenPayload;
    } catch (err) {
      throw new Error(`Invalid or expired token: ${err}`);
    }
  }
  /**
   * Extracts and verifies authToken from the request cookies.
   * Returns the payload or responds with 401.
   */
  export function requireAuth(request: Request) {
    const cookieHeader = request.headers.get('cookie') || '';
    const match = cookieHeader.match(/authToken=([^;]+)/);
    if (!match) throw new Error('Unauthorized');
  
    const token = match[1];
    return verifyToken(token);
  }
  


  