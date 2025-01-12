import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { Genre } from 'src/common/types/genre.type';
import { UserService } from 'src/identity/services/user.service';

@Injectable()
export class NotificationService {
    constructor(private userService: UserService) { }

    async sendMovieNotification(payload) {
        console.log(`Movie added. Email sent to ${payload.email}`);
    };

    @OnEvent('movie.added', { async: true })
    async notifyUsers(payload) {
        const cursor = await this.userService.findByGenresCursor(payload.genres);
        cursor
        .on('data', this.sendMovieNotification)
        .on('end', () => { 
            console.log('Done!');
            cursor.close();
        })
    };

}
