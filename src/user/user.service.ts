import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './schemas/user.schema';
import * as bcrypt from 'bcrypt';
import { CreateUserDTO } from './dtos/create-user-dto';


@Injectable()
export class UserService {
    constructor(@InjectModel('User') private readonly userModel: Model<UserDocument>) { }
    
    //Create User
    async addUser(createUserDTO: CreateUserDTO): Promise<User> {
        const newUser = await this.userModel.create(createUserDTO);
        newUser.password = await bcrypt.hash(newUser.password, 10);
        return newUser.save();
      }
    //Get user by user name
      async findUser(username: string): Promise<User | undefined> {
        const user = await this.userModel.findOne({username: username});
        return user;
      }
}
