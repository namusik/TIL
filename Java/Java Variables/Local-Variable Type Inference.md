# var

## 정의
Local-Variable Type Inference

지역 변수를 선언할 때 타입을 생략하고, 컴파일러가 타입을 유추한다.

~~~java
String message = "Good bye, Java 9";

var message = "Hello, Java 10";
~~~

message라는 지역 변수에 대해서 data type을 제공하지 않아도 된다.

대신 `var`를 써주면, 컴파일러는 오른쪽에 있는 초기화 값의 유형으로부터 데이터 타입을 유추한다. 따라서, 변수의 유형은 컴파일 시점에 추론되고 변경될 수 없다. 동적 지정 불가.

그래서 `runtime overhead`가 발생하지 않는다.


참고로 var는 `keyword`가 아니기 때문에 기존에 변수명으로 var를 쓴 경우와 충돌하지 않는다.


## 의의
변수의 타입보다 변수의 이름에 집중하도록 도와준다.

어차피 변수의 타입은 생성할 때 결정되고 바뀌지 않는데 굳이 장황하게 타입을 다 적어줄 필요가 없다.

너무 뻔한 걸 굳이 나타내지 말자.

요즘 추세는 모던 랭귀지는 var를 쓰는게 맞다.

## 사용불가
클래스 멤버 변수, method 매개변수, method 반환 타입에는 사용 불가.

초기화를 바로 해줘야하기 때문에.
~~~java
var n;
~~~

null로 초기화 불가.
~~~java
var emptyList = null;
~~~

배열은 타입 추론을 못하기 때문에 사용 불가.
~~~java
var arr = { 1, 2, 3 };
~~~

List, Map을 받는 변수로는 사용가능.
~~~java
var idToNameMap = new HashMap<Integer, String>();
~~~

람다 표현식에도 사용 불가
~~~java
var p = (String s) -> s.length() > 10;
~~~

## 사용방법
~~~java
var result = obj.prcoess();
~~~
위처럼 코드의 가독성이 떨어지는 경우는 사용하지 않는 것이 좋다. 당췌 무슨 타입인지 한 눈에 알 수가 없음.

[가이드라인](https://openjdk.org/projects/amber/guides/lvti-style-guide)을 참고해서 사용하자.

----

~~~java
var x = emp.getProjects.stream()
  .findFirst()
  .map(String::length)
  .orElse(0);
~~~
또한, 파이프라인이 긴 stream에는 사용을 피해야 한다.

---

~~~java
var empList = new ArrayList<>();

var empList = new ArrayList<Employee>();
~~~
또한, diamond operator를 사용할 때, 타입을 지정해주지 않으면, empList는 `ArrayList<Object>`가 될 것이다.

---
~~~java
var obj = new Object() {};

obj = new Object(); 
~~~
익명 클래스를 받은 var 변수는 Object 타입이 아니기 때문에 재할당이 불가능하다.

## 참고
https://www.baeldung.com/java-10-local-variable-type-inference