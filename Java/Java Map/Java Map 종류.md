# Map 종류

## 구조
![map](../../images/Java/map.png)

## HashMap
- synchronized 키워드가 존재하지 않음.
- 성능이 제일 좋지만, multi-thread에서 사용 불가.
- 데이터를 저장할 때 순서를 전혀 보장하지 않는다
  - 삽입한 순서와 다르게 데이터가 저장되거나 조회

## LinkedHashMap

- Map의 특징과 List의 특징을 결합한 자료구조
- 기본적으로 Map이기 때문에 키-값 쌍으로 데이터를 저장하고, 키를 통해 값을 빠르게 조회가능
- HashMap과 동일하게 Key는 중복 불가
- HashMap과는 달리 데이터를 삽입한 **순서(insertion order)** 를 기억하고 유지
  - 이것이 가능한 이유는 내부적으로 **양방향 연결 리스트(doubly linked list)** 를 가지고 있기 때문.
  - 이 연결 리스트는 LinkedHashMap에 저장된 모든 키-값 쌍(엔트리)들을 삽입된 순서대로 연결.
  - entrySet()은 이 내부 양방향 연결 리스트 덕분에 데이터가 LinkedHashMap에 추가된 순서 그대로 엔트리들을 반환
- Map처럼 키-값 쌍으로 데이터를 저장해야 하지만, 동시에 데이터가 삽입된 순서를 유지해야 할 때 유용
  - 예를 들어, 사용자 인터페이스에서 입력 필드의 순서를 기억하거나, 캐시에서 가장 오래된(혹은 가장 최근에 사용된) 항목을 쉽게 제거해야 할 때 유용하게 쓰인다.

## MultiValueMap

    키의 중복이 허용됨.

    덮어쓰기 되지 않음.

    list대신 쓰는 이유는 시간복잡도 때문

## ConcurrentHashMap
multi-thread 환경에서 사용할 수 있도록 나온 클래스.

synchronized 키워드가 get()에는 없고 put()에는 중간 중간에 있음. 

읽기 작업에는 여러 쓰레드가 동시에 할 수 있지만, 쓰기 작업에는 버킷 단위 당 Lock 사용.

같은 버킷에 쓰기 작업을 할 때, LOCK이 적용된다. 

## TreeMap

## 참고

https://devlog-wjdrbs96.tistory.com/269