# 자바에서의 Session

## Httpsession

    둘 이상의 page request에서 사용자를 식별하거나, 웹 사이트를 방문하고 해당 사용자에 대한 정보를 Server에 저장.

    Servlet은 HTTP 클라이언트와 서바 사이에 세션을 생성.

    세션은 한 명의 사용자에 해당.

#### 관련 메서드

```java
HttpSession session = request.getSession(true);
    이미 세션이 있으면 그 세션을 return하고, 세션이 없으면 새로운 세션을 생성

HttpSsession session = request.getSession(false)
    이미 세션이 있으면, 그 세션을 return하고, 세션이 없으면 null 반환

sessoin.setAttribute("key", value)
    객체를 세션에 key-value로 저장
    value는 Object 타입으로 저장

session.getAttribute("key")
    "key"로 바인딩된 객체를 return. 없으면 null return

    value는 Object 타입으로 저장되었기에 다운캐스팅을 해줘야 함

session.getId()
    session 객체에 저장된 session Id 반환
```

## session 확인 플로우

1. client가 server에 요청을 보냄.
2. server는 request 헤더의 session cookie를 통해 session-id를 확인
3. session-id가 존재하면, server를 유효성 검사를 한 후, 요청을 처리하여 응답을 보냄
4. session-id가 없으면, server는 set-cookie를 통해 session-id를 생성. reponse 헤더에 추가해서 반환
   1. client는 받은 session-id를 다음 request부터 헤더에 넣어서 요청보냄

## session 종료 시기
1. 타임아웃
   1. web.xml에 session 지속시간 설정 가능. 분단위
    ```
    <session-config>
       <session-timeout>10</session-timeout>
    </session-config>
    ```
2. session.invalidate()
   1. 세션 종료 메서드
3. 애플리케이션 혹은 서버 종료 시

## 참고 

https://lindarex.github.io/concepts/java-httpsession-introduction/