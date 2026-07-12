import jwt from 'jsonwebtoken';

const secret = () => process.env.JWT_SECRET || 'dev-only-secret-change-me';

export function signToken(payload) {
  return jwt.sign(payload, secret(), {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
}

export function verifyToken(token) {
  return jwt.verify(token, secret());
}

// Express middleware – attaches req.userId when a valid Bearer token is present
export function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ error: 'Missing or malformed Authorization header.' });
  }

  try {
    const decoded = verifyToken(token);
    req.userId = decoded.sub;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
}
