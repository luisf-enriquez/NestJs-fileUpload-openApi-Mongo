import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

// these are the claims we sign during the login
interface JwtPayload {
    name: string,
    email: string,
    role: string,
    userId: string
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        config: ConfigService, 
        private authService: AuthService
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: config.get<string>('jwt.secret')
        })
    }

    // The JWT strategy under the hoodie will decode the token , verify it and if it is a good one
    // will attach the user to the req.user object
    async validate(payload: JwtPayload){
        const { userId } = payload;
        const user = await this.authService.getUserById(userId);
        if (!user) throw new UnauthorizedException('Unauthorized');
        return payload; // we attach this to the req.user object
    }
}