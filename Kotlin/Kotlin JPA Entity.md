# 코틀린에서의 JPA ENTITY 고민

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

## 2. Entity에 Data class를 쓰지 말자
#### Data Class를 쓰는 이유는 편해서
* equals(), hashcode(), toString()을 자동으로 등록해준다.
* Data Class는 데이터를 전달하기 위한 용도이기 때문에 불변변수로 해주는 것이 좋다. 
* Value Object의 개념이라 할 수 있다.
* 반면 Entity는 식별자를 제외하고는 상태가 변할 수 있다. 
* 즉, Entity와 Data class는 성격이 다르다.


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

##3. lateinit 사용 주의
보통 코드를 사용하는 시점까지 초기화를 미루기 위해 lateinit을 사용한다. 
JPA Entity에서는 주로 연관계를 정의 할 때 lateinit이 사용된다. 

~~~kotlin
@Entity
class Board(
  title: String,
  writerId: UUID,
) {
  @Id
  var id: UUID = UUID.randomUUID()

  @Column
  var title: String = title

  @Column
  var writerId: UUID = writer.id

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "writerId")
  lateinit var writer: User
}
~~~
연관관계인 User에 lateinit을 사용하였다. 

문제는, Entity를 생성한 직후, 영속화가 되기전에 조회를 하면 런타임 오류가 발생한다. 이유는, 아직 JPA가 writer를 초기화 해주지 않았기 때문이다. 

~~~kotlin
val user = User("홍길동")
val board = Board2("게시판", user.id)
val writer = board.writer // error: lateinit property writer has not been initialized
~~~

이를 해결할 수 있는 방법이, **nullable** 타입으로 정의하는 것이다.

~~~kotlin
@Entity
class Board(
  title: String,
  writerId: UUID,
) {

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "writerId")
  var writer: User? = null
}
~~~

이러면 애초에 기본값이 null로 들어가기 때문에, 예상치못한 null을 만나도 초기화 오류는 피할 수 있다.

하지만, 이또한 근본적인 해결책은 아니다. Entity에 null이 들어가는 것이 정상적인 것은 아니기 때문이다. 그래서 연관관계에 식별자를 넣는 것이 아니라 해당 Entity 자체를 넣어주는 방법이 있다. 

~~~kotlin
@Entity
class Board(
  title: String,
  writer: User,
) {
  @Id
  var id: UUID = UUID.randomUUID()

  @Column
  var title: String = title

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  var writer: User = writer
}
~~~
이러면, 생성자 호출시 연관관계 객체를 넣어서 초기화하기 때문에 값이 없을 걱정이 없다.

##4. Property 접근 제어
Entity의 식별자를 제외한 Properties들은 mutable이기 때문에 var로 선언하는 것이 맞아보인다. 

하지만 아무데서나 setter를 사용하는 것은 옳지 않다. 

이 때, protected set을 써준다. 

~~~kotlin
@Entity
class User(
    name: String,
){
    @Column
    var name: String = name
        protected set
}
~~~
protected를 설정해주면, 자신과 상속받은 Class에서만 set이 가능해진다.

참고로, Entity 클래스에 allOpen을 통해 open 키워드를 붙여준 이상, private set은 불가능하다.

### val인 경우
Property 중에 생성 후 변경이 필요없는 경우도 있다. 
이때는, val을 써주면 된다. 

##5. nullable 
Java의 Field는 nullable이다.
Java의 Entity에서 @Column을 생략하면 자동으로 DB에 not null이 붙는다. 
@Column을 쓸 때는 기본값이 true이므로 nullabe=false를 붙이는게 좋다.

Kotlin의 Property는 non-nullable이다.


##6. Kotlin Entity를 JPA맞게 만드는 TIP
1. 플러그인 추가하기
    *  allOpen, noArg
    *  스프링으로 프로젝트를 만들면 기본적으로 의존성 추가는 됨
2. 공통 abstract class 만들기
   1. Primary Key 정의
   2. Persistable을 구현해보자
      1. @ID에 @GeneratedValue를 사용하지 않을 때.
      2. 
   3. equal, hashcode를 공통으로 사용하기 위해.
      1. Entity는 식별자만 비교하면 된다.
      2. hibernateProxy에 주의하자.


## 결론 
~~~kotlin
~~~
1. data class 쓰지 말자
2. allopen, no-arg plugin 적용하자
   1. 기본적으로 플러그인이 자동 적용된다.
   2. allOpen은 @Entity에 적용 되지않아 따로 추가해줘야 한다.
3. property를 var로 쓰지말자. 무분별하게 외부에서 수정을 노출시키는 것을 막기위해.
4. 식별자는 불변이기 때문에, val로 선언하자


## 출처
https://spoqa.github.io/2022/08/16/kotlin-jpa-entity.html

https://velog.io/@heyday_7/JPA-Entity-%EC%8B%AC%EC%B8%B5%ED%83%90%EA%B5%AC-2-Kotlin%EC%9C%BC%EB%A1%9C-Entity%EB%A5%BC-%EC%9E%91%EC%84%B1%ED%95%98%EB%8A%94-%EC%95%8C%EB%A7%9E%EC%9D%80-%EB%B0%A9%EB%B2%95

https://wslog.dev/kotlin-jpa

https://jpa-buddy.com/blog/best-practices-and-common-pitfalls/