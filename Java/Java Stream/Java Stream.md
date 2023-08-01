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


## 참고

https://futurecreator.github.io/2018/08/26/java-8-streams/

https://zangzangs.tistory.com/171