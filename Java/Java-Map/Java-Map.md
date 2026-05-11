# Java Map

## 정의
- **키(Key)** 와 **값(Value)** 의 쌍으로 데이터를 저장하는 자료구조

### Map.Entry<K,V>
Map interface 안에 있는 Entry interface
entrySet()의 리턴값이 Set<Map.Entry<K,V>>이다.

## 관련 함수

### entrySet()
~~~java
for (Map.Entry<String, String> entry : map.entrySet()) {

}
~~~
Map의 전체 key와 value를 꺼냄


## Collections.emptyMap()

```java
Map<String, Long> typedMap = Collections.emptyMap();
```

- 불변의 비어있는 Map을 반환
- 실제로는 Map<K, V>를 반환하는 제네릭 메서드이기 때문에 어떤 타입의 Map으로도 캐스팅이 된다.
- 매번 새로운 빈 Map 객체를 생성하는 대신, 항상 같은 싱글톤 인스턴스를 반환하기 때문에 메모리 효율적
- 명시적으로 빈 Map을 사용한다는 의도를 표현 가능

### computeIfAbsent()

```java

```

- 1. containsKey(key)와 유사한 해시 조회
  - 키가 있으면 바로 값 반환
- 2. **없거나 값이 null**이면 람다(Function<K,V>) 호출
  - 새 객체 생성
- 3. put(key, value) 호출 (원자적)
  - 맵에 저장
- 4. 반환(return)
  - 1 또는 2 에서 얻은 Value 반환
