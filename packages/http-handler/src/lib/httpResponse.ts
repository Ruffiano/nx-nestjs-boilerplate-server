type IhttpResponse<T> = {
  status: {
    code: number,
    message: string,
    statusCode?: number
  },
  details: T
}

export class HttpResponse {
  static getSuccessResponse<T>(details: T, message?: string, code?: number): IhttpResponse<T> {
    return {
      status: {
        code: code || 2000,
        message: message || 'SUCCESS',
      },
      details,
    };
  }

  static getFailureResponse(apiError: { code: number; message: any, statusCode: number }, error?: any): IhttpResponse<null> {
    return {
      status: {
        code: apiError.code,
        message: apiError.message,
        statusCode: apiError.statusCode,
      },
      details: error? error : undefined
    };
  }
}
