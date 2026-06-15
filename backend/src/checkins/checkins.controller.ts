import { Body, Controller, Delete, Get, HttpCode, Param, Post } from '@nestjs/common';
import { CheckInsService } from './checkins.service';
import { CreateCheckInDto } from './dto/create-checkin.dto';

@Controller('checkins')
export class CheckInsController {
  constructor(private readonly checkInsService: CheckInsService) {}

  @Get()
  findAll() {
    return this.checkInsService.findAll();
  }

  @Post()
  @HttpCode(200)
  create(@Body() dto: CreateCheckInDto) {
    return this.checkInsService.create(dto);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id') id: string) {
    return this.checkInsService.remove(id);
  }
}