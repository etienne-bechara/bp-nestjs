import { Controller } from '@nestjs/common';

import { AbstractController } from '../core/abstract/abstract.controller';
import { __PascalCaseName__CreateDto, __PascalCaseName__ReadDto, __PascalCaseName__UpdateDto } from './__DotCaseName__.dto';
import { __PascalCaseName__Entity } from './__DotCaseName__.entity';
import { __PascalCaseName__Service } from './__DotCaseName__.service';

@Controller('__PathCaseName__')
export class __PascalCaseName__Controller extends AbstractController<__PascalCaseName__Entity> {

  /** */
  public constructor(private readonly __SnakeCaseName__Service: __PascalCaseName__Service) {
    super(__SnakeCaseName__Service, {
      dto: {
        read: __PascalCaseName__ReadDto,
        create: __PascalCaseName__CreateDto,
        update: __PascalCaseName__UpdateDto,
      },
    });
  }
  
}
