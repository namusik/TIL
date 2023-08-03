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

#### Capturing Lambda
람다 표현식 중에서 외부 변수를 사용하는 것들을 `capturing lambda`라고 부른다.

 static 변수, instance 변수, 그리고 local 변수를 `capture` 할 수 있다.

지역 변수의 값을 `caputure`한다는 뜻은,
 **변수의 값을 복사**한다는 것을 의미한다. 다른 변수의 값은 복사하지 않음.

**이 때, local 변수는 final 혹은 effectively final이어야만 한다.**

왜 static, instance 변수와 다르게 local 변수는 final이야 하며, 값을 복사해두는 것일까?

>이것은 변수가 어디에 저장되는가와 관련이 있다.

**멤버 변수는 `heap, method`에 저장된다.**
> 그래서 컴파일러는 람다가 변수의 최신 값에 접근할 수 있도록 보장해준다.

**지역 변수는 `stack`에 저장된다.**
각 스레드는 스택 영역에서 자신만의 영역을 가진고, 서로 공유할 수 없게된다.
스레드가 종료되면 스택 영역도 사라지는 특성이 있다.

> 먼저, 람다 내부에서 지역변수를 사용하는 스레드가 끝나기도 전에 지역변수가 속해있는 method의 스레드가 끝나버리면, 지역 변수는 사라지게 되고 람다는 더이상 참조할 수 없게 되버린다.
> 그래서 지역 변수의 값을 복사해서 별도의 스택에 저장해 두는 것이다.

>그리고 값을 복사한다고 해서, 그 값이 지역변수의 최신 값임을 보장할 수 가 없다. 동시성 문제가 발생 할 수 있다.


## 참고
http://www.tcpschool.com/java/java_lambda_concept

https://www.baeldung.com/java-lambda-effectively-final-local-variables

https://velog.io/@snack655/Java-Fire%ED%95%9C-Effectively-Final%EC%9D%B4%EB%9E%80

https://futurecreator.github.io/2018/07/19/java-lambda-basics/

