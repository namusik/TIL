# API 예외 처리

## API 응답 처리
- API는 정상이든 예외이든 JSON으로 응답이 나가줘야 함.

### 1. BasicErrorController
- API 예외 처리도 스프링부트에서 제공하는 기본 오류 방식을 사용할 수 있다.

```java
@RequestMapping
public ResponseEntity<Map<String, Object>> error(HttpServletRequest request) {
  HttpStatus status = getStatus(request);
  if (status == HttpStatus.NO_CONTENT) {
    return new ResponseEntity<>(status);
  }
  Map<String, Object> body = getErrorAttributes(request, getErrorAttributeOptions(request, MediaType.ALL));
  return new ResponseEntity<>(body, status);
}
```
- **/error** 경로로 요청이 오면 ResponseEntity로 Http Body에 JSON을 반환한다. 

### 2. @ExceptionHanlder
- API 마다, 각각의 컨트롤러나 예외마다 서로 다른 응답 결과를 출력해야 할 수 도 있음.


