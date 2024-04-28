# REST 

Representational State Transfer

## 정의
-  리소스를 정의하고 액세스하는 방법을 설명하는 규칙에 의존하는 **소프트웨어 아키텍처 스타일**
-  2000년 로이 필딩(Roy Fielding)의 박사 학위 논문에서 처음 소개됨


## 특징
- 표준화되어 있지 않기 때문에 구현에 있어 많은 탄력성을 제공.
-  RESTful API를 개발하는 동안 따라야 할 일련의 주요 일반 제약 조건을 정의해줌

## 제약조건
### Uniform interface
- 일관된 인터페이스
- 요청에서 리소스를 특정할 수 있어야 함.
- 일반적으로 URI로 설명 가능.

### Client-server architecture
- 클라이언트와 서버는 서로의 책임(무엇을 하는지)에 대해 알 필요가 없다.
- 둘은 독립적으로 발전 가능하다.

### Statelessness
- RESTful API는 상태 비정장형이야 함.
- 사용자 세션에 대한 정보를 저장하지 않음.
- 모든 요청은 처리할 수 있는 완전한 데이터를 제공해야 한다.

### Cacheability
- 

## REST API
- REST 아키텍처 원칙을 따르는 구체적인 API를 지칭
- API (Application Programming Interface)
  - 특정 소프트웨어 컴포넌트가 다른 컴포넌트와 상호작용할 수 있도록 하는 명시적인 정의나 프로토콜
- HTTP 메서드를 사용하여 웹 자원에 액세스하고, 자원의 상태를 조회하거나 변경하는 것을 가능하게 해줌

## 출처
https://www.baeldung.com/cs/rest-architecture