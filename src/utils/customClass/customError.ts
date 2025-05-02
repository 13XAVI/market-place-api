class CustomError extends Error {
  statusCode: number;
  constructor(statusCode: number, message: string) {
    super(message);
    this.message = message;
    this.name = this.constructor.name;
    this.statusCode = statusCode;
  }
}

Object.setPrototypeOf(this, CustomError.prototype);
export { CustomError };
