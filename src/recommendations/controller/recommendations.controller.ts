import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { RecommendationService } from '../service/recommendations.service';
import { ApiResponse } from 'src/common/helpers/api-response';
import { INVALID_TOKEN } from 'src/common/constants/general';
import { ApiInternalServerErrorResponse, ApiOkResponse } from '@nestjs/swagger';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { RECOMMENDATIONS_API_RESPONSES } from '../constants/api';

@Controller('recommendations')
export class RecommendationsController {
    constructor(private recommendationService: RecommendationService) {}

    @Get()
    @ApiOkResponse({ description: RECOMMENDATIONS_API_RESPONSES.SUCCESS })
    @ApiInternalServerErrorResponse({ description: INVALID_TOKEN })
    @UseGuards(AuthGuard)
    async getRecommendations(@Req() req) {
        if(!req.user || !req.user.userId) {
            throw new Error(INVALID_TOKEN);
        }
        const data = await this.recommendationService.getRecommendations(req.user.userId);
        return ApiResponse.success(RECOMMENDATIONS_API_RESPONSES.SUCCESS, data);
    }
}
