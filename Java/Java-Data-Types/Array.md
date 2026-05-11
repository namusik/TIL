# Java Array 


## Array에서 Stream으로

```java
String[] anArray = new String[] {"Milk", "Tomato", "Chips"};
Stream<String> aStream = Arrays.stream(anArray);
```

- Java8 도입
- 배열을 stream으로 변환할 때 사용

## Array 정렬

```java
int[] anArray = new int[] {5, 2, 1, 4, 8};
Arrays.sort(anArray); // anArray is now {1, 2, 4, 5, 8}
```

##  출처

https://www.baeldung.com/java-arrays-guide

https://www.baeldung.com/java-stream-to-array