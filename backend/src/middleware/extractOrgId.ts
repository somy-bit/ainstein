import { Request, Response, NextFunction } from 'express';

interface OrgRequest extends Request {
  organizationId?: string;
}

export const extractOrgId = (req: OrgRequest, res: Response, next: NextFunction) => {
  // Try to get organization ID from various sources
  const orgId = req.body.organizationId || 
                req.params.orgId || 
                req.query.orgId || 
                req.headers['x-organization-id'];
  
  if (orgId) {
    req.organizationId = orgId as string;
  }
  
  next();
};
