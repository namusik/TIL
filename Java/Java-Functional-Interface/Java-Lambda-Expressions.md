# Lambda Expression

> 최종 업데이트: 2026-09-15 | Java 8+ 기준

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

[Functional Interface 설명](./Java-Functional-Interface.md)

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

#### Mutable Holder 패턴 — 원시형 카운터를 우회하는 법

`effectively final` 규칙 때문에 람다 안에서 지역변수를 **직접 증가**시키는 코드는 컴파일이 안 된다.

```java
int counted = 0;
list.forEach(item -> counted++);   // ❌ 컴파일 에러 — counted가 effectively final이 아님
```

캡처되는 게 "변수가 가리키는 값"이라는 점에서 원시형과 참조형의 운명이 갈린다.

| | `int counted` | `int[] counted` |
|---|---|---|
| 캡처되는 값 | **숫자 자체** | 배열의 **참조값(주소)** |
| 증가시키면? | 값 자체를 재할당 → **금지** | 주소는 그대로, **가리키는 슬롯의 내용만 변경** → 허용 |

```java
int[] counted = {0};
list.forEach(item -> counted[0]++);   // ✅ 참조 자체는 재할당 안 됨(effectively final 유지)
```

`counted[0]++`는 `counted`라는 변수에 새 값을 대입하는 게 아니라, **`counted`가 가리키는 배열 객체 내부의 슬롯 하나를 바꾸는 것**이다. `effectively final`은 "변수가 다른 걸 가리키게 되는 것"만 금지할 뿐, 가리키는 객체의 **내부 상태 변경**까지는 막지 않는다. `List`에 `add()`하는 코드가 원래부터 문제없었던 이유도 같다 — 참조를 재할당하는 게 아니라 그 리스트 객체 내부에 원소를 추가할 뿐이기 때문이다.

이 우회를 **mutable holder(가변 홀더) 패턴** 또는 **"1칸짜리 배열 트릭"**이라 부른다. Java 8 이전 익명 클래스 시절부터 쓰이던 기법이 람다에도 그대로 이어졌다. 의도를 더 명확히 드러내려면 아래 대안을 쓴다.

| 대안 | 특징 |
|------|------|
| `int[]` (1칸 배열) | 가장 짧지만 "왜 배열이지?"라는 의문을 남김 |
| **`AtomicInteger`** | `incrementAndGet()`으로 의도가 코드에 드러나고, **스레드 안전성**까지 덤으로 얻음 |
| 커스텀 mutable wrapper 클래스 | 이름 있는 홀더(`IntHolder` 등)로 가독성을 높임 |

## 참고
http://www.tcpschool.com/java/java_lambda_concept

https://www.baeldung.com/java-lambda-effectively-final-local-variables

https://velog.io/@snack655/Java-Fire%ED%95%9C-Effectively-Final%EC%9D%B4%EB%9E%80

https://futurecreator.github.io/2018/07/19/java-lambda-basics/

