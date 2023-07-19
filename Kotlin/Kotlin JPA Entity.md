# 코틀린에서의 jpa entity

코틀린으로 JPA를 사용할때, Entity 정의를 어떻게 내릴 것인가.
JPA규격을 위반하지 않으면서, Kotlin의 방식을 따를려면?

## 한계

* Kotlin으로 JPA Entity를 정의하다 보면, Kotlin의 언어적 특성과 맞지 않는 부분이 많다. 
* JPA는 Java를 기준으로 Entity를 정의하기 쉽게 만들어졌기 때문

## 1. 무분별한 mutable property 사용
* kotlin은 불변 immutable을 지향
* 변수(mutable)는 부작용이 많기 때문

~~~kotlin
@Entity
class Person(
  @ID
  var id: Long,

  @Column
  var name: String,

  @Column
  var age: Int,
)
~~~
위 kotlin Entity의 문제는 캡슐화가 안된 점.
게다가 var이기 때문에 Entity의 상태를 외부에서 아무런 제약없이 변경하게 된다. 심지어 식별자 @ID까지 바꿀 수 있게된다.

Java에서 Field에 private 안붙인거와 같은 상황.

Kotlin에서 클래스가 가지는 상태는 field가 아니라 property이다.
property는 Field를 외부에 직접 노출하지 않고 Setter와 Getter로 노출 시키는 것.

## 2. Entity에 data class를 쓰지 말자
#### Data Class를 쓰는 이유는 편해서
* equals(), hashcode(), toString()을 자동으로 등록해준다.
* Data Class는 데이터를 전달하기 위한 용도이기 때문에 불변변수로 해주는 것이 좋다. 
* Value Object의 개념이라 할 수 있다.
* 반면 Entity는 식별자를 제외하고는 상태가 변할 수 있다. 


#### JPA에서 요구하는 Entity 조건
* @Entity annotation
* @Id annotation  - 식별자
* public or protected No-Arg Constructor 필요
* final이 붙으면 안됨. -> 불변이어선 안됨.
* equals와 hashcode를 구현해야한다.

#### 그러면 왜 Data class를 쓰면 안되는가
1. Lazy Loading을 위해서 
   * 프록시 Lazy loading을 이용하면 관련된 다른 object를 필요한 시점에 불러와서 사용할 수 있음
   * 하지만, final class는 lazy loading이 불가능.
   * **Kotin Class에는 디폴트로 final이 붙는다.** 이를 위해 allOpen 플러그인을 사용해준다.
   * 그런데! allOpen 플러그인으로도 Data class는 open이 되지 않기 때문에 쓰면 안됨.

2. equal(), hashcode(), toString()의 한계
   * Data class는 위의 함수들을 자동으로 만들어줘서 편리함을 준다
   * 하지만, 주생성자 내부의 프로퍼티에만 적용이 됨.
   * 게다가 Entity의 경우 식별자만 비교의 대상이다. 식별자가 같으면 같은 Entity이기 때문.
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
   2. 
3. 
## 출처
https://spoqa.github.io/2022/08/16/kotlin-jpa-entity.html

https://velog.io/@heyday_7/JPA-Entity-%EC%8B%AC%EC%B8%B5%ED%83%90%EA%B5%AC-2-Kotlin%EC%9C%BC%EB%A1%9C-Entity%EB%A5%BC-%EC%9E%91%EC%84%B1%ED%95%98%EB%8A%94-%EC%95%8C%EB%A7%9E%EC%9D%80-%EB%B0%A9%EB%B2%95

https://wslog.dev/kotlin-jpa