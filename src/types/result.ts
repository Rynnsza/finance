export type Result<T> = { data: T; error: null } | { data: null; error: AppError }

export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public original?: unknown,
  ) {
    super(message)
    this.name = 'AppError'
  }
}
