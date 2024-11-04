import {
  Controller,
} from '@nestjs/common';
import { NotifiactionsService } from './notifiactions.service';

@Controller('notifications')
export class NotifiactionsController {
  constructor(private readonly projectsService: NotifiactionsService) {}
}
