import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { Request, Response } from "express";

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const isHttpException = exception instanceof HttpException;
    const status = isHttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse = isHttpException
      ? exception.getResponse()
      : { message: "Internal server error" };

    const message =
      typeof exceptionResponse === "string"
        ? exceptionResponse
        : Array.isArray((exceptionResponse as { message?: unknown }).message)
          ? (exceptionResponse as { message: unknown[] }).message.join(", ")
          : ((exceptionResponse as { message?: string }).message ??
            "Internal server error");

    response.status(status).json({
      errorCode: status >= 400 ? 1 : 0,
      message,
      data: {
        path: request.url,
      },
    });
  }
}
