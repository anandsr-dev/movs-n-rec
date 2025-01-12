import { Controller, Get, Query } from '@nestjs/common';
import { SearchService } from '../service/search.service';

@Controller('movies/search')
export class SearchController {
    constructor(private searchService: SearchService) {}
    
    @Get()
    async searchMovies(
      @Query('query') query: string,
      @Query('genres') genres?: string,
      @Query('releaseYear') releaseYear?: number,
      @Query('rating') rating?: string, // Expect format: "gte:4,lte:5"
      @Query('page') page = 1,
      @Query('limit') limit = 10,
    ) {
      const filters: any = {};
      if (genres) filters.genres = genres;
      if (releaseYear) filters.releaseYear = releaseYear;
      if (rating) {
        const [gte, lte] = rating.split(',').map((x) => parseFloat(x.split(':')[1]));
        filters.rating = { gte, lte };
      }
  
      return this.searchService.searchMovies(query, filters, page, limit);
    }
  
}
