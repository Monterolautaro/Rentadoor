import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { IUser } from "./interfaces/user.interface";
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

    async getUsers(){
        return this.userRepository.getUsers();
    }

    async getUserById(id: number) {
        const user = await this.userRepository.getUserById(id);
        if (!user) throw new NotFoundException('Usuario no encontrado');
        return user;
    }

    async updateUser(id: number, update: Partial<IUser>) {
        const user = await this.userRepository.getUserById(id);
        if (!user) throw new NotFoundException('Usuario no encontrado');
        if (user.isDeleted) throw new BadRequestException('No se puede modificar un usuario eliminado');
        return this.userRepository.updateUser(id, update);
    }

    async suspendUser(id: number, suspend: boolean) {
        const user = await this.userRepository.getUserById(id);
        if (!user) throw new NotFoundException('Usuario no encontrado');
        if (user.isDeleted) throw new BadRequestException('No se puede suspender un usuario eliminado');
        return this.userRepository.suspendUser(id, suspend);
    }

    async deleteUser(id: number) {
        const user = await this.userRepository.getUserById(id);
        if (!user) throw new NotFoundException('Usuario no encontrado');
        if (user.isDeleted) throw new BadRequestException('El usuario ya está eliminado');
        return this.userRepository.deleteUser(id);
    }
}