# Java Stream

[공식문서](https://docs.oracle.com/en/java/javase/20/docs/api/java.base/java/util/stream/Stream.html)

[baeldung](https://www.baeldung.com/java-8-streams)

## 개념
A sequence of elements supporting sequential and parallel aggregate operations.

Collection 반복을 처리해주는 기능.

멀티쓰레드 코드를 구현하지 않아도 병렬 처리 가능.

## 특징
* **No storage** : Stream은 값을 저장하는 공간이 따로 없다. data structure에서 가져온 값들을 opertaion pipeline을 통해 운반한다.
* **Functional in nature** : Stream은 결과를 만들어 내지만, data source의 값을 바꾸진 않는다. 그래서 Collection이 stream의 source로 쓰일 수 있다.
* **Laziness-seeking** : stream 동작들(filterling, mapping, sorting)들은 lazily 구현된다. 원하는 결과를 얻는데 필요한 만큼만 계산하게 된다. 

## Stream Creation

## find
~~~java
<Optional> findAny() : Stream에서 아무 요소 반환.

<Optional> afindFirst() : Stream에서 첫번째 요소 반환. 그런데 Stream안에는 encount order가 없을 수 있다. 중간 소스와 중간 작업에 따라 다르다. 순서가 없다면, 랜덤으로 나온다.
~~~

## array to stream
`Arrays.stream(배열)`
~~~java
Arrays.stream(request.getCookies())
    .filter(cookie -> cookie.getName().equals(cookieName))
    .findAny()
    .orElse(null);
~~~



## 참고

https://futurecreator.github.io/2018/08/26/java-8-streams/

https://zangzangs.tistory.com/171

https://www.baeldung.com/java-stream-findfirst-vs-findany