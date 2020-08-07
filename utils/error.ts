class ErrorResponse extends Error {
  constructor(message: string, statusCode: number) {
    super(message)
    // @ts-ignore
    this.status = statusCode
  }
}

export default ErrorResponse
