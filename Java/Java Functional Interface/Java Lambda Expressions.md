# Lambda Expression
[baeldung](https://www.baeldung.com/tag/lambda-expressions)

## 개념
람다 표현식.

`익명함수(Anonymous functions)`를 지칭하는 말이다.

## 익명함수
말 그대로 이름이 없는 함수.

## 특징
고차함수에 인자로 전달되거나, 고차 함수의 return값으로 쓰인다. 

적재적소에 람다식을 넣는 것이 중요.

람다 표현식은 변수에 저장될 수 있는데, 그 변수가 Functional Interface이다. 

[Functional Interface 설명](./Java%20Functional%20Interface.md)

## 문법
~~~java
parameter -> body
(T parameter1, T parameter2) -> {code block;}
~~~

1. 매개변수 타입의 추론이 가능한 경우, 생략 가능.
2. 매개변수가 하나라면 소괄호 생략가능
3. body가 하나의 명령문이면 중괄호 생략 가능. 이때 body 끝에 `;`는 쓰지 않는다.

## effectively final
람다표현식에는 아래와 같은 규칙이 있다.
1. 람다표현식은 외부 block에 있는 변수에 접근할 수 있다.
2. 외부 변수가 지역변수 일때, final 혹은 effectively final이야만 한다.

## 참고
http://www.tcpschool.com/java/java_lambda_concept

https://www.baeldung.com/java-lambda-effectively-final-local-variables

https://velog.io/@snack655/Java-Fire%ED%95%9C-Effectively-Final%EC%9D%B4%EB%9E%80

https://futurecreator.github.io/2018/07/19/java-lambda-basics/

