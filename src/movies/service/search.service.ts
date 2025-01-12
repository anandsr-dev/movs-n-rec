// import { SearchRequest } from '@elastic/elasticsearch/lib/api/typesWithBodyKey';
import { SearchRequest } from '@elastic/elasticsearch/lib/api/types';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';

@Injectable()
export class SearchService implements OnModuleInit {
    constructor(private readonly elasticsearchService: ElasticsearchService) {}

    async onModuleInit() {
        // await this.deleteIndex('movies');
        // await this.createMoviesIndex();
    }

      async getIndex(indexName: string): Promise<void> {
        try {
            const response = await this.elasticsearchService.indices.get({ index: indexName });
            console.log(response);
        } catch (error) {
            console.error(`Error getting index information for "${indexName}"`, error);
            throw error;
        }
      }

      async deleteIndex(indexName: string): Promise<void> {
        try {
          const response = await this.elasticsearchService.indices.delete({
            index: indexName,
          });
          console.log(`Index "${indexName}" deleted successfully`, response);
        } catch (error) {
          console.error(`Error deleting index "${indexName}"`, error);
          throw error;
        }
      }
    
      async createMoviesIndex() {
        const indexExists = await this.elasticsearchService.indices.exists({ index: 'movies' });
    
        if (!indexExists) {
          await this.elasticsearchService.indices.create({
            index: 'movies',
            body: {
              settings: {
                analysis: {
                  analyzer: {
                    ngram_analyzer: {
                      tokenizer: 'ngram_tokenizer',
                      type: 'custom',
                    },
                  },
                  tokenizer: {
                    ngram_tokenizer: {
                      type: 'ngram',
                      min_gram: 3,
                      max_gram: 8,
                      token_chars: ['letter', 'digit'],
                    },
                  },
                },
                max_ngram_diff: 10
              },
              mappings: {
                properties: {
                  title: {
                    type: 'text',
                    analyzer: 'ngram_analyzer',
                    search_analyzer: 'ngram_analyzer',
                  },
                  description: {
                    type: 'text',
                  },
                  director: {
                    type: 'text',
                  },
                  genres: {
                    type: 'keyword',
                  },
                  releaseDate: {
                    type: 'date',
                  },
                  averageRating: {
                    type: 'float',
                  },
                },
              },
            },
          });
    
          console.log('Elasticsearch index "movies" created successfully!');
        } else {
          console.log('Elasticsearch index "movies" already exists.');
        }
      }
    

    async searchMovies(query: string, filters: any, page: number, limit: number): Promise<any> {
      const body: SearchRequest = {
        query: {
          bool: {
            must: {
              multi_match: {
                query,
                fields: ['title^3', 'description', 'director'], // Boost title relevance
              },
            },
          },
        },
        from: (page - 1) * limit,
        size: limit,
      };
  
      // Add filters
      body.query.bool.filter = [];

      //Comma separated list of genres to include
      if (filters.genres) {
        body.query.bool.filter.push({ terms: { genres: filters.genres.split(',') } });
      }
      if (filters.releaseYear) {
        body.query.bool.filter.push({
          range: { releaseDate: { gte: `${filters.releaseYear}-01-01`, lte: `${filters.releaseYear}-12-31` } },
        });
      }
      if (filters.rating) {
        body.query.bool.filter.push({ range: { averageRating: { gte: filters.rating.gte, lte: filters.rating.lte } } });
      }
      const result = await this.elasticsearchService.search({
        index: 'movies',
        body,
      });
  
      return result.hits.hits.map((hit) => hit._source);
    }
  
}
