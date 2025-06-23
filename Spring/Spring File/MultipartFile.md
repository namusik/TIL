# MultipartFile

## 정의
- package org.springframework.web.multipart;
- 스프링 프레임워크가 서버 측에서 HTTP `multipart/form-data `요청의 파일 부분을 쉽게 다룰 수 있도록 제공하는 인터페이스
- 클라이언트가 HTTP 표준인 multipart/form-data 명세에 맞게 요청 본문을 구성하여 보내면, 스프링 MVC는 이를 해석하여 컨트롤러의 MultipartFile 타입 파라미터에 바인딩

## 요청
- Apache HttpClient 라이브러리를 사용하는 것이 가장 편리하고 일반적