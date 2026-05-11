# REST 

Representational State Transfer

## 정의
-  네트워크로 연결된 애플리케이션을 설계하기 위한 **소프트웨어 아키텍처 스타일**
-  2000년 로이 필딩(Roy Fielding)의 박사 학위 논문에서 처음 소개됨
-  간단하고 stateless한 통신을 사용하여 HTTP와 같은 네트워크를 통해 리소스와 상호 작용하는 것

## 특징
- 예를 들면, SOAP처럼 표준화되어 있지 않기 때문에 구현에 있어 많은 탄력성을 제공.
- RESTful API를 개발하는 동안 따라야 할 일련의 주요 일반 제약 조건을 정의해줌

## 제약조건
### Uniform interface
- 일관된 인터페이스
- 요청에서 리소스를 특정할 수 있어야 함.
- 일반적으로 URI로 설명 가능.

#### HATEOAS
- Hypermdia as the Engine of Application State
- 클라이언트를 서버에서 분리된 상태로 유지하는 REST 애플리케이션 아키텍처의 제약 조건
- 클라이언트가 API 구조에 대한 사전 지식 없이도 이러한 링크를 따라 리소스를 동적으로 탐색할 수 있게됨.
- 아래처럼 서버가 응답에 다른 리소스의 하이퍼미디어를 제공해준다.
```json
{
  "id": 1,
  "title": "1984",
  "author": "George Orwell",
  "publishedYear": 1949,
  "links": {
    "self": "/books/1",
    "update": "/books/1",
    "delete": "/books/1",
    "list": "/books",
    "authorDetails": "/authors/George_Orwell"
  }}
```

### Client-server architecture
- 클라이언트와 서버는 서로의 책임(무엇을 하는지)에 대해 알 필요가 없다.
- 둘은 독립적으로 발전 가능하다.

### Statelessness
- RESTful API는 상태 비정장형이야 함.
- 사용자 세션에 대한 정보를 저장하지 않음.
- 모든 요청은 처리할 수 있는 완전한 데이터를 제공해야 한다.

### Cacheability
- 서버의 응답은 캐시 여부와 기간에 대한 정보를 제공해야 한다.
- 캐싱을 통해 성능을 향상하고, 클라이언트-서버간의 중복 상호교환을 제거할 수 있다.

### Layered system
- REST API는 여러 계층으로 구성될 수 있다.
- 각 계층은 다른 계층에 직접적인 영향을 끼쳐서는 안된다.
- 또한 클라이언트는 연결된 서버가 끝단인지 중개서버인지 알아서는 안된다.
- 이런 모듈성은 시스템을 유연하고 확장 가능하게 만들어 준다.

## RESTful API
- REST 아키텍처 원칙을 준수하는 구체적인 API를 지칭
- API (Application Programming Interface)
  - 특정 소프트웨어 컴포넌트가 다른 컴포넌트와 상호작용할 수 있도록 하는 명시적인 정의나 프로토콜
- HTTP 프로토콜을 사용하여 웹 자원에 액세스하고, 자원의 상태를 조회하거나 변경하는 것을 가능하게 해줌
- 특정 resource를 URI로 식별한다.


## Richardson Maturity Model

- RESTful API의 요구 사항을 준수하는 수준을 추정하는 도구
- 4단계의 level을 정의한다.

### Level 0 : The Swamp of POX

```json
POST /api/createUser
POST /api/updateUser
GET /api/findUser
```
- POST와 GET 메서드만 사용하는 수준.
- HTTP 프로토콜은 전송 계층으로만 사용

### Level 1
```json
POST /api/users/create
GET /api/users/{id}/find
POST /api/users/{id}/update
```

- resource와 URI를 정의하는 단계

### Level 2 
```json
POST /api/users
PUT /api/users/{id}
GET /api/users/{id}
```

- PUT, PATHC, DELETE와 같은 추가 메서드를 사용하는 단계
- 더 발전된 URI 정의

### Level 3
```json
{
   "id":12345,
   "firstname":"some-firstname",
   "lastname":"some-lastname",
   "age":39,
   "links":{
      "address":"users/12345/address"
   }
}
```
- HATEOAS
- self-navigating API
- 요청된 리소스와 관련된 추가 리소의 URI를 추가하는 것

## 출처
https://www.baeldung.com/cs/rest-architecture

https://rapidapi.com/guides/rest-parameter-types

https://ics.uci.edu/~fielding/pubs/dissertation/top.htm