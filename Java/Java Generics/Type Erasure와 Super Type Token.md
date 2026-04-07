# Type Erasure와 Super Type Token

> 최종 업데이트: 2026-03-27 | Java 21 기준

## Type Erasure

컴파일러가 제네릭 타입 정보를 검증한 뒤, 바이트코드에서는 제거하는 메커니즘.

- 제네릭은 **컴파일러가 붙여주는 포스트잇**과 같음 — 컴파일할 때는 보고 타입 체크를 하지만, 바이트코드로 만들 때 떼버림
- Java 5에서 제네릭이 추가될 때, 기존 코드와의 **하위 호환성**을 위해 이 방식을 채택 (제네릭 없는 `List`와 `List<String>`이 런타임에 같은 클래스)

### erasure 규칙

```java
// 컴파일 전
public <T> T getValue(List<T> list) {
    return list.get(0);
}

// 컴파일 후 (바이트코드)
public Object getValue(List list) {
    return (Object) list.get(0);
}
```

| 컴파일 전 | erasure 후 |
|-----------|-----------|
| `T` (unbounded) | `Object` |
| `T extends Number` | `Number` (첫 번째 bound로 치환) |
| `List<String>` | `List` |
| `Map<String, Integer>` | `Map` |

### Bridge Method

- erasure로 인해 다형성이 깨지는 것을 방지하기 위해 **컴파일러가 자동 생성하는 메서드**
- 쉽게 말해, erasure 때문에 시그니처가 달라진 메서드를 **원래 의도대로 연결해주는 다리**

```java
public class StringBox implements Box<String> {
    @Override
    public void set(String item) { ... }  // 개발자가 작성
}

// 컴파일러가 자동 생성하는 Bridge Method
// Box의 set(Object)를 오버라이드하면서, 실제 set(String)으로 위임
public void set(Object item) {        // ← bridge method
    set((String) item);
}
```

### erasure 때문에 안 되는 것들

```java
new T();                            // 런타임에 T의 실제 타입을 모름
new T[10];                          // 제네릭 타입 배열 생성 불가
obj instanceof List<String>         // 런타임에 타입 파라미터 정보 없음
```

```java
// erasure 후 시그니처가 같아지므로 오버로딩 불가
void process(List<String> list)  {}
void process(List<Integer> list) {} // 컴파일 에러 — 둘 다 process(List)
```

### Reifiable vs Non-Reifiable Type

- **Reifiable** — 런타임에 타입 정보가 완전히 유지되는 타입. erasure 영향 없음
- **Non-Reifiable** — erasure로 인해 런타임에 타입 정보가 일부 손실되는 타입

| 분류 | 예시 | 런타임 타입 정보 |
|------|------|-----------------|
| Reifiable | `String`, `Integer`, `List<?>`, `Map<?,?>` | 완전 유지 |
| Non-Reifiable | `List<String>`, `Map<String, Integer>`, `T` | 일부 손실 |

- Unbounded Wildcard(`?`)는 애초에 특정 타입을 지정하지 않으므로 erasure 영향 없이 reifiable

### erasure 되지 않는 곳

클래스의 **상속/구현 관계에 명시된 타입 정보**는 바이트코드에 보존됨.

```java
// 이 "extends TypeReference<Map<String, Object>>" 정보는 보존됨
class MyType extends TypeReference<Map<String, Object>> {}
```

리플렉션으로 조회 가능:
```java
Type superClass = MyType.class.getGenericSuperclass();
// → TypeReference<Map<String, Object>>  ← 타입 정보 살아있음
```

이것이 Super Type Token의 핵심 원리.

## Super Type Token

런타임에도 제네릭 타입 정보를 유지하기 위해, **익명 클래스의 상속 관계**에 타입을 기록하는 패턴.

- 상자에 포스트잇을 붙이면 떨어지지만(erasure), **상자 설계도에 "이 상자는 의류 전용 상자를 상속했다"고 적으면** 그 정보는 남음 — 설계도(클래스 메타데이터)에 적힌 상속 관계를 읽는 것이 Super Type Token

