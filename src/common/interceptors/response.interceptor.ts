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
  { errorCode: number; message: string; data: T }
> {
  intercept(
    _context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<{ errorCode: number; message: string; data: T }> {
    return next.handle().pipe(
      map((data) => ({
        errorCode: 0,
        message: "OK",
        data,
      })),
    );
  }
}
