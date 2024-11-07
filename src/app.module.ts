import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { RolesModule } from './modules/roles/roles.module';
import { DemandsModule } from './modules/demands/demands.module';
import { UsersModule } from './modules/users/users.module';
import { ProjectsModule } from './modules/projects/projects.module';
import { CompareModule } from './modules/compare/compare.module';
import { UserProjectsModule } from './modules/user-projects/user.projects.module';
import { NotifiactionsModule } from './modules/notifications/notifiactions.module';
import { CompanyModule } from './modules/companys/company.module';
import { FilesModule } from './modules/files/files.module';
import { ProductModule } from './modules/products/product.module';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_URI'),
      }),
      inject: [ConfigService],
    }),

    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ProjectsModule,
    AuthModule,
    RolesModule,
    DemandsModule,
    CompareModule,
    UsersModule,
    UserProjectsModule,
    NotifiactionsModule,
    CompanyModule,
    FilesModule,
    ProductModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
