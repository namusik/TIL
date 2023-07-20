# Kotlin Class

## Properties

# Kotlin Properties

코틀린의 Properties는 

var - mutable

val - read-only 

2가지 방식으로 선언 된다.

~~~kotlin
class Address {
    var name: String = "Holmes, Sherlock"
    val detail : String = "aaa"
}

호출할 때는, '.프로퍼티 명'을 쓰면 된다.
~~~kotlin
val address = Address()
val aa = address.name
~~~

## 프로퍼티와 초기화
Kotlin은 기본적으로 프로퍼티를 선언할 때 동시에 초기화를 해줘야 한다. 

~~~kotlin
class Person {
    // 초기화와 함께 프로퍼티 선언
    var name: String = "John"
    var age: Int = 30
}
~~~

혹은 
~~~kotlin
class Person {
    // Nullable 프로퍼티 선언 (값이 없는 상태로 시작할 수 있음)
    var nickname: String? = null
}
~~~
nullable 프로퍼티로 선언해서 초기화 없이 선언할 수도 있다.

이렇게 초기화를 동시에 해주는 이유는 
1. 안정성 
   1. 코틀린은 기본적은 Null Safety 언어이다. 이렇게 강제로 기본값을 설정해주면 null이 될 상황을 막을 수 있다.
2. 간결성
   1. 초기화를 동시에 하면, 컴파일러가 자동으로 backing field, getter, setter를 생성해준다.

기본 생성자 안에 정의한 Property는 기본값을 줄 수도 있고 안줄 수도 있다.

**기본값 없는 경우**
~~~kotlin
class Person(val name: String, val age: Int)

fun main() {
    val person = Person("John", 30)
    println(person.name) // 출력: John
    println(person.age)  // 출력: 30
}
~~~
반드시 생성자를 통해 값을 전달해야 한다. 기본값을 주지 않는다면, string은 null로 int는 0으로 초기화 되버린다.

**기본값이 있는 경우**
~~~kotlin
class Person(
    val name: String = "John",
    val age: Int = 30
)

fun main() {
    // 기본값을 사용하여 인스턴스 생성
    val person1 = Person()
    println(person1.name) // 출력: John
    println(person1.age)  // 출력: 30

    // 생성자를 통해 값을 전달하여 인스턴스 생성
    val person2 = Person("Alice", 25)
    println(person2.name) // 출력: Alice
    println(person2.age)  // 출력: 25
}
~~~
기본값이 있는 경우에는, 생성자를 호출할 때 값을 주지 않으면 기본값으로 초기화된다. 

생성자를 호출할 때 값을 주면, 그 값으로 초기화된다.

**생성자 매개변수에 val, var 안붙이는 경우**
~~~kotlin
class Person(name:String){
    var name : String = name
        protected set
}
~~~
val, var 안붙이면 name은 단순히 생성자의 지역변수이다. 
이 매개변수는 initializer blocks에서 Property로 만들어줄 수 있다.
보통 protected set을 붙이기 위해 사용하는 것 같다.

### lateInit


## Constructors

### primary constructor
~~~kotlin
class Person constructor(firstName: String) { /*...*/ }

class Person(firstName: String)
~~~
오직 하나만 있음.
class header에 한 부분으로 존재. 

primary constructor가 어노테이션이나 접근 제한자(public, private 등)을 갖고 있지 않다면 constructor 키워드를 생략가능




### secondary constructor

여러개 가질 수 있음.

 어떤 secondary 생성자를 호출하더라도 Primary 생성자가 먼저 수행된 후에 실행됩니다.

 ### Getter Setter
Kotlin에서는 자동으로 만들어진다.

1. var
   1. getter, setter 모두 자동 생성 
2. val
   1. getter만 생성

Kotlin에서는 getter setter를 프로퍼티에 접근하는 것처럼 .을 통해 사용 가능하다.

~~~kotlin
class Person(val name: String, var age: Int)

fun main() {
    val person = Person("John", 30)

    println(person.name) // 출력: John
    println(person.age)  // 출력: 30

    person.age = 31
    println(person.age)  // 출력: 31
}
~~~

### Backing field
코틀린에서 프로퍼티를 저장하는 실제 변수.

프로퍼티는 getter, setter를 가지지만 실제 값이 저장되는 곳은 backing field이다.

getter, setter는 이 backing field에 접근해서 값을 가져오고 설정하는 것이다.

기본적으로 backing field의 이름은 프로퍼티 이름과 동일하다.

### Backing properties
사용자가 직접 정의한 getter, setter를 가진 property.

customize가 가능하다.

## 출처
https://kotlinlang.org/docs/classes.html