# Java List

## List 생성 방법 비교
### new ArrayList

~~~java
List<String> lists = new ArrayList<>();
~~~

`ArrayList`를 인스턴스로 만들어 쓰는 방법이다.

### List.of()
~~~java
List<String> list2 = List.of();
//list2.add("dd");
~~~

### Arrays.asList()
크기가 고정되어있는 ArrayList 반환.
add, remove 불가.s

### Collections.singletonList()
~~~java
public static <T> List<T> singletonList(T o) {
    return new SingletonList<>(o);
}
~~~
Collections의 내부 클래스인 SingletonList<>를 반환.

불면이면서 하나의 객체를 가질 수 있는 리스트. 불변이기 때문에 add, remove, set도 불가능

메모리를 효율적으로 사용하기 때문에, `Arrays.asList` 보다 `Collections.singletonList`를 권장
