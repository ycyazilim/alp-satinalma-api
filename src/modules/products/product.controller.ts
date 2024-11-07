import { Controller, Get, UseGuards, Query } from '@nestjs/common';
import { ProductService } from './product.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@Query('page') page: string) {
    return this.productService.findAll(+page);
  }

  @UseGuards(JwtAuthGuard)
  @Get('offers')
  findAllOffer(@Query('page') page: string, @Query('id') id: string) {
    return this.productService.findAllOffer(+page, id);
  }
  @UseGuards(JwtAuthGuard)
  @Get('detail')
  detail(@Query('id') id: string) {
    return this.productService.detail(id);
  }
  @UseGuards(JwtAuthGuard)
  @Get('filter')
  filter(
    @Query('name') name: string,
    @Query('page') page: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.productService.filter(name, +page, startDate, endDate);
  }
}
