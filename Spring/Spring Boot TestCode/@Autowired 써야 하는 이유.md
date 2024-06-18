# 테스트 코드에서 @Autowired 써야하는 이유

## 설명
JUnit은 스프링과 별도로 의존성 주입을 한다.

Junit(Jupiter 엔진)에 의해 객체를 주입하게 된다.

`ParameterResolver 인터페이스`를 사용.

## 사용법 
`@SpringBootTest`는 스프링 부트가 제공하는 스프링 컨테이너를 사용해서 실행하는 방법

@SpringBootApplication이 있는 CoreApplication을 찾아서 사용합니다.

그리고 이렇게 찾은 @SpringBootApplication 안에는 @ComponentScan이 존재

이곳의 package 위치는  우리가 작성한 전에 애플리케이션 코드가 컴포넌트 스캔의 대상이 됩니다. 여기에는 @Configuration도 포함됩니다.

그리고 테스트에서 실행했기 때문에 test 중에서도 hello.core를 포함한 그 하위 패키지는 컴포넌트 스캔의 대상이 됩니다.

## 참고
https://sudal.site/test_construcor/

https://junit.org/junit5/docs/current/user-guide/#writing-tests-dependency-injection