# 코틀린에서의 jpa entity

## 한계

* Kotlin으로 JPA Entity를 정의하다 보면, Kotlin의 언어적 특성과 맞지 않는 부분이 많다. 
* JPA는 Java를 기준으로 Entity를 정의하기 쉽게 만들어졌기 때문

## 1. 무분별한 mutable property 사용
* kotlin은 불변 immutable을 지향
* 변수(mutable)는 부작용이 많기 때문

## 2. Entity에 data class를 쓰지 말자
#### Data Class를 쓰는 이유는 편해서
* equals(), hashcode(), toString()을 자동으로 등록해준다.

#### JPA에서 요구하는 Entity 조건
* @Entity annotation
* public or protected 기본 생성자 필요
* final이 붙으면 안됨
* equals와 hashcode를 구현해야한다.

#### 그러면 왜 Data class를 쓰면 안되는가
1. Lazy Loading을 위해서 
   * 프록시 Lazy loading을 이용하면 관련된 다른 object를 필요한 시점에 불러와서 사용할 수 있음
   * 하지만, final class는 lazy loading이 불가능.
   * Kotin은 디폴트로 final이 붙는다.
   * allOpen 플러그인으로도 Data class는 open이 되지 않기 때문에 쓰면 안됨.

2. equal(), hashcode(), toString()의 한계
   * Data class는 위의 함수들을 자동으로 만들어줘서 편리함을 준다
   * 하지만, 주생성자 내부의 프로퍼티에만 적용이 됨.
   * toString()
     * N:1 관계가 서로 연결되어 있을 때 문제 발생
        ~~~kotlin
        @Entity
        data class Book(
            @OneToMany
            val pages: List<Page>
        )

        @Entity
        data class Page(
            @ManyToOne
            val book: Book
        )
        ~~~
    * Book에서 toString을 호출하면, page의 toString을 호출하고, 그러면 또 Book의 toString을 호출해서 StackOverflowException이 발생하게 된다.
    * 따라서, 위의 함수들을 override해서 사용해줘야 한다.

##3. Kotlin Entity를 JPA에 맞게 구성하기
1. 플러그인 추가하기
    *  allOpen, noArg
    *  스프링으로 프로젝트를 만들면 기본적으로 의존성 추가는 됨
2. PrimaryKeyEntity
   1. equal, hashcode를 공통으로 사용할 수 있는 추상클래스를 만들자.
3. 
## 출처
https://spoqa.github.io/2022/08/16/kotlin-jpa-entity.html

https://velog.io/@heyday_7/JPA-Entity-%EC%8B%AC%EC%B8%B5%ED%83%90%EA%B5%AC-2-Kotlin%EC%9C%BC%EB%A1%9C-Entity%EB%A5%BC-%EC%9E%91%EC%84%B1%ED%95%98%EB%8A%94-%EC%95%8C%EB%A7%9E%EC%9D%80-%EB%B0%A9%EB%B2%95