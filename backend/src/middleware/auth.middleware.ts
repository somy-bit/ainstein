import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ENV } from '../config/environment';

export interface AuthRequest extends Request {
  user: { id: string; role: string; organizationId: string };
}

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  // Auth middleware - validating request
  
  const authHeader = req.headers['authorization'];
  // Token validation (logging removed for security)
  
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) {
    // No token provided
    return res.sendStatus(401);
  }

  jwt.verify(token, ENV.JWT_SECRET, (err, decoded) => {
    if (err) {
      // Token verification failed
      return res.sendStatus(403);
    }

    // Token verified successfully
    
    // Attach user payload to the request
    (req as AuthRequest).user = decoded as { id: string; role: string; organizationId: string };
    // User authenticated successfully
    next();
  });
};