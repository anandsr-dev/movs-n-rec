import { Genre } from "src/common/types/genre.type";
import { Gender } from "src/common/types/user.types";

export class UpdateUserDto {
    name?: string;
    dob?: Date;
    gender?: Gender;
    state?: string;
    favoriteGenres: Genre[];
    email: string;
}