import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { UsersService } from './users.service';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get(':id')
  @ApiOperation({ summary: '사용자 조회' })
  async getUser(@Param('id') id: string) {
    return this.usersService.findById(id);
  }
}
