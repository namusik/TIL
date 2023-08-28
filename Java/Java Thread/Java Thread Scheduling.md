# 쓰레드 스케쥴링

## Life Cycle of a Thread

![lifecycle](../../Images/Java/threadlifecycle.jpg)

Thread Class는 Enum으로 State를 가지고 있다.

### NEW

아직 start()가 호출되지 않은 새로 생성된 스레드

### RUNNABLE

실행중이거나 실행 준비중인 상태.

### BLOCKED

동기화 블럭에 의해

### WAITING

### TIMED_WAITING

### TERMINATED

## 상태 메서드

### sleep(long millis)

지정된 시간동안 쓰레드를 일시정지.

### join()

지정된 시간동안 쓰레드 실행
시간이 지나거나, 작업이 종료되면 기존의 쓰레드로 복귀

## 참고

https://www.baeldung.com/java-thread-lifecycle
