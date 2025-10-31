import { Response, NextFunction } from 'express';
import { UserRole } from '../types';
import { AuthRequest } from './auth.middleware';

export const checkRole = (allowedRoles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    const userRole = req.user?.role;

    if (!userRole || !allowedRoles.includes(userRole as UserRole)) {
      return res.status(403).json({ message: 'Access denied: Insufficient privileges.' });
    }
    next();
  };
};