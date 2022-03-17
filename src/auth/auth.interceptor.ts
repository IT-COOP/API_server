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
    const req = context.getArgByIndex(0);
    const novelAccessTokenBearer = req.user.authorization;
    if (novelAccessTokenBearer) {
      return next.handle().pipe(
        map((data) => {
          data.authorization = novelAccessTokenBearer;
        }),
      );
    }
    return;
  }
}
// data : {post: ~~,
//         userInfo
//         authorization}
// req에 user property로 있다.
// userInfo: existUser,
// authorization: `Bearer ${novelAccessToken}`,

// https://velog.io/@hahaha/NestJS-Execution-context
