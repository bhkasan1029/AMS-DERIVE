import {
  Controller,
  Get,
  Patch,
  Delete,
  Body,
  UseGuards,
  Req,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { FirebaseAuthGuard } from '../../common/guards/firebase-auth.guard';

@Controller('users')
@UseGuards(FirebaseAuthGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('me')
  async getMe(@Req() req: any) {
    const user = await this.usersService.findOne(req.user.uid);
    return { success: true, data: user };
  }

  @Patch('me')
  async updateMe(@Req() req: any, @Body() updateUserDto: UpdateUserDto) {
    const user = await this.usersService.update(req.user.uid, updateUserDto);
    return { success: true, data: user };
  }

  @Delete('me')
  async deleteMe(@Req() req: any) {
    const result = await this.usersService.remove(req.user.uid);
    return { success: true, data: result };
  }
}
