# IoC(Inversion of Control)

[공식문서](https://docs.spring.io/spring-framework/docs/5.3.x/reference/html/core.html#spring-core)

[baeldung](https://www.baeldung.com/inversion-control-and-dependency-injection-in-spring#what-is-inversion-of-control)

## 정의

제어의 역전

객체 또는 프로그램의 일부의 제어권을 컨테이너 혹은 프레임워크로 이전하는 원칙

## 설명
내가 뭔가 호출하는 게 아니라, 프레임워크가 대신 호출해준다. 

의존관계 객체의 구현체를 외부에서 정해준다.

객체 지향 프로그래밍의 맥락에서 자주 사용된다.

## 장점 
* 구현과 작업의 분리
* 구현체 쉽게 변경 가능
* 프로그램 모듈성 향상

## 방법
* Strategy design pattern
* Service Locator pattern
* Factory pattern
* Dependency Injection

등을 통해 IoC를 달성할 수 있다.

## IoC Container
스프링 프레임워크 핵심 기능 중 하나.

IoC를 구현하는 프레임워크의 공통적인 특징

객체를 생성하고 관리하면서 의존관계를 연결해 주는 역할을 가진 것.
IoC를 일으킨다고 해서 IoC Container라고 한다. 

좀 특성에 맞게   `DI Container`라고도 부른다.

Spring에서는 `ApplicationContext`가 IoC container 역할을 한다. 스프링 컨테이너라고 부른다.