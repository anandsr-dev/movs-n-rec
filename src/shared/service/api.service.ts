import { HttpService } from "@nestjs/axios";
import { Injectable } from "@nestjs/common";
import { CustomError } from "../../common/helpers/custom.error";
import { CustomExceptions } from "../../common/constants/general";
import { firstValueFrom } from "rxjs";

@Injectable()
export class ApiService {
    constructor(private readonly httpService: HttpService) { }

    // add code for using authToken when needed
    async fetch<T>(url: string, authToken?: string) {
        try {
            const response = await firstValueFrom(this.httpService.get<T>(url));
            return response.data;
        } catch (error) {
            // console.error(error);
            console.log(error.cause)
            console.log(error.status)
            console.log(error.config)
            throw new CustomError('Failed to fetch data from external API', CustomExceptions.ExternalApiRequestError);
        }
    }
}