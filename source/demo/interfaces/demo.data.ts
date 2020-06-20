import { IsDefined, IsNumber, IsString, Length } from 'class-validator';

export class DemoData {

  @IsNumber()
  public userId: number;

  @IsDefined()
  @IsString()
  public title: string;

  @IsString()
  @Length(10)
  public body: string;

}
