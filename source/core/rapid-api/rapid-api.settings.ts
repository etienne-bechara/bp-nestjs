import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class RapidApiSettings {

  /* Environment Variables */

  @IsOptional()
  @IsString() @IsNotEmpty()
  public RAPID_API_KEY: string;

  /* Provider Options */

  public RAPID_API_HOST: string = 'https://:app_name.p.rapidapi.com';

}
