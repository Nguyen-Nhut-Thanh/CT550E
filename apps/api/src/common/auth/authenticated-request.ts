import type { Request } from 'express';
import type { WorkforceActor } from 'shared';

export interface AuthenticatedUser {
  sub: number;
  email: string;
  accountId: number;
  isStaff?: boolean;
}

export interface AuthenticatedRequest extends Request {
  user: AuthenticatedUser;
}

export interface StaffRequest extends AuthenticatedRequest {
  workforce: WorkforceActor;
}

