import { Type } from '@mikro-orm/core';
import { InternalServerErrorException } from '@nestjs/common';

export class OrmJsonType extends Type {

  /**
   * Stringifies incoming value to be persisted on database.
   * @param value
   */
  public convertToDatabaseValue(value: any): any {
    if (!value) return null;

    let stringifiedValue: unknown;

    try {
      stringifiedValue = JSON.stringify(value);
    }
    catch (e) {
      throw new InternalServerErrorException(e);
    }

    return stringifiedValue;
  }

}
