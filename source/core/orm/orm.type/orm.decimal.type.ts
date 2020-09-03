import { Type } from 'mikro-orm';

export class OrmDecimalType extends Type {

  /**
   * Fixes decimal type incorrectly returning as string
   * instead of number when reading from database.
   * @param value
   */
  public convertToJSValue(value: string | number): number {
    if (value === '0' || value === 0) return 0;
    if (!value) return null;

    const number = parseFloat(value.toString());
    return number;
  }

}
