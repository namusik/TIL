# @Import

## 개념

@Configuration, @Component 등을 주입받을 때 사용할  수 있는 annotation

## 기능
group Configuration classes
~~~java
@Configuration
@Import({ DogConfig.class, CatConfig.class })
class MammalConfiguration {
}

@Configuration
@Import({ MammalConfiguration.class, BirdConfig.class })
class AnimalConfiguration {
}
~~~
여러개의 Configuration을 계층화 시킬 수 있다.

## ComponentScan 과의 차이
1. 둘다 @Component, @Configuration을 파라미터로 쓸 수 있다. 

2. 
## 출처
https://www.baeldung.com/spring-import-annotation

https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/context/annotation/Import.html