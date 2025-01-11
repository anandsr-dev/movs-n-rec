import { HttpService } from "@nestjs/axios";
import { Injectable } from "@nestjs/common";
import { CustomError } from "../../common/helpers/custom.error";
import { CustomExceptions } from "../../common/constants/general";
import { firstValueFrom } from "rxjs";
import axios from "axios";

@Injectable()
export class ApiService {
    constructor(private readonly httpService: HttpService) { }

    async fetch<T>(url: string, authToken?: string) {
        try {
            const response = await firstValueFrom(this.httpService.get<T>(url, { headers: { Authorization: authToken || undefined } }));
            return response.data;
        } catch (error) {
            console.error(error);
            throw new CustomError('Failed to fetch data from external API', CustomExceptions.ExternalApiRequestError);
        }
    }

    async axiosFetch<T>(url: string, authToken?: string) {
        try {
            const response = await axios.get(url);
            return response.data;
        } catch (error) {
            console.error(error);
            throw new CustomError('Failed to fetch data from external API', CustomExceptions.ExternalApiRequestError);
        }
    }
}