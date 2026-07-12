export class APIError extends Error {
  public statusCode: number;
  public errorCode: string;
  public details?: any;

  constructor(statusCode: number, errorCode: string, message: string, details?: any) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.details = details;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class BadRequestError extends APIError {
  constructor(message: string, details?: any, errorCode = 'BAD_REQUEST') {
    super(400, errorCode, message, details);
  }
}

export class UnauthorizedError extends APIError {
  constructor(message = 'Unauthorized access', errorCode = 'UNAUTHORIZED') {
    super(401, errorCode, message);
  }
}

export class ForbiddenError extends APIError {
  constructor(message = 'Access forbidden', errorCode = 'FORBIDDEN') {
    super(403, errorCode, message);
  }
}

export class NotFoundError extends APIError {
  constructor(message: string, errorCode = 'NOT_FOUND') {
    super(404, errorCode, message);
  }
}

export class ConflictError extends APIError {
  constructor(message: string, errorCode = 'CONFLICT') {
    super(409, errorCode, message);
  }
}

export class ValidationError extends APIError {
  constructor(message: string, details: any) {
    super(422, 'VALIDATION_FAILED', message, details);
  }
}
