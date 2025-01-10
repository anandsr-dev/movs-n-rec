import { CookieOptions } from "express";
import { postHours } from "./time";

export function getCookieConfig(expiresInHours: number): CookieOptions {
    return { expires: expiresInHours ? postHours(expiresInHours) : new Date(), httpOnly: true, sameSite: 'none', secure: true };
}