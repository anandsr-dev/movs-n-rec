import { ApiProperty } from "@nestjs/swagger";
import { GenderEnum, RoleEnum } from "src/common/constants/general";
import { EnumProperty } from "src/common/helpers/swagger";
import { Gender, Role } from "src/common/types/user.types";
export class CreateUserDto {
  username: string;
  password: string;
  name: string;
  dob: string;
  @ApiProperty(EnumProperty(GenderEnum))
  gender: Gender;
  state: string;
  @ApiProperty(EnumProperty(RoleEnum))
  role?: Role
}