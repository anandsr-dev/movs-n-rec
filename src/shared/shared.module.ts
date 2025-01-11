import { Module } from '@nestjs/common';
import { ApiService } from './service/api.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    HttpModule.register({ timeout: 10000, maxRedirects: 5 })
  ],
  providers: [ApiService],
  exports: [HttpModule, ApiService]
})
export class SharedModule {}
