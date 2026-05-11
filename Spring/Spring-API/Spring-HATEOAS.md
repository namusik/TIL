# Spring HATEOAS

## 의존성 추가
```gradle
implementation 'org.springframework.boot:spring-boot-starter-hateoas'
```


## RepresentationModel

```java
public class Customer extends RepresentationModel<Customer> {
   ...
}
```

- 리소스 표현을 생성할 때 상속할 RepresentationModel이라는 베이스 클래스 제공
- add() 메서드를 상속함.

## Link

- 메타데이터(리소스의 위치 또는 URI)를 저장하는 Link 객체 제공

## WebMvcLinkBuilder

- link를 하드코딩 하지 않아소 URI를 간단하게 구축해주는 클래스