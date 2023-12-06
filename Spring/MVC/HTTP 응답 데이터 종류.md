# HTTP 응답 데이터 설정 종류

# 단순 텍스트 응답

response.getWriter().write("ok");

# HTML 만들어서 응답 

~~~java
resp.setContentType("text/html");
resp.setCharacterEncoding("utf-8");
~~~
위 설정이 필요함. 

response.getwriter().println(html 코드)

# JSON 응답

메시지 바디에 JSON을 담아 응답한다. 

~~~java
Map<String, Object> errorResult = new HashMap<>();
errorResult.put("ex", ex.getClass());
errorResult.put("message", ex.getMessage());

String result = objectMapper.writeValueAsString(errorResult);
response.setContentType("application/json");
response.setCharacterEncoding("utf-8");
response.getWriter().write(result);
~~~
- contentType이 application/json 이어야 함.

- 객체를 만들어서 objectMapper를 통해 string으로 만들어줘야 함.

# ResponseEntity 응답
```java
return new ResponseEntity<>(result, HttpStatus.valueOf(statusCode));Q
```

- 클라이언트에 JSON 반환