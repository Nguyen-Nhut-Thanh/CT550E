import type { JwtPayload } from "../auth/contracts";
import type { AuthRequestUser } from "../auth/server";
export type AuthenticatedRequest = {
    user: Pick<AuthRequestUser, "sub" | "accountId" | "isStaff"> & {
        is_staff?: boolean;
    };
};
export type JwtChatPayload = Omit<JwtPayload, 'accountId'> & Partial<Pick<JwtPayload, 'accountId'>>;
