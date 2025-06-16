import { ErrorRequestHandler } from 'express';
import { env } from '../configs/envConfig';
import AppError from '../app/errors/AppError';

interface TErrorResponse {
  success: false;
  message: string;
  errorSources: Array<{
    path: string | number;
    message: string;
  }>;
  stack?: string;
}

const globalErrorHandler: ErrorRequestHandler = (err, req, res, next) => {
  // Default values
  let statusCode = 500;
  let message = 'Something went wrong!';
  let errorSources: TErrorResponse['errorSources'] = [
    {
      path: '',
      message: 'Something went wrong',
    },
  ];

  // Handle AppError
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    errorSources = [
      {
        path: '',
        message: err.message,
      },
    ];
  }
  // Handle Mongoose validation errors
  else if (err?.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation Error';
    errorSources = Object.values(err.errors).map((val: any) => ({
      path: val?.path,
      message: val?.message,
    }));
  }
  // Handle Mongoose CastError
  else if (err?.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid ID';
    errorSources = [
      {
        path: err?.path,
        message: err?.message,
      },
    ];
  }
  // Handle duplicate key error
  else if (err?.code === 11000) {
    statusCode = 400;
    message = 'Duplicate Entry';
    const match = err.message.match(/"([^"]*)"/);
    const extractedMessage = match && match[1];
    errorSources = [
      {
        path: '',
        message: `${extractedMessage} already exists`,
      },
    ];
  }
  // Handle generic errors
  else if (err instanceof Error) {
    message = err.message;
    errorSources = [
      {
        path: '',
        message: err.message,
      },
    ];
  }

  // Return error response
  const errorResponse: TErrorResponse = {
    success: false,
    message,
    errorSources,
  };

  // Add stack trace in development
  if (env.NODE_ENV === 'development') {
    errorResponse.stack = err?.stack;
  }

  res.status(statusCode).json(errorResponse);
};

export default globalErrorHandler;
