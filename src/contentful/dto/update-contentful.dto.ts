import { PartialType } from '@nestjs/mapped-types';
import { CreateContentfulDto } from './create-contentful.dto';

export class UpdateContentfulDto extends PartialType(CreateContentfulDto) {}
