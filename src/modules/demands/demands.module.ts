import { Module } from '@nestjs/common';
import { DemandsService } from './demands.service';
import { DemandsController } from './demands.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Demand, DemandSchema } from 'src/schemas/demand.schema';
import { User, UserSchema } from 'src/schemas/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Demand.name,
        schema: DemandSchema,
      },
      {
        name: User.name,
        schema: UserSchema,
      },
    ]),
  ],
  controllers: [DemandsController],
  providers: [DemandsService],
})
export class DemandsModule {}
