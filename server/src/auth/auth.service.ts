import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
    ) { }

    async validateUser(staticId: string, pass: string): Promise<any> {
        const user = await this.usersService.findOne({ staticId });
        if (user && await bcrypt.compare(pass, user.password)) {
            const { password, ...result } = user;
            return result;
        }
        return null;
    }

    async login(user: any) {
        const payload = {
            username: user.nickname,
            sub: user.id,
            role: user.role,
            staticId: user.staticId
        };
        return {
            access_token: this.jwtService.sign(payload),
        };
    }

    async register(user: any) {
        // Default values for new registration
        // Note: Default rank should exist (ID 1). Department is optional on reg.
        const userData = {
            ...user,
            rankId: 1, // Default Rank: Cadet (ID 1)
            role: 'USER', // Default Role
            // departmentId: 1 // Could be default if we seed it
        };
        return this.usersService.createUser(userData);
    }
}
