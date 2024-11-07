import { Module } from '@nestjs/common';
import { CompareService } from './compare.service';
import { CompareController } from './compare.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Demand, DemandSchema } from 'src/schemas/demand.schema';
import { User, UserSchema } from 'src/schemas/user.schema';
import { Role, RoleSchema } from 'src/schemas/role.schema';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Project, ProjectSchema } from '../../schemas/project.schema';
import { Compare, CompareScheme } from '../../schemas/compare.schema';
import {
  UserProject,
  UserProjectScheme,
} from '../../schemas/user.projects.schema';
import { NotifiactionsService } from '../notifications/notifiactions.service';
import { Product, ProductSchema } from '../../schemas/product.schema';
import {
  ProductOffer,
  ProductOfferSchema,
} from '../../schemas/product.offer.schema';
import { ProductService } from '../products/product.service';

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
        name: Compare.name,
        schema: CompareScheme,
      },
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
      {
        name: Product.name,
        schema: ProductSchema,
      },
      {
        name: ProductOffer.name,
        schema: ProductOfferSchema,
      },
    ]),
  ],
  controllers: [CompareController],
  providers: [CompareService, NotifiactionsService, ProductService],
})
export class CompareModule {}
