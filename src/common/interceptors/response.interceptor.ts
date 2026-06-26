import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from "@nestjs/common";
import { map, Observable } from "rxjs";

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<
  T,
  { errorCode: 0; data: T }
> {
  intercept(
    _context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<{ errorCode: 0; data: T }> {
    return next.handle().pipe(
      map((data) => ({
        errorCode: 0 as const,
        data,
      })),
    );
  }
}
