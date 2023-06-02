# Optional

## 설명
Java8 도입
NullPointerException을 방지하기 위해 생김.
Null이 올 수 있는 값을 감싸는 Wrapper 클래스.

## 사용법

#### Optional 빈값 생성하기
~~~java
Optional<String> op = Optional.empty();
~~~
내부에 빈값으로 생성해주는 empty()메서드를 가지고 있다.

#### 절대 Null이 아닌 경우
~~~java
Optional<String> op = Optional.of("aa");
~~~
여기서는 오히려 null을 넣으면 NPE 발생

#### null 일수도 있는 경우
~~~java
Optional<String> op = Optional.ofNullable(a())
String aa = op.orElse("aaa");
~~~

값을 가져올 때 orElse()를 사용해서 null인 경우의 값을 지정해줄 수 도 있다.

그냥 .get()으로 값을 가져올 수 도 있는데 대신 null이면 NPE 발생.

#### orElse vs orElseGet

orElse
    파라미터로 값을 받음
    함수가 파라미터로 들어오면, 함수가 실행이 되고 return값을 파라미터로 넣어줌. 
    null이 아니더라도 함수가 실행됨.

orElseGet
    파라미터로 함수형 인터페이스를 받음
    함수가 실행되지 않고 그 자체가 파라미터 됨. 
    null이 아니면 함수가 실행되지 않음.


## 주의점
Optional은 반환 타입으로만 사용해야 한다.

Optional 변수에 null을 넣지 말자. empty()를 쓰자
~~~java
Optional<Ob> ob = null;
~~~

## 출처
https://mangkyu.tistory.com/70