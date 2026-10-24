import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Request, Response } from 'express';

export interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  timestamp: string;
  path: string;
  data: T;
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T> | T>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T> | T> {
    // Pass through non-HTTP requests (e.g. GraphQL)
    if (context.getType() !== 'http') {
      return next.handle();
    }

    const ctx = context.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    return next.handle().pipe(
      map((data) => ({
        success: true,
        statusCode: response.statusCode,
        timestamp: new Date().toISOString(),
        path: request.url,
        data,
      })),
    );
  }
}
