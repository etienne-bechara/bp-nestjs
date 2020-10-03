import { IsNotEmpty, IsString, IsUrl } from 'class-validator';

export class PascalCaseConfig {

  /* Environment Variables */
  @IsUrl()
  public readonly UPPER_CASE_HOST: string;

  @IsString() @IsNotEmpty()
  public readonly UPPER_CASE_API_KEY: string;

}
