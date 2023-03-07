import { IsOptional, IsString, MinLength,  } from "class-validator";


export class MessageFromClientDto {
    @IsString()
    @MinLength(1)
    message: string

    @IsOptional()
    id: string

}