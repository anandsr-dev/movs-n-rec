import { Role } from "./user.types";

export type IJwtPayload = {
    userId: string;
    username: string;
    role: Role;
}

export type ITokenData = {
    accessToken: string;
    refreshToken: string;
    exp: string;
}