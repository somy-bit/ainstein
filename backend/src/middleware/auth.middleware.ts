import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ENV } from '../config/environment';

export interface AuthRequest extends Request {
  user: { id: string; role: string; organizationId: string };
}

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  console.log('🔐 Auth middleware - URL:', req.url);
  console.log('🔐 Auth middleware - Method:', req.method);
  
  const authHeader = req.headers['authorization'];
  console.log('🔐 Auth header:', authHeader ? 'Present' : 'Missing');
  
  const token = authHeader && authHeader.split(' ')[1];
  console.log('🔐 Token:', token ? 'Present' : 'Missing');

  if (token == null) {
    console.log('❌ No token provided');
    return res.sendStatus(401); // No token
  }

  jwt.verify(token, ENV.JWT_SECRET, (err, decoded) => {
    if (err) {
      console.log('❌ Token verification failed:', err.message);
      return res.sendStatus(403); // Invalid token
    }

    console.log('✅ Token verified, decoded:', decoded);
    
    // Attach user payload to the request
    (req as AuthRequest).user = decoded as { id: string; role: string; organizationId: string };
    console.log('✅ User attached to request:', (req as AuthRequest).user);
    next();
  });
};