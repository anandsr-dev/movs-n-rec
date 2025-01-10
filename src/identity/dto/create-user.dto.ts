import { Gender, Role } from "src/common/types/user.types";

export class CreateUserDto {
    username: string;
    password: string;
    name: string;
    dob: string;
    gender: Gender;
    state: string;
    role?: Role
  }
  