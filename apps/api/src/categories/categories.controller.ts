import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post, Put } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from '../access/access.decorators';
import { CategoriesService } from './categories.service';

@ApiTags('categories')
@ApiBearerAuth()
@Roles('ADMIN')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly service: CategoriesService) {}
  @Get() list() { return this.service.list(); }
  @Post() create(@Body() body: { title: string; description?: string; color?: string }) { return this.service.create(body); }
  @Put(':id') update(@Param('id', ParseUUIDPipe) id: string, @Body() body: { title?: string; description?: string; color?: string }) { return this.service.update(id, body); }
  @Delete(':id') remove(@Param('id', ParseUUIDPipe) id: string) { return this.service.remove(id); }
}
