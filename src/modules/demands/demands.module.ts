import { Module } from '@nestjs/common';
import { DemandsService } from './demands.service';
import { DemandsController } from './demands.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Demand, DemandSchema } from 'src/schemas/demand.schema';
import { User, UserSchema } from 'src/schemas/user.schema';
import { Role, RoleSchema } from 'src/schemas/role.schema';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Project, ProjectSchema } from '../../schemas/project.schema';
import {
  UserProject,
  UserProjectScheme,
} from '../../schemas/user.projects.schema';
import { NotifiactionsService } from '../notifications/notifiactions.service';

@Module({
  imports: [
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
      }),
      inject: [ConfigService],
    }),
    MongooseModule.forFeature([
      {
        name: Demand.name,
        schema: DemandSchema,
      },
      {
        name: User.name,
        schema: UserSchema,
      },
      {
        name: Role.name,
        schema: RoleSchema,
      },
      {
        name: Project.name,
        schema: ProjectSchema,
      },
      {
        name: UserProject.name,
        schema: UserProjectScheme,
      },
    ]),
  ],
  controllers: [DemandsController],
  providers: [DemandsService, NotifiactionsService],
})
export class DemandsModule {}
