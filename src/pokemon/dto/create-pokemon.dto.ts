import { IsString,IsInstance, IsInt, isPositive, IsPositive, Min, MinLength  } from "class-validator";

export class CreatePokemonDto {

    @IsString()
    @MinLength(1)
    name: string;

    @IsInt()
    @IsPositive()
    @Min(1)
    no: number;
}
