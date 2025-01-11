import { GenreEnum } from "../constants/genre";

export type Genre = typeof GenreEnum[keyof typeof GenreEnum];