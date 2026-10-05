import type { ApiErrorCode } from './types/technology.js'

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: ApiErrorCode,
    message: string,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export function errorPayload(code: ApiErrorCode, message: string) {
  return { error: { code, message } }
}
