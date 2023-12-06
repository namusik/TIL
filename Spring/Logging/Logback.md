# Logback 

## 개념

스프링부트는 기본적으로 SLF4J 라는 로그 라이브러리 인터페이스를 제공한다. 

그리고 그 구현체로 제공하는 것이 Logback.

## 사용법 
~~~properties
logging.level.root=info
~~~
기본값이 info이다. 전체를 debug로 해버리면 모든 로그를 감당못함.

~~~properties
logging.level.hello.springmvc=debug
~~~
코드가 있는 패키지를 debug로 해둔다. 

~~~java
@Slf4j
~~~

클래스 상단에 애노테이션을 붙이면 된다. 

~~~java
log.info("data={}", aa)
~~~
- 로그에 들어갈 문자열을 {}를 써서 치환시켜준다.

```java
log.error("resolver ex", e);
```
- 예외 로그는 {} 안써줘도 가능

## 로그 설정

개발 서버는 debug
운영 서버는 info (꼭 남겨야 하는 중요한 것)

## 공식문서
https://logback.qos.ch/documentation.html