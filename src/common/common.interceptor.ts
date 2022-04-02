import { Request } from 'express';
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req: Request = context.getArgByIndex(0);
    const now = new Date();
    console.log(
      `Method: ${req.method}, Url: ${
        req.hostname + req.originalUrl
      }, Time : ${now.toLocaleString()}`,
    );
    return next
      .handle()
      .pipe(
        tap(() =>
          console.log(
            `${req.hostname + req.originalUrl} took ${
              Date.now() - now.getTime()
            }ms`,
          ),
        ),
      );
  }
}
