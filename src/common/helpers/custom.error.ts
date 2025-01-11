export class CustomError extends Error {
    constructor(message: string, name?: string) {
      super(message);  // Pass the message to the parent Error class
      this.name = name || this.constructor.name; // Set the name property to the class name
      Error.captureStackTrace(this, this.constructor); // Optional: capture the stack trace
    }
  }