import { Module } from '@nestjs/common';
import { UserProjectsService } from './user.projects.service';
import { UserProjectsController } from './user.projects.controller';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import {
  UserProject,
  UserProjectScheme,
} from '../../schemas/user.projects.schema';
import { Project, ProjectSchema } from '../../schemas/project.schema';
import { User, UserSchema } from '../../schemas/user.schema';
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
        name: UserProject.name,
        schema: UserProjectScheme,
      },
      {
        name: Project.name,
        schema: ProjectSchema,
      },
      {
        name: User.name,
        schema: UserSchema,
      },
    ]),
  ],
  controllers: [UserProjectsController],
  providers: [UserProjectsService, NotifiactionsService],
})
export class UserProjectsModule {}
