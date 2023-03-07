import { UseInterceptors, NestInterceptor, ExecutionContext, CallHandler, Logger } from "@nestjs/common";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { plainToInstance } from "class-transformer";

// Here we wrap our Interceptor into a CUSTOM DECORATOR so it is "cleaner"
export const Serialize = (dto: any) => {
    return UseInterceptors(new SerializeInterceptor(dto));
}

export class SerializeInterceptor implements NestInterceptor {

    private logger = new Logger('SerializeInterceptor');
    constructor(private dynamicDto: any) {}

    // this intercept acts likes a middleware, either we run the code before the request
    // reaches the route handler or we run it prior sending the outgoing response
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        // console.log('Running before the route handler');

        return next.handle().pipe(
            // data has the values returned by the controller, here we post-process them
            map((data: any) => {
                this.logger.log('SerializeInterceptor Running before sending the response');
                return plainToInstance(this.dynamicDto, data, { excludeExtraneousValues: true })
            })
        )
    }
}