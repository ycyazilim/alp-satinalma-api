import { Controller } from '@nestjs/common';
import { DemandsService } from './demands.service';

@Controller('demands')
export class DemandsController {
  constructor(private readonly demandsService: DemandsService) {}
}
