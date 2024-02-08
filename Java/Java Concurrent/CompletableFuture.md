# CompletableFuture

## 배경
- 비동기 계산은 추론하기 어렵다. 
- 비동기 계산의 경우 callback으로 표현되는 동작이 코드에 흩어져 있거나 서로 중첩되어 있는 경향이 있기 때문.
- java5의 Future 인터페이스는 계산을 결합거나 오류처리 메서드가 없었음.


## 개념
- Java8에서 동시성 API 개선을 위해 Future를 개선한 클래스로 도입됨.
  - 외부에서 완료시킬 수 있게됨
- CompletionStage 인터페이스도 구현됨.
  - 작업들을 중첩시키거나 완료 후 콜백을 위해 추가
  - "몇 초 이내에 응답이 안오면 기본값 반환" 과 같은 작업 
- 비동기 계산 step을 구성, 결합, 실행하고 오류를 처리하는 50가지 메서드가 구현됨

## CompletableFuture를 단순히 Future로 사용하기


## 출처

https://www.baeldung.com/java-completablefuture