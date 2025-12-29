import { Injectable } from '@nestjs/common';
import { LoginUserDto, RegisterUserDto } from './dto';
import { RpcException } from '@nestjs/microservices';
import { Repository } from 'typeorm';
import { User } from './entities';
import { InjectRepository } from '@nestjs/typeorm';

import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { envs } from 'src/config';

@Injectable()
export class AuthService {

  constructor(
    @InjectRepository(User)
    private readonly userRepository:Repository<User>,

    private readonly jwtService: JwtService
  ){}


  async signJWT(payload: JwtPayload){
    return this.jwtService.sign(payload);
  }

  async registerUser( registerUserDto:RegisterUserDto){

    const { email, name, password } = registerUserDto;

    try{

      const user = await this.userRepository.findOneBy({ email });

      if (user){
        throw new RpcException({
          message: 'User already exists',
          status:400
        });
      }

      const newUser = this.userRepository.create({
        email,
        name,
        password: bcrypt.hashSync( password, 10 )
      });

      await this.userRepository.save( newUser );

      const { password: _, ...userWithoutPassword } = newUser;

      return {
        user: userWithoutPassword,
        token: await this.signJWT( userWithoutPassword )
      };

    }catch(error){
      throw new RpcException({
        message: error.message,
        status:400
      })
    }
  }


  async loginUser( loginUserDto:LoginUserDto){

    const { email, password } = loginUserDto;

    try{

      const user = await this.userRepository.findOneBy({ email });

      if (!user){
        throw new RpcException({
          message: 'User / password incorrect',
          status:400
        });
      }

      const isPasswordValid = bcrypt.compareSync( password, user.password );

      if (!isPasswordValid){
        throw new RpcException({
          message: 'User / password incorrect',
          status:400
        });
      }

      const { password: _, ...userWithoutPassword } = user;

      return {
        user: userWithoutPassword,
        token: await this.signJWT( userWithoutPassword )
      };

    }catch(error){
      throw new RpcException({
        message: error.message,
        status:400
      })
    }
  }

  
  async verifyToken(token:string){
    try{
      const { sub, iat, exp, ...user } = this.jwtService.verify(token, {
        secret: envs.jwtSecret,
      });

      return {
        user: user, 
        token: await this.signJWT( user )
      }

    }catch(error){

      console.log(error);

      throw new RpcException({
        message: 'Invalid token',
        status:401
      })
    }
  }

}
