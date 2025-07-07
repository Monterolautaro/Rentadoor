import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { UserRepository } from "./user.repository";



@Injectable()
export class UserService {
    constructor(private readonly userRepository: UserRepository) { }

    async getUserByEmail(email: any) {
        if (!email) throw new BadRequestException('email is required');

        const user = this.userRepository.getUserByEmail(email);

        if (!user) throw new NotFoundException('User not found');

        return user;
    }
}