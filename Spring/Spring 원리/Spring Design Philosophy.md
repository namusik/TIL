# Spring Design Philosophy

[공식문서](https://docs.spring.io/spring-framework/reference/overview.html#overview-philosophy)

When you learn about a framework, it’s important to know not only what it does but what principles it follows.

스프링 프레임워크는 왜 쓸까?에 대한 고민.

----

**스프링의 핵심 컨셉**

자바 기반의 좋은 객체 지향 애플리케이션을 개발할 수 있도록 도와주는 프레임워크

기존의 EJB는 객체 지향을 해치게 되어서 스프링이 등장하게 되었다.

-------
 **design decisions**를 최대한 늦게 하도록 한다. 예를 들어 `Configuration`을 통해 코드의 직접적인 변경 없이 `persistence providers`를 변경할 수 있다.

비즈니스 로직을 개발할 때, 어떤 데이터 저장 메커니즘을 사용할지 신경 쓰지 않아도 된다는 점이다.

* 여기서 `persistence providers`는 영속성 제공자? 라고 할 수 있겠다. 
  JPA, ORM, RDB, NoSQL, 인메모리 데이터베이스, 파일시스템 등등 시간 경과에 따른 데이터를 저장하고 관리하도록 도와주는 기술을 의미한다.

-------
**code quality**를 유지하는데에 매우 중요하게 생각한다. 

packages들 사이에 `circular dependencies`가 없도록 clean code structure를 자랑한다. 

------

유지 보수를 용이하게 위해, 신중하게 JDK version과 third party libraries을 support한다.

-----

**light-weight framework** 지향

스프링이 없어도 돌아가는 코드로 만들게 되자.





