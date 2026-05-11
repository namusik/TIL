# Kotlin 자료형 검사 

[공식문서](https://kotlinlang.org/docs/typecasts.html)

## is !is

코틀린에서 자료형을 검사하기 위해서 사용하는 키워드. 

자바의 instanceof()와 동일한 기능

~~~kotlin
if (obj is String) {
    print(obj.length)
}

## Smart casts
코틀린에서는 

if (obj !is String) { // same as !(obj is String)
    print("Not a String")
} else {
    print(obj.length)
}
~~~

## as
unsafe cast operator
~~~kotlin
val x: String = y as String
~~~
y가 null일때, String으로 cast될 수 없기 때문에 예외 발생 

이럴 때는, Safe cast operator를 써야 한다.

## as?
~~~kotlin
val x: String? = y as? String
~~~
exception을 피하기 위해, as?를 사용하였다. 

이 경우, y가 String으로 cast 될 수 없을 때 예외를 던지는 대신 null을 반환한다. 

그리고, val x가 null을 받기 위해 String?으로 x 타입을 정의해줬다.