# spring exception 관련 설정들

```properties
server.error.whitelabel.enabled=true
```

- 스프링 부트가 제공하는 기본 예외 페이지 사용할지 말지
- 오류 처리 화면 못 찾을 시, 스프링 whitelabel 오류 페이지 적용

```properties
server.error.include-exception=true  // true or false
server.error.include-message=always 
server.error.include-stacktrace=on_param
server.error.include-binding-errors=on_param
```
- `BasicErrorController`에서 오류 정보를 model에 포함시킬지 여부 설정
- never : 사용하지 않음.
- always : 항상 사용
- on_param : 파라미터가 있을 때 사용

```properties
server.error.path=/error
```

- 오류 응답을 처리할 핸들러 path. 디폴트값이 /error이다.