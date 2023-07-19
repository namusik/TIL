# 안전 호출 연산자

## ?

~~~kotlin
fun len(param :String?): int{
    param.lenth
}
~~~

Kotlin은 기본적으로 모든 타입에 null을 참조할 수 없음. 

따라서 null을 받으려면 인자 타입뒤에 ?를 붙이면 null을 받을 수 있다. 

하지만, 위 상태에서는 null을 받으면 내부 로직을 실행할 때 오류가 발생한다.

## ?.

~~~kotlin
fun len(param :String?): int{
    param?.lenth
}
~~~
param이 null이 아니면 함수를 실행하고 
null이면 그대로 null을 반환 해버린다.

이러면 또 문제가 발생하는게, int를 반환해야 하는데 null을 반환해 버린다. 

## ?: 
엘비스 연산자 
~~~kotlin
fun len(param :String?): int{
    param?.lenth ?: 0
}
~~~
값이 null인 경우 ?: 우측에 대체할 값을 지정할 수 있다. 

throw를 통해 예외를 던질 수 도 있다.

이러면 param이 null 일때, 
param?.lenth가 null을 반환하고,
?: 0 을 통해 최종적으로 0을 반환한다.

## is 

## as 
