export { mutationResponseScheme, type MutationResponse, type HttpInstance, type HttpRequestOptions } from './api';
export { httpInstance } from './api/ky';
export {
  HttpError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  InternalServerError,
  HttpTimeoutError,
} from './api/errors';
export type { BaseService } from './api/service';
