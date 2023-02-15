import { Injectable } from '@nestjs/common';
import { BadRequestException, InternalServerErrorException, NotFoundException } from '@nestjs/common/exceptions';
import { InjectModel } from '@nestjs/mongoose/dist';
import { isValidObjectId, Model } from 'mongoose';
import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { Pokemon } from './entities/pokemon.entity';
import { PokemonController } from './pokemon.controller';

@Injectable()
export class PokemonService {

  constructor(
    @InjectModel( Pokemon.name )
    private readonly pokemonModel: Model<Pokemon>){

  }
  async create(createPokemonDto: CreatePokemonDto) {
    createPokemonDto.name = createPokemonDto.name.toLowerCase();

    try {
      const pokemon = await this.pokemonModel.create(createPokemonDto);
      return pokemon;
    } catch (error) {
      this.handleExceptions(error);
    }
    
  }

  async findAll() {
    return this.pokemonModel.find();
  }

  async findOne(id: string) {
    let pokemon: Pokemon;
    if(!isNaN(+id)){
      pokemon = await this.pokemonModel.findOne({no:id});
    }
    //Mongo ID
    if(!pokemon && isValidObjectId(pokemon)){
      pokemon = await this.pokemonModel.findOne({id});
    }
    // Name
    if(!pokemon){
      pokemon = await this.pokemonModel.findOne({name:id.toLocaleLowerCase().trim()});
    }

    if(!pokemon){
      throw new NotFoundException("Pokemon not found")
    }
    
    return pokemon;
  }

  async update(term: string, updatePokemonDto: UpdatePokemonDto) {
    const pokemon= await this.findOne(term);
    if(updatePokemonDto.name){
      updatePokemonDto.name= updatePokemonDto.name.toLocaleLowerCase();
    }
    try {
      await pokemon.updateOne(updatePokemonDto);
      return { ...pokemon.toJSON()};
    } catch (error) {
      this.handleExceptions(error);
    }
    
  }

  async remove(id: string) {
    //Forma 1
    //const pokemon= await this.findOne(id);
    //await pokemon.deleteOne();
    //Forma 2
    const {deletedCount } = await this.pokemonModel.deleteOne({id: id});
    if( deletedCount === 0 ) {
      throw new BadRequestException(`Pokemon with id ${id} was not deleted`);
    }
    return;
    
  }

  private handleExceptions(error: any) {
    if(error.code ===11000){
      throw new BadRequestException(`Pokemon exists in db ${JSON.stringify(error.keyValue)}`)
    }
    console.log(error)
    throw new InternalServerErrorException(`Can't create Pokemon - Check server logs `)
  }
}
