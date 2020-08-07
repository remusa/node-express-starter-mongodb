class ErrorResponse extends Error {
  constructor(message: string, statusCode: number, errors: string[] = []) {
    super(message)
    // @ts-ignore
    this.status = statusCode
    // @ts-ignore
    this.errors = errors
  }
}

export default ErrorResponse
