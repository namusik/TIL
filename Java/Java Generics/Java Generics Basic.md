# Java Generics


## 개념

- 프로그래머가 특정 유형을 사용하겠다는 의사를 표현하고 컴파일러가 해당 유형의 정확성을 보장한다면 훨씬 더 쉬울 것입니다. 이것이 제네릭의 핵심 아이디어

```java
List list = new LinkedList();

List<Integer> list = new LinkedList<>();
```
- <> 다이아몬드 연산자를 추가해서 리스트 안의 타입을 지정해줌.
- 컴파일러는 컴파일시 이 유형을 강제할 수 있음.

- 제네릭 타입 파라미터 (T): 
  - 메서드나 클래스에서 사용할 특정 타입을 지정하는 데 사용
- 와일드카드 (?): 
  - 메서드나 클래스의 타입 파라미터가 어떤 타입이든 될 수 있음을 의미

## Generic 선언 이유
- 타입 독립성
  - 메서드가 어떤 타입이든 처리 가능
- 코드 재사용성
  - 동일한 메서드를 각 타입에 따라 중복으로 작성할 필요가 없어진다.
- 타입 안전성
  - 컴파일 시 타입 체크를 할 수 있음.


## Generic Method
- 제네릭 메서드를 선언해서 다양한 타입의 인수를 사용해서 호출가능

```java
public <T> List<T> fromArrayToList(T[] a) {   
    ...
}

public static <T, U> List<Object> combineArraysToList(T[] array1, U[] array2) {
  ...
}
```

- <T>
  - type parameter
  - 제네릭 타입 파라미터를 선언. 이 메서드는 어떤 타입의 배열이든 처리가능.
  - 메서드가 제네릭 타입 T를 처리할 것을 의미
  - void를 반환할 때도 필요하다.
  - bound 될 수 있음.
  - 콤마를 사용해서 여러개의 타입 파리미터를 가질 수 있음.
- List<T>
  - 메서드가 반환하는 타입. 제네릭 타입 T를 요소로 가지는 리스트를 반환.
- T[]
  - 제네릭 타입 T의 배열을 파라미터로 받는다.

## Bounded Generics

### 상한경계 (Upper Bound)

```java
public <T extends Number> List<T> fromArrayToList(T[] a) {
    ...
}
```

- 특정 클래스나 인터페이스를 상속받거나 구현한 클래스여야 함
- **extend** 키워드를 사용
- 상한 경계를 사용하면 타입 안전성을 높일 수 있고, 특정 타입의 메서드나 필드를 사용할 수 있다.


### 하한경계 (Lower Bound)

```java
public static void addNumbers(List<? super Integer> list) {
  ...
}
```
- **super** 키워드를 사용
- 제네릭 타입 파라미터가 특정 클래스나 인터페이스의 슈퍼타입이어야 한다는 것을 의미
- 주로 와일드카드(**? super Type**)와 함께 사용
- 와일드카드는 제네릭 타입의 불특정성을 나타내기 때문에, 하한 경계를 사용할 때는 와일드카드(?)와 함께 사용하여 제네릭 타입의 상위 타입을 포괄적으로 나타내줌.


### 다중 경계 (Multiple Bounds)

