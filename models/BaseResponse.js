class BaseResponse {
  constructor(success = false, message = '', data = null, error = null) {
    this.success = success;
    this.message = message;
    this.data = data;
    if (error) {
      this.error = error;
    }
  }

  static success(message, data = null) {
    return new BaseResponse(true, message, data);
  }

  static error(message, error = null) {
    return new BaseResponse(false, message, null, error);
  }
}

module.exports = BaseResponse;
