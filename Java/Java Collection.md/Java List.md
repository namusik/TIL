# Java List

## List 생성 방법 
### new ArrayList

~~~java
List<String> lists = new ArrayList<>();
~~~

`ArrayList`를 인스턴스로 만들어 쓰는 방법이다.



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
- 변경불가능한 list를 반환한다.
  - ImmutableCollections 클래스의 list를 반환
- ArrayList에 비해 공간 효율적일 수 있음. 불변이기 때문에 JVM에 의해 내부적으로 최적화될 수 있으므로 정확한 메모리 공간은 더 작을 수 있다.
- 불변이기 때문에 본질적으로 스레드로부터 안전하다. 여러 스레드가 동기화 문제 없이 해당 상태에 액세스할 수 있음.

------------------------------------


## Collections.singletonList()
~~~java
public static <T> List<T> singletonList(T o) {
    return new SingletonList<>(o);
}
~~~
- Collections의 내부 정적 클래스인 SingletonList 인스턴스를 반환.
- 불면이면서 하나의 객체를 가질 수 있는 리스트. 불변이기 때문에 add, remove 불가능.
- set으로 단일 요소 수정은 가능하다.
- 메모리를 효율적으로 사용하기 때문에, 단일 요소 리스트를 만들 때는 `Arrays.asList` 보다 `Collections.singletonList`를 권장
- List.of()와 비교한다면 효율성 측면에서 별 차이는 없다.


## 출처
https://www.baeldung.com/java-init-list-one-line
https://www.baeldung.com/java-aslist-vs-singletonlist
https://www.baeldung.com/java-arraylist