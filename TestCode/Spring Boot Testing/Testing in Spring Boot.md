# Testing in Spring Boot

[testing in springboot](https://www.baeldung.com/spring-boot-testing)

## 개념
스프링 부트를 활용해서 테스트 코드 작성하는 법.

## 주의 
엄밀히 따지면 스프링 컨텍스트에 올리기 때문에 Unit Test가 아니고, Integrated Test이다.

TDD가 아니라고 할 수 도 있다.

## Gradle
~~~groovy
testImplementation 'org.springframework.boot:spring-boot-starter-test'
~~~

참고로 스프링 부트 프로젝트를 만들면, 자동으로 추가해준다.

## @SpringBootTest
스프링 AOP를 적용하려면 스프링 컨테이너가 필요. 
이 @를 통해 테스트 실행 시, 스프링 컨테이너를 생성. 스프링 컨테이너 빈들이 사용가능해짐.

## @TestConfiguration

테스트 내부 안에서 내부 설정 클래스를 만들고 해당 @를 붙이면, 자동으로 스프링 빈으로 등록해줌.

## protected method
같은패키지에 있는 테스트 코드 에서 쓸 수 있도록.