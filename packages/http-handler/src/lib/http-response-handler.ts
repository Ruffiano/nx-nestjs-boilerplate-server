// packages/http-handler/src/lib/http-handler.ts
import { ExceptionFilter, Catch, ArgumentsHost, HttpStatus, HttpException } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import HttpErrorTypes from './httpErrorTypes';
import { HttpResponse } from './httpResponse';

@Catch()
export class HttpExceptionHandler implements ExceptionFilter {
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}
  catch(exception: any, host: ArgumentsHost) {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();
    let status: number;
    let errorResponse: { status: { code: number; message: string; }; details: any; };
    try {
        if (exception instanceof HttpErrorTypes) {
          status = exception.statusCode;
          errorResponse = {
            status: {
              code: exception.code,
              message: exception.message,
            },
            details: exception.details,
          };
        } else if (exception instanceof HttpException) {
          status = exception.getStatus();
          const response = exception.getResponse();
          errorResponse = {
            status: {
              code: status,
              message: exception.message,
            },
            details: response,
          };
        } else {
          if(exception.status) {
            errorResponse = {
              status: {
                code: exception.status.code,
                message: exception.status.message,
              },
              details: exception.details,
            };
          } else {
            status = HttpStatus.BAD_REQUEST;
            const grpcDirectThrowError = new HttpErrorTypes(exception.code, exception.details, status);
            errorResponse = HttpResponse.getFailureResponse(grpcDirectThrowError);
          }
        }

    } catch (error) {
        status = HttpStatus.INTERNAL_SERVER_ERROR;
        const unknownError = new HttpErrorTypes(1001, 'UNKNOWN_ERROR', status);
        errorResponse = HttpResponse.getFailureResponse(unknownError);
    }

    httpAdapter.reply(ctx.getResponse(), errorResponse, status || exception.status.statusCode);
  }
}
