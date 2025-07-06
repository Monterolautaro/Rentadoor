import { Injectable } from "@nestjs/common";
import { AuthRepository } from "./auth.repository";

interface LoginDto {
  email: string;
  password: string;
}

@Injectable()
export class AuthService {
    constructor(private readonly authRepository: AuthRepository){}
    
    async login(loginDto: LoginDto) {
        return this.authRepository.login(loginDto);
    }
}