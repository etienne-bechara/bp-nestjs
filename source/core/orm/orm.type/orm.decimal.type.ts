import { Type } from '@mikro-orm/core';
import { InternalServerErrorException } from '@nestjs/common';

export class OrmDecimalType extends Type {

  /**
   * Fixes decimal type incorrectly returning as string
   * instead of number when reading from database.
   * @param value
   */
  // eslint-disable-next-line @typescript-eslint/naming-convention
  public convertToJSValue(value: any): any {

    if (!value) {
      return null;
    }
    else if (
      ![ 'string', 'number' ].includes(typeof value)
      || !value.toString().match(/^[\d.]+$/g)
    ) {
      throw new InternalServerErrorException({
        message: 'invalid decimal type',
        value,
      });
    }

    return Number.parseFloat(value.toString());
  }

}
