# Java Generics

> 최종 업데이트: 2026-03-27 | Java 21 기준

## 쉽게 이해하기
- 택배 상자에 "의류 전용", "전자기기 전용" 라벨을 붙이는 것과 같음
  - 라벨 없는 상자(`List`)에는 아무거나 넣을 수 있지만, 꺼낼 때 뭐가 나올지 모름 → 런타임 에러 위험
  - 라벨을 붙인 상자(`List<String>`)는 컴파일러가 다른 물건을 넣으려 하면 막아줌 → 타입 안전

## 개념

컴파일 타임에 타입을 지정하여, 잘못된 타입 사용을 사전에 방지하는 기능.

```java
// 제네릭 미사용 — 꺼낼 때 캐스팅 필요, ClassCastException 위험
List list = new LinkedList();
list.add("hello");
Integer i = (Integer) list.get(0); // 런타임 에러

// 제네릭 사용 — 컴파일 시점에 타입 체크
List<String> list = new LinkedList<>();
list.add("hello");
list.add(1); // 컴파일 에러
```

## 제네릭을 쓰는 이유

| 이유 | 설명 |
|------|------|
| 타입 안전성 | 컴파일 시점에 타입 오류를 잡아냄 |
| 캐스팅 제거 | `(String) list.get(0)` 같은 명시적 캐스팅이 불필요 |
| 코드 재사용 | 하나의 클래스/메서드로 여러 타입을 처리 |

## 타입 파라미터 컨벤션

| 기호 | 의미 |
|------|------|
| `T` | Type |
| `E` | Element (컬렉션) |
| `K` | Key |
| `V` | Value |
| `N` | Number |
| `?` | Wildcard (불특정 타입) |

## Generic Class

```java
public class Box<T> {
    private T item;

    public void set(T item) { this.item = item; }
    public T get() { return item; }
}

Box<String> strBox = new Box<>();
strBox.set("hello");
String s = strBox.get(); // 캐스팅 불필요
```

## Generic Method

메서드 단위로 타입 파라미터를 선언. 클래스가 제네릭이 아니어도 사용 가능.

```java
// 단일 타입 파라미터
public <T> List<T> fromArrayToList(T[] a) { ... }

// 복수 타입 파라미터
public static <T, U> List<Object> combine(T[] arr1, U[] arr2) { ... }
```

- `<T>` — 반환 타입 앞에 위치하며, 이 메서드가 제네릭임을 선언
- 반환 타입이 `void`여도 `<T>` 선언은 필요

## Generic Interface

```java
public interface Comparable<T> {
    int compareTo(T o);
}

public class Student implements Comparable<Student> {
    @Override
    public int compareTo(Student o) { ... }
}
```

## Bounded Generics

타입 파라미터에 제약을 걸어 사용 가능한 타입 범위를 제한.

### 상한 경계 (Upper Bound) — `extends`

```java
// T는 Number 또는 그 하위 타입만 허용
public <T extends Number> double sum(List<T> list) {
    return list.stream().mapToDouble(Number::doubleValue).sum();
}

sum(List.of(1, 2, 3));       // OK (Integer extends Number)
sum(List.of("a", "b"));      // 컴파일 에러
```

- `extends`는 클래스 상속과 인터페이스 구현 모두에 사용 (제네릭에서는 `implements` 안 씀)

### 하한 경계 (Lower Bound) — `super`

```java
// Integer 또는 그 상위 타입(Number, Object)의 리스트만 허용
public static void addNumbers(List<? super Integer> list) {
    list.add(1);
    list.add(2);
}
```

- 와일드카드(`?`)와 함께 사용
- 주로 **컬렉션에 값을 쓸 때** 사용

### 다중 경계 (Multiple Bounds)

```java
// T는 Number를 상속하면서 Comparable도 구현해야 함
public <T extends Number & Comparable<T>> T max(T a, T b) {
    return a.compareTo(b) >= 0 ? a : b;
}
```

- `&`로 여러 타입을 연결
- 클래스는 최대 1개, 인터페이스는 여러 개 가능
- 클래스가 있으면 반드시 **첫 번째**에 위치해야 함

## Wildcard (`?`)

제네릭 타입의 인자를 유연하게 받기 위해 사용.

| 종류 | 문법 | 의미 |
|------|------|------|
| Unbounded | `List<?>` | 모든 타입 |
| Upper Bounded | `List<? extends Number>` | Number 또는 하위 타입 |
| Lower Bounded | `List<? super Integer>` | Integer 또는 상위 타입 |

### PECS 원칙 (Producer Extends, Consumer Super)

```
읽기(produce) → ? extends T
쓰기(consume) → ? super T
```

```java
// Producer — 컬렉션에서 꺼내 읽기만 함
public double sum(List<? extends Number> list) {
    return list.stream().mapToDouble(Number::doubleValue).sum();
}

// Consumer — 컬렉션에 값을 넣기만 함
public void fill(List<? super Integer> list, int count) {
    for (int i = 0; i < count; i++) list.add(i);
}
```

- `Collections.copy(dest, src)`가 대표적인 예시
  - `dest`: `List<? super T>` (Consumer)
  - `src`: `List<? extends T>` (Producer)

## Type Erasure

제네릭은 **컴파일 타임에만 존재**하고, 컴파일 후 바이트코드에서는 타입 정보가 제거됨.

```java
// 컴파일 전
List<String> list = new ArrayList<>();

// 컴파일 후 (바이트코드)
List list = new ArrayList();  // 타입 파라미터 제거됨
```

이로 인한 제약:
- `new T()`, `new T[]` 불가 — 런타임에 T의 실제 타입을 모름
- `instanceof List<String>` 불가 — 런타임에 제네릭 타입 정보 없음
- 제네릭 타입으로 오버로딩 불가 — `void print(List<String>)`과 `void print(List<Integer>)`는 erasure 후 같은 시그니처

## 제네릭 타입 파라미터 vs 와일드카드

| 구분 | 타입 파라미터 (`T`) | 와일드카드 (`?`) |
|------|---------------------|------------------|
| 선언 위치 | 클래스/메서드 정의 시 | 메서드 파라미터 등 사용 시 |
| 타입 참조 | 메서드 내에서 T로 참조 가능 | 타입을 참조할 수 없음 |
| 용도 | 타입 간 관계를 표현할 때 | 유연한 파라미터 수용이 목적일 때 |

```java
// T를 반환에도 쓰려면 → 타입 파라미터
public <T> T getFirst(List<T> list) { return list.get(0); }

// 그냥 읽기만 하면 → 와일드카드
public void printAll(List<?> list) { list.forEach(System.out::println); }
```
