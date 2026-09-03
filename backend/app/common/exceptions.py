from fastapi import HTTPException, status

class AppException(HTTPException):
    def __init__(self, code: str, message: str, status_code: int = status.HTTP_400_BAD_REQUEST):
        super().__init__(status_code=status_code, detail={"code": code, "message": message})
        self.code = code
        self.message = message

class NotFoundException(AppException):
    def __init__(self, resource: str = "Resource", message: str = None):
        code = f"{resource.upper().replace(' ', '_')}_NOT_FOUND"
        msg = message or f"{resource} was not found."
        super().__init__(code=code, message=msg, status_code=status.HTTP_404_NOT_FOUND)

class UnauthorizedException(AppException):
    def __init__(self, message: str = "Invalid or missing authentication credentials."):
        super().__init__(code="UNAUTHORIZED", message=message, status_code=status.HTTP_401_UNAUTHORIZED)

class ValidationException(AppException):
    def __init__(self, message: str = "Request validation failed."):
        super().__init__(code="VALIDATION_ERROR", message=message, status_code=status.HTTP_422_UNPROCESSABLE_ENTITY)
