import { UseInterceptors, NestInterceptor, ExecutionContext, CallHandler, Logger, ForbiddenException, createParamDecorator } from "@nestjs/common";
import { Observable } from "rxjs";

interface AuthCheckerInterface {
    checkSelfScope: boolean, 
    roleNeeded?: string 
}

// Here we wrap our Interceptor into a CUSTOM DECORATOR so it is "cleaner"
export function AuthChecker(opts: AuthCheckerInterface){
    return UseInterceptors(new AuthInterceptor(opts));
}

export class AuthInterceptor implements NestInterceptor {
    private logger = new Logger('AuthInterceptor');
    constructor(private opts: AuthCheckerInterface) {}

    // this intercept acts likes a middleware, either we run the code before the request
    // reaches the route handler or we run it prior sending the outgoing response
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        // here we already find the user object attached to the req object, this is done by the JWT strategy
        const req = context.switchToHttp().getRequest();
        const user = req.user;
        
        if (user.role !== 'administrator') {
            if (this.opts.checkSelfScope){
                this.logger.log('Checking self scope');
                const userId = req?.body?.userId || req?.params?.id || req?.body?.trainerId || null;
                if ( userId !== null && userId !== user.userId) {
                    this.logger.log(`self scope failed`);
                    throw new ForbiddenException(`Insufficient permissions`);
                }
            }
            
            if (this.opts?.roleNeeded && (this.opts.roleNeeded !== req?.user?.role)) {
                this.logger.log(`User role has insufficient permissions`);
                throw new ForbiddenException(`Insufficient permissions`);
            }
        }

        // code inside next.handle is executed after the controller logic has been run
        return next.handle()
    }
}

export const GetUser = createParamDecorator(
    (data: unknown, ctx: ExecutionContext) => {
        const req = ctx.switchToHttp().getRequest();
        return req.user;
    },
);