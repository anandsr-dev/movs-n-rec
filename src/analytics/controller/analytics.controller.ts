import { Controller, Get } from '@nestjs/common';
import { AnalyticsService } from '../service/analytics.service';
import { ApiResponse } from 'src/common/helpers/api-response';
import { ANALYTICS_API_RESPONSES } from '../constants.ts/api';
import { ApiOkResponse } from '@nestjs/swagger';

@Controller('analytics')
export class AnalyticsController {
    constructor(private analyticsService: AnalyticsService) {}

    @Get('top-rated')
    @ApiOkResponse({ description: ANALYTICS_API_RESPONSES.TOP_RATED_SUCCESS })
    async getTopRated() {
        const data = await this.analyticsService.getTopRatedMovies();
        return ApiResponse.success(ANALYTICS_API_RESPONSES.TOP_RATED_SUCCESS, data);
    }

    @Get('most-reviewed')
    @ApiOkResponse({ description: ANALYTICS_API_RESPONSES.MOST_REVIEWED_SUCCESS })
    async getMostReviewed() {
        const data = await this.analyticsService.getMostRatedMovies();
        return ApiResponse.success(ANALYTICS_API_RESPONSES.MOST_REVIEWED_SUCCESS, data);
    }
}
