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
    var street: String = "Baker"
    var city: String = "London"
    var state: String? = null
    var zip: String = "123456"
}

호출할 때는, '.프로퍼티 명'을 쓰면 된다.
~~~kotlin
val address = Address()
val aa = address.name
~~~



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

## 출처
https://kotlinlang.org/docs/classes.html