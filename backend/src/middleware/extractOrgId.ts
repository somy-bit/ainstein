import { Request, Response, NextFunction } from 'express';

export const extractOrgId = (req: any, res: Response, next: NextFunction) => {
  // Try to get organization ID from various sources
  const orgId = req.user?.organizationId || 
                req.body.organizationId || 
                req.params.orgId || 
                req.query.orgId || 
                req.headers['x-organization-id'];
  
  if (orgId) {
    req.organizationId = orgId as string;
  }
  
  next();
};
