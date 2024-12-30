class HttpErrorTypes extends Error {
    // COMMON
    static INVALID_PARAMETERS = new HttpErrorTypes(1000, 'INVALID_PARAMETERS', 400);
    static UNKNOWN_ERROR = new HttpErrorTypes(1001, 'UNKNOWN_ERROR', 500);
    static NOT_EXIST = new HttpErrorTypes(1002, 'NOT_EXIST', 404);
    static INVALID_DATA = new HttpErrorTypes(1003, 'INVALID_DATA', 422);
    static INVALID_REQUEST = new HttpErrorTypes(1004, 'INVALID_REQUEST', 400);
    static INTERNAL_SERVER_ERROR = new HttpErrorTypes(1005, 'INTERNAL_SERVER_ERROR', 500);
  
    // USER
    static USER_NOT_FOUND = new HttpErrorTypes(3000, 'USER_NOT_FOUND', 404);
    static USER_ALREADY_EXISTS = new HttpErrorTypes(3001, 'USER_ALREADY_EXISTS', 409);
    static USER_INVALID_CREDENTIALS = new HttpErrorTypes(3002, 'USER_INVALID_CREDENTIALS', 401);
    static USER_INVALID_PASSWORD = new HttpErrorTypes(3004, 'USER_INVALID_PASSWORD', 401);
    static USER_INVALID_EMAIL = new HttpErrorTypes(3005, 'USER_INVALID_EMAIL', 400);
    static USER_INVALID_USERNAME = new HttpErrorTypes(3006, 'USER_INVALID_USERNAME', 400);
    static USER_INVALID_ROLE = new HttpErrorTypes(3009, 'USER_INVALID_ROLE', 400);
    static USER_INVALID_STATUS = new HttpErrorTypes(3010, 'USER_INVALID_STATUS', 400);
    static USER_NOT_FOUND_BY_EMAIL = new HttpErrorTypes(3011, 'USER_NOT_FOUND_BY_EMAIL', 404);
    static USER_NOT_IDENTIFIED = new HttpErrorTypes(3012, 'USER_NOT_IDENTIFIED', 401);
    static USER_BLOCKED = new HttpErrorTypes(3013, 'USER_BLOCKED', 401);
    static USER_NOT_VERIFIED = new HttpErrorTypes(3014, 'USER_NOT_VERIFIED', 401);
    static WALLET_NOT_FOUND = new HttpErrorTypes(3015, 'WALLET_NOT_FOUND', 404);
    static PASSWORD_VALIDATION_FAILED = new HttpErrorTypes(3016, 'PASSWORD_VALIDATION_FAILED', 400);
    static EMAIL_VALIDATION_FAILED = new HttpErrorTypes(3017, 'EMAIL_VALIDATION_FAILED', 400);
    static PROFILE_NOT_FOUND = new HttpErrorTypes(3018, 'PROFILE_NOT_FOUND', 404);

    // AUTH TOKEN
    static AUTH_TOKEN_INVALID = new HttpErrorTypes(4000, 'AUTH_TOKEN_INVALID', 401);
    static AUTH_TOKEN_EXPIRED = new HttpErrorTypes(4001, 'AUTH_TOKEN_EXPIRED', 401);
    static AUTH_TOKEN_NOT_FOUND = new HttpErrorTypes(4002, 'AUTH_TOKEN_NOT_FOUND', 401);
    static AUTH_TOKEN_ALREADY_EXISTS = new HttpErrorTypes(4003, 'AUTH_TOKEN_ALREADY_EXISTS', 409);
    static AUTH_TOKEN_SIGNATURE_INVALID = new HttpErrorTypes(4004, 'AUTH_TOKEN_SIGNATURE_INVALID', 401);
    static AUTH_TOKEN_BLACKLISTED = new HttpErrorTypes(4005, 'AUTH_TOKEN_BLACKLISTED', 401);
    static AUTH_USER_NOT_VERIFIED = new HttpErrorTypes(4006, 'AUTH_USER_NOT_VERIFIED', 401);

    // OTP
    static AUTH_OTP_INVALID = new HttpErrorTypes(4100, 'AUTH_OTP_INVALID', 401);
    static AUTH_OTP_EXPIRED = new HttpErrorTypes(4101, 'AUTH_OTP_EXPIRED', 401);
    static AUTH_OTP_NOT_FOUND = new HttpErrorTypes(4102, 'AUTH_OTP_NOT_FOUND', 404);



    // API KET
    static API_KEY_INVALID = new HttpErrorTypes(5000, 'API_KEY_INVALID', 401);
    static API_KEY_NOT_FOUND = new HttpErrorTypes(5001, 'API_KEY_NOT_FOUND', 404);
    static API_KEY_BLACKLISTED = new HttpErrorTypes(5002, 'API_KEY_BLACKLISTED', 401);
    static API_KEY_PERMISSION_DENIED = new HttpErrorTypes(5003, 'API_KEY_PERMISSION_DENIED', 401);
    static API_KEY_EXPIRED = new HttpErrorTypes(5004, 'API_KEY_EXPIRED', 401);
    static API_KEY_ALREADY_EXISTS = new HttpErrorTypes(5005, 'API_KEY_ALREADY_EXISTS', 409);

    code: number;
    statusCode: number;
    details: any;
  
    constructor(code: number, message: string, statusCode: number, details: any = {}) {
      super(message);
      this.code = code;
      this.statusCode = statusCode;
      this.details = details;
      Error.captureStackTrace(this, this.constructor);
    }
  
    toString() {
      return `ApiError : ${this.message}`;
    }
  }
  
  export default HttpErrorTypes;
