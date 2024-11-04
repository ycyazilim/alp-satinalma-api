import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { AuthService } from './auth.service';
import { RegisterDto } from 'src/dtos/register.dto';
import { LoginDto } from 'src/dtos/login.dto';
import { CurrentUser } from '../../decorators/current-user';
import { JwtAuthGuard } from "./guards/jwt-auth.guard";

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async registerUser(@Body() registerDto: RegisterDto) {
    return this.authService.registerUser(registerDto);
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('getUser')
  async getUser(@CurrentUser() currentUser) {
    return this.authService.getUser(currentUser._id);
  }
}