### 원리

```java
// 일반 인스턴스 — 타입 정보 사라짐
TypeReference<Map<String, Object>> ref = new TypeReference<>();  // ✗

// 익명 클래스 — 상속 관계에 타입 정보 보존됨
TypeReference<Map<String, Object>> ref = new TypeReference<>() {};  // ✓
//                                                              ^^ 핵심
```

`{}`가 붙으면 `TypeReference<Map<String, Object>>`를 상속한 **익명 클래스**가 생성되고, 그 상속 정보에 `Map<String, Object>`가 보존됨.

### 내부 구조 (Jackson TypeReference)

```java
public abstract class TypeReference<T> {
    protected final Type _type;

    protected TypeReference() {
        Type superClass = getClass().getGenericSuperclass();
        _type = ((ParameterizedType) superClass).getActualTypeArguments()[0];
    }

    public Type getType() { return _type; }
}
```

흐름:
```
new TypeReference<List<UserDto>>() {}
  → getClass()                        // 익명 클래스
  → getGenericSuperclass()            // TypeReference<List<UserDto>>
  → getActualTypeArguments()[0]       // List<UserDto>  ← 타입 정보 획득
```

### 한계

- 매번 **익명 클래스가 생성**되므로 클래스 수가 늘어남 (`.class` 파일 하나씩 추가)
- 중첩된 제네릭 타입 비교가 까다로움 (`List<List<String>>` 등)
- Spring의 `ResolvableType`은 이 한계를 보완하여 중첩 타입까지 탐색 가능

## 실무에서 만나는 Super Type Token

### Jackson — `TypeReference`

```java
// JSON → Map<String, Object>
Map<String, Object> map = objectMapper.readValue(json,
    new TypeReference<Map<String, Object>>() {});

// JSON → List<UserDto>
List<UserDto> users = objectMapper.readValue(json,
    new TypeReference<List<UserDto>>() {});
```

- 단순 클래스(`UserDto.class`)로 충분한 경우에는 `TypeReference` 불필요
- **제네릭 타입**(`List<T>`, `Map<K,V>`)을 역직렬화할 때만 필요

### Spring WebClient — `ParameterizedTypeReference`

```java
List<UserDto> users = webClient.get()
    .uri("/users")
    .retrieve()
    .bodyToMono(new ParameterizedTypeReference<List<UserDto>>() {})
    .block();
```

### Spring RestTemplate — `ParameterizedTypeReference`

```java
ResponseEntity<List<UserDto>> response = restTemplate.exchange(
    "/users", HttpMethod.GET, null,
    new ParameterizedTypeReference<List<UserDto>>() {});
```

### Spring — `ResolvableType`

Super Type Token의 한계를 보완한 Spring의 타입 해석 유틸리티.

```java
// 중첩 제네릭 타입도 탐색 가능
ResolvableType type = ResolvableType.forClassWithGenerics(List.class, UserDto.class);
// List<UserDto>

ResolvableType mapType = ResolvableType.forClassWithGenerics(
    Map.class, String.class, List.class);
// Map<String, List>
```

- 익명 클래스 없이도 프로그래밍 방식으로 제네릭 타입 구성 가능
- Spring 내부에서 DI, 타입 변환, 메시지 컨버터 등에 광범위하게 사용

## 정리

```
제네릭 변수         → 런타임에 타입 정보 사라짐 (erasure)
클래스 상속 관계     → 런타임에 타입 정보 보존됨 (Super Type Token이 이용하는 곳)
```

| 구분 | 클래스 | 사용처 |
|------|--------|--------|
| Jackson | `TypeReference<T>` | ObjectMapper 역직렬화 |
| Spring Web | `ParameterizedTypeReference<T>` | WebClient, RestTemplate |
| Spring Core | `ResolvableType` | DI, 타입 변환, 메시지 컨버터 |
| Guava | `TypeToken<T>` | 범용 타입 토큰 |
