import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Req,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { FirebaseAuthGuard } from '../../common/guards/firebase-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    const user = await this.authService.register(registerDto);
    return { success: true, data: user };
  }

  @UseGuards(FirebaseAuthGuard)
  @Get('profile')
  async getProfile(@Req() req: any) {
    const profile = await this.authService.getProfile(req.user.uid);
    return { success: true, data: profile };
  }
}
