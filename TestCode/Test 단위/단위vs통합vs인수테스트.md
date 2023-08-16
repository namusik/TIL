# 단위테스트vs통합테스트vs인수테스트

## 단위 테스트 

가장 작은 테스트 단위

일반적으로 메소드나 클래스 수준

단위의 크기가 작을수록 단위의 복잡성이 낮아짐.

Java는 주로 Junit을 사용.

## 통합 테스트 

개발자가 변경할 수 없는 외부 라이브러리까지 포함한 테스트

단위 테스트에서 발견하기 어려운 오류를 발견 할 수 있음. 

서버 환경, DB 같은 오류를 확인 가능

단위 테스트 보다 복잡해지기 때문에, 유지 보수가 쉽지 않음. 

스프링부트에서는 @SpringBootTest를 사용한다.

## 인수 테스트 (Acceptance Test)

사용자 시나리오에 맞춰 수행하는 테스트

비즈니스 쪽에 초점을 두고 진행함.

애자일 개발 방법론에서 파생된 용어.

Java에서 RestAssured, MockMvc를 사용

## 출처

https://tecoble.techcourse.co.kr/post/2021-05-25-unit-test-vs-integration-test-vs-acceptance-test/

https://junit.org/junit5/docs/current/user-guide/#extensions