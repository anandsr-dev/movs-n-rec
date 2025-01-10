import { GenderEnum, RoleEnum } from "../constants";

export type Role = typeof RoleEnum[keyof typeof RoleEnum];
export type Gender = typeof GenderEnum[keyof typeof GenderEnum];