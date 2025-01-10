import { Gender, Role } from "src/common/types/user.types";

export type UserInfo = {
    username: string;
    userId: string;
    name: string;
    dob: string;
    gender: Gender;
    state: string;
    role: Role;
    reviews: any;
}