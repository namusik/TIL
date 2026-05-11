# Java List


## List

### 개념
- 인터페이스
- 구현체(ArrayList, LinkedList, CopyOnWriteArrayList 등)의 “행동 규약”만 정의

### 다이아몬드 연산자 (< >)
- Java 7+부터 도입
- 우측 제네릭 타입을 생략해도 컴파일러가 추론 할 수 있게됨.

```java
Java 6 : List<List<Animal>> list = new ArrayList<List<Animal>>();

Java 7+ : List<List<Animal>> list = new ArrayList<>();
```

### 실무 팁
- 왼쪽 타입은 인터페이스로 선언하라
  - 선언부는 **인터페이스**(List, Map, Set) 로 하고
  - 생성부만 **구현체**(ArrayList, HashMap, HashSet) 로 한다.


## List 구현체
### ArrayList

#### 개념
- List 인터페이스의 구체 구현체입니다.
- 내부적으로 배열 기반으로 데이터를 저장
- 장점:
  - 인덱스 접근이 O(1)
  - 대부분의 일반적인 리스트 작업이 빠름
- 단점:
  - 중간 삽입/삭제는 느림
  - 크기 변경 시 전체 복사 발생 가능

~~~java
List<String> lists = new ArrayList<>();
~~~

- List 인터페이스의 크기 조정 가능한 배열 구현
- ArrayList 인스턴스 반환
- 변경이 가능하다.
  - add, remove, set 가능



------------------------------------

## Array에서 List 만들기
### Arrays.asList()
```java
String[] array = {"foo", "bar"};    

List<String> list = Arrays.asList(array);
```
- ArrayList 반환.
  - 여기서 반환하는 ArrayList는 java.util.ArrayList 인스턴스가 아니라, Arrays 클래스 내부에 있는 static class 이다.
- 크기가 고정되어 있다.
  - add, remove 불가
  - UnsupportedOperationException 런타임 예외를 발생시킨다.
- 또한, **원본 배열에 참조**를 하고 있기 때문에, 원본 배열이 변경되면, ArrayList의 값 역시 변경된다.

------------------------------------

## Stream에서 List 만들기
```java
List<String> list = Stream.of("foo", "bar")
        .toList();
```
- Java8에서 도입됨.
- 주의할점은, 반환하는 List의 구현체가 지정되어있지 않다는 점이다. 
  - ArrayList인지, LinkedList인지 모름. 
- 스트림 작업 시, 특히 변환이나 필터를 처리할 때, 변경 가능한 목록이 필요할 때 이 접근 방식을 사용한다.
- 성능적으로는 Arrays.asList()와 별 차이가 없다.

------------------------------------

## Factory Method로 List 만들기
```java
List<String> list = List.of("foo", "bar", "baz");
```
- Java9에서 도입됨.
- ImmutableCollections 클래스의 list를 반환
- ArrayList에 비해 공간 효율적일 수 있음. 불변이기 때문에 JVM에 의해 내부적으로 최적화될 수 있으므로 정확한 메모리 공간은 더 작을 수 있다.
- 불변이기 때문에 본질적으로 스레드로부터 안전하다. 여러 스레드가 동기화 문제 없이 해당 상태에 액세스할 수 있음.
  - add, remove, set 불가능

------------------------------------


## Collections.singletonList()
~~~java
public static <T> List<T> singletonList(T o) {
    return new SingletonList<>(o);
}
~~~
- Collections의 내부 정적 클래스인 SingletonList 인스턴스를 반환.
- 불면이면서 하나의 객체를 가질 수 있는 리스트. 불변이기 때문에 add, remove, set 불가능.
- 메모리를 효율적으로 사용하기 때문에, 단일 요소 리스트를 만들 때는 `Arrays.asList` 보다 `Collections.singletonList`를 권장
- List.of()와 비교한다면 효율성 측면에서 별 차이는 없다.

------------------------------------

## ListUtils.partition(List, int)

- Apache Commons Collections
- 주어진 리스트를 지정한 크기(size)만큼 잘라 여러 개의 “독립된(sub-list 복사)” 리스트로 나누는 기능
- Java 표준 라이브러리에는 없는 기능이므로, 범용 배치 처리나 chunk 작업에서 많이 활용됨.

### 의존성
```gradle
implementation 'org.apache.commons:commons-collections4:4.4'
```

### 동작방식
```java
List<Integer> numbers = Arrays.asList(1,2,3,4,5,6,7,8,9,10);

List<List<Integer>> partitions = ListUtils.partition(numbers, 3);

for (List<Integer> part : partitions) {
    System.out.println(part);
}

[1, 2, 3]
[4, 5, 6]
[7, 8, 9]
[10]
```

### 특징
- “복사 기반”으로 서브 리스트를 만든다 (독립된 리스트)
  - 결과 리스트(List<List<T>>)의 각 원소는 원본 리스트의 요소를 새로운 ArrayList로 복사한 독립된 리스트
  - **즉, 원본 리스트를 수정해도 partition 결과는 바뀌지 않는다.**
  - **동시성 환경**(EKS Worker thread, AWS Lambda, Kafka Listener)에서도 안전하게 쓰기 좋다.
- 마지막 파티션은 size보다 작을 수 있음
- 원본 리스트가 null이면 NullPointerException 발생
- size < 1 이면 IllegalArgumentException 발생

### 복잡도
시간 복잡도 O(N)
→ 내부적으로 모든 요소를 복사하기 때문에 총 N개 요소를 그대로 순회합니다.

공간 복잡도 O(N)
→ 복사 기반이므로 N개의 요소가 새 리스트들 안에 다시 저장됩니다.

### 실무 사용 패턴
- 대량 데이터를 외부 API 호출에 배치 처리할 때
  - 외부 요건(API 제한, Kafka batch produce 등)에서 “**최대 N개씩 처리**”가 필요할 때 적합하다.
```java
List<Order> orders = loadOrders();

List<List<Order>> chunks = ListUtils.partition(orders, 100);

for (List<Order> batch : chunks) {
    externalApi.send(batch);
}
```

- DB Bulk Insert / jOOQ batchBind 단계
```java
for (List<MyEntity> batch : ListUtils.partition(entities, 100)) {
    dsl.batchInsert(batch).execute();
}
```

- 스레드 풀에서 병렬 처리 시
```java
ExecutorService executor = Executors.newFixedThreadPool(4);

for (List<Task> group : ListUtils.partition(tasks, 200)) {
    executor.submit(() -> process(group));
}
```

### Apache partition 선택 기준
1. 원본 리스트를 변경할 가능성이 있거나
2. 멀티스레드 환경에서 파티션을 안전하게 넘겨야 하거나
3. “독립된 리스트”가 필요한 경우

### Guava Lists.partiont과의 비교
1. 원본에 대한 뷰(view)만 필요하고
2. 메모리 효율이 중요한 환경이라면
Guava Lists.partition 고려


## 출처
https://www.baeldung.com/java-init-list-one-line
https://www.baeldung.com/java-aslist-vs-singletonlist
https://www.baeldung.com/java-arraylist

