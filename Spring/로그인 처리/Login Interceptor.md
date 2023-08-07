# Login Interceptor

## 의의
로그인 하지 않은 사용자가 특정 URL을 요청했을 때 접근을 막기 위해.

## cross-cutting concern
여러 로직에서 공통으로 관심있는 것을 공통관심사라고 한다.

인증의 경우 여러 로직에서의 공통 관심사 라고 할 수 있다.

웹과 관려된 공통관심사는 필터나 스프링 인터셉터를 사용하는 것이 좋다.

## Spring Interceptor
[상세내용](./../Spring%20Interceptor/Spring%20Interceptor.md)

~~~java
String requestURI = request.getRequestURI();
log.info("인증 체크 인터셉터 실행 {}", requestURI);

HttpSession session = request.getSession();

if (session == null || session.getAttribute(SessionConst.LOGIN_MEMBER) == null) {
    log.info("미인증 사용자 요청");
    //로그인으로 redirect
    response.sendRedirect("/login?redirectURL=" + requestURI);
    return false;
}
return true;
~~~
preHandle()에서 인증을 check 해준다.
session이 없거나, 유저 정보가 세션저장소에 없다면 false를 return해서 진행이 안되도록 한다. 이때, response에 redirect 담아서 view를 지정해 줄 수 있다.

## 참고
https://www.baeldung.com/spring-mvc-custom-handler-interceptor