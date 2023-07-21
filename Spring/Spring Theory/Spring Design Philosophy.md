# Spring Design Philosophy

[공식문서](https://docs.spring.io/spring-framework/reference/overview.html#overview-philosophy)

Guiding principles of the Spring Framework

스프링 프레임워크는 왜 쓸까?에 대한 고민.


-------
 `design decisions`를 최대한 늦게 하도록 한다. 예를 들어 `Configuration`을 통해 코드의 직접적인 변경 없이 `persistence providers`를 변경할 수 있다.

비즈니스 로직을 개발할 때, 어떤 데이터 저장 메커니즘을 사용할지 신경 쓰지 않아도 된다는 점이다.

* 여기서 `persistence providers`는 영속성 제공자? 라고 할 수 있겠다. 
  JPA, ORM, RDB, NoSQL, 인메모리 데이터베이스, 파일시스템 등등 시간 경과에 따른 데이터를 저장하고 관리하도록 도와주는 기술을 의미한다.