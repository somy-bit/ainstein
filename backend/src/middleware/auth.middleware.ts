import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ENV } from '../config/environment';

export interface AuthRequest extends Request {
  user: { id: string; role: string; organizationId: string };
}

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) return res.sendStatus(401); // No token

  jwt.verify(token, ENV.JWT_SECRET, (err, decoded) => {
    if (err) return res.sendStatus(403); // Invalid token

    // Attach user payload to the request
    (req as AuthRequest).user = decoded as { id: string; role: string; organizationId: string };
    next();
  });
};