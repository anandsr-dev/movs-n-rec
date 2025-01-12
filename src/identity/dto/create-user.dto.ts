import { ApiProperty } from "@nestjs/swagger";
import { GenderEnum, RoleEnum } from "src/common/constants/general";
import { EnumProperty } from "src/common/helpers/swagger";
import { Genre } from "src/common/types/genre.type";
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
  role?: Role;
  favoriteGenres: Genre[];
  email: string;
}