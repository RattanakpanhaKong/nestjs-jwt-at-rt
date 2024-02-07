import { Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto } from './dto/auth.dto';

@Controller('auth')
export class AuthController {

    constructor(private authService: AuthService){

    }
    
    @Post('/local/signup')
    signUpLocal(dto: AuthDto): Promise<Tokens>{
        return this.authService.signUpLocal(dto)
    }

    @Post('/local/signin')
    signInLocal(): Promise<Tokens>{
        return this.authService.signInLocal()
    }

    @Post('/local/logout')
    logout(){
        return this.authService.logout()
    }
    
    @Post('/local/refresh')
    refreshTokens(){
        return this.authService.refreshTokens()
    }
    
}
