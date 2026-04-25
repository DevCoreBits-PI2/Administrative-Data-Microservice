
import { Catch, RpcExceptionFilter, ArgumentsHost, UnauthorizedException, ExceptionFilter } from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { RpcException } from '@nestjs/microservices';

@Catch(RpcException)
export class RpcCustomExceptionFilter implements ExceptionFilter {

  catch(exception: RpcException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    
    const rpcError = exception.getError();

    if( rpcError.toString().includes('Empty response')){
      return response.status(500).json({
        status: 500,
        message: rpcError.toString().substring(0, rpcError.toString().indexOf('(')-1)
      })
    }
    
    if(typeof rpcError === 'object' && 'status' in rpcError && 'message' in rpcError){
      let status = Number(rpcError.status) || 400;
      let message = rpcError.message;

      if (typeof message === 'object' && message !== null) {
        const driverMessage = message as {
          name?: string;
          cause?: {
            originalCode?: string;
            code?: string;
            originalMessage?: string;
            message?: string;
          };
        };

        const originalCode = driverMessage.cause?.originalCode ?? driverMessage.cause?.code;
        const originalMessage = driverMessage.cause?.originalMessage ?? driverMessage.cause?.message ?? '';

        if (driverMessage.name === 'DriverAdapterError') {
          if (originalCode === '23514' && originalMessage.includes('areas_name_check')) {
            message = 'The area name does not match the allowed format';
            status = 400;
          } else if (originalCode === '23505') {
            message = 'A record with that value already exists';
            status = 409;
          } else if (originalCode === '23503') {
            message = 'The operation references a record that does not exist';
            status = 400;
          } else {
            message = originalMessage || 'Database error';
          }
        }
      } else if (typeof message === 'string') {
        if (message.includes('Unique constraint failed')) {
          message = 'A record with that value already exists';
          status = 409;
        }
      }

      return response.status(status).json({
        ...rpcError,
        status,
        message,
      });
    }

    response.status(400).json({
      status: 400,
      message: rpcError
    })
  }
}
