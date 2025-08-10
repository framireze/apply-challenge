import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { ApiOkResponse, ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('jwt')
  @ApiOperation({ 
    summary: 'Authenticate user and get JWT token',
    description: 'Login to receive JWT token for accessing private endpoints'
  })
  @ApiOkResponse({
    description: 'JWT token generated successfully',
    schema: {
      type: 'object',
      properties: {
        token: {
          type: 'string',
          description: 'JWT token for authentication',
          example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImRlbW8tdXNlciIsImlhdCI6MTc1NDc3NjY4MSwiZXhwIjoxNzU0NzgwMjgxfQ.AAB0mn7cbKLEHNcp4FoQZnAhE1A4QMeIDhNN74DN2dI'
        }
      },
      example: {
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImRlbW8tdXNlciIsImlhdCI6MTc1NDc3NjY4MSwiZXhwIjoxNzU0NzgwMjgxfQ.AAB0mn7cbKLEHNcp4FoQZnAhE1A4QMeIDhNN74DN2dI'
      }
    }
  })
  getJwtToken() {
    return this.authService.getJwtToken();
  }
}
