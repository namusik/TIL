# Kotlin Data Class

## 기본 생성자에서 정의한 Property만 copy, equals, hashCode, toString 함수들에 활용된다. 

~~~kotlin
data class Person(val name: String) {
    var age: Int = 0
}
~~~

여기서는 name만 활용해서 함수들을 만들어 주는 것이다.

결국, 모든 property를 기본 생성자에 정의해야 되는 사태가 발생한다. 

~~~kotlin
@Entity
data class Order(
  @Id
  val id: UUID,

  @Column
  val orderAt: LocalDateTime,
) {
  @Column
  val state: OrderState = OrderState.SUBMITTED
}
~~~
만약, 생성될 때 기본값을 가지고 생성하게 하고싶다면, 해당 property는 primary constructor에서 빠져야 한다. 왜냐하면, 기본값이 있을 때 

이러면, data class의 함수들을 원하는 대로 활용이 어려워 진다.

## 출처
https://kotlinlang.org/docs/data-classes.html

https://spoqa.github.io/2022/08/16/kotlin-jpa-entity.html