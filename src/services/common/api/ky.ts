import { API_URL } from 'constants/env';
import ky, { HTTPError, TimeoutError } from 'ky';
import type { HttpInstance, HttpRequestOptions } from './common.types';
import { createHttpError, HttpTimeoutError } from './errors';

export const KyInstance = ky.create({
  prefixUrl: API_URL,
  hooks: {
    beforeRequest: [
      request => {
        console.log('URL: ', request.url, 'Timestamp: ', new Date().toISOString());
      },
    ],
  },
});

function toKyOptions(options?: HttpRequestOptions) {
  return {
    json: options?.json,
    searchParams: options?.searchParams,
    headers: options?.headers,
    signal: options?.signal,
    timeout: options?.timeout,
    retry: options?.retry,
    credentials: options?.credentials,
  };
}

async function handleError(error: unknown): Promise<never> {
  if (error instanceof HTTPError) {
    const data = (await error.response.json()) as { message: string };
    throw createHttpError(error.response.status, data.message ?? error.message);
  }
  if (error instanceof TimeoutError) {
    throw new HttpTimeoutError();
  }
  throw error;
}

export const httpInstance: HttpInstance = {
  get: <T>(url: string, options?: HttpRequestOptions) =>
    KyInstance.get(url, toKyOptions(options)).json<T>().catch(handleError),
  post: <T>(url: string, options?: HttpRequestOptions) =>
    KyInstance.post(url, toKyOptions(options)).json<T>().catch(handleError),
  put: <T>(url: string, options?: HttpRequestOptions) =>
    KyInstance.put(url, toKyOptions(options)).json<T>().catch(handleError),
  patch: <T>(url: string, options?: HttpRequestOptions) =>
    KyInstance.patch(url, toKyOptions(options)).json<T>().catch(handleError),
  delete: <T>(url: string, options?: HttpRequestOptions) =>
    KyInstance.delete(url, toKyOptions(options)).json<T>().catch(handleError),
};
