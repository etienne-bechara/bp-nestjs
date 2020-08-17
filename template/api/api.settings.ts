import { IsNotEmpty, IsString, IsUrl } from 'class-validator';

export class _Pascal_Settings {

  /* Environment Variables */

  @IsUrl()
  public _Constant__HOST: string;

  @IsString() @IsNotEmpty()
  public _Constant__API_KEY: string;

  /* Provider Options */

}
