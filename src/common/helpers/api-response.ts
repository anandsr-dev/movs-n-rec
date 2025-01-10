export class ApiResponse<T> {
    success: boolean;
    message: string;
    data: T | null;
  
    constructor(success: boolean, message: string, data: T | null = null) {
      this.success = success;
      this.message = message;
      this.data = data;
    }
  
    static success<T>(message: string, data: T): ApiResponse<T> {
      return new ApiResponse<T>(true, message, data);
    }
  
    static error(message: string): ApiResponse<null> {
      return new ApiResponse<null>(false, message, null);
    }
  }