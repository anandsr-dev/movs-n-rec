import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { RoleGuard } from './role.guard';
import { AccessLevel } from '../constants/general';
import { Role } from '../types/user.types';

describe('RoleGuard', () => {
  const mockExecutionContext = (user: any): Partial<ExecutionContext> => ({
    switchToHttp: jest.fn().mockReturnValue({
      getRequest: jest.fn().mockReturnValue({
        user,
      }),
    }),
  });

  it('should allow access if user role matches or exceeds required role', () => {
    const requiredRole: Role = 'admin';
    const guard = RoleGuard(requiredRole);
    const context = mockExecutionContext({ role: 'admin' }) as ExecutionContext;

    const canActivate = new guard().canActivate(context);

    expect(canActivate).toBe(true);
  });

  it('should deny access if user role does not meet the required level', () => {
    const requiredRole: Role = 'admin';
    const guard = RoleGuard(requiredRole);
    const context = mockExecutionContext({ role: 'user' }) as ExecutionContext;

    expect(() => new guard().canActivate(context)).toThrow(
      new ForbiddenException('You do not have permission to access this resource')
    );
  });

  it('should deny access if user is not authenticated', () => {
    const requiredRole: Role = 'admin';
    const guard = RoleGuard(requiredRole);
    const context = mockExecutionContext(null) as ExecutionContext;

    expect(() => new guard().canActivate(context)).toThrow(
      new ForbiddenException('You do not have permission to access this resource')
    );
  });

  it('should deny access if user role is undefined', () => {
    const requiredRole: Role = 'admin';
    const guard = RoleGuard(requiredRole);
    const context = mockExecutionContext({}) as ExecutionContext;

    expect(() => new guard().canActivate(context)).toThrow(
      new ForbiddenException('You do not have permission to access this resource')
    );
  });

  it('should allow access for roles exceeding the required role level', () => {
    const requiredRole: Role = 'user';
    const guard = RoleGuard(requiredRole);
    const context = mockExecutionContext({ role: 'admin' }) as ExecutionContext;

    const canActivate = new guard().canActivate(context);

    expect(canActivate).toBe(true);
  });

  it('should correctly use AccessLevel for role comparison', () => {
    const requiredRole: Role = 'superadmin';
    const guard = RoleGuard(requiredRole);
    const context = mockExecutionContext({ role: 'admin' }) as ExecutionContext;

    expect(() => new guard().canActivate(context)).toThrow(
      new ForbiddenException('You do not have permission to access this resource')
    );
  });
});
