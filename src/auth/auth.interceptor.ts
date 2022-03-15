import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class ExcludeNullInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const [req] = context.getArgs();
    const { userInfo, authorization } = req.user;
    return next.handle().pipe(
      map((data) => {
        data.userInfo = userInfo;
        data.authorization = authorization;
      }),
    );
  }
}
// req에 user property로 있다.
// userInfo: existUser,
// authorization: `Bearer ${novelAccessToken}`,

// https://velog.io/@hahaha/NestJS-Execution-context
