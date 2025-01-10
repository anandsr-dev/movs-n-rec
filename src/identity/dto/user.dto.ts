import { Gender, Role } from "src/common/types/user.types";

export class UserDto {
    username: string;
    userId: string;
    name: string;
    dob: string;
    gender: Gender;
    state: string;
    role: Role;
    reviews: any;
}