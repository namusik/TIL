# Method Reference 메소드 참조

## 개념
람다 표현식이 단 하나의 메소드만을 호출하는 경우에 사용가능.

## 문법
~~~
클래스 이름 :: 메소드 이름
or
참조 변수 이름 :: 메소드 이름
~~~

## 사용법 
~~~java
(base, exponent) -> Math.pow(base, exponent)

Math::pow;
~~~

## 생성자 참조
생성자를 호출하는 람다표현식도 메소드 참조로 변경 가능

~~~java
(a) -> {return new Object(a);}

Object::New;
~~~