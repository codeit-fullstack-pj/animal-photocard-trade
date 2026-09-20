// 라우트/서비스에서 throw하면 error-handler가 { code, message }로 응답한다
export class ApiError extends Error {
  constructor(status, code, message) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}
