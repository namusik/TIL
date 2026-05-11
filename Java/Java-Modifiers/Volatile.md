# Volatile

## 기본 배경 - 자바 메모리 모델(JMM)

- 멀티스레드 환경에서는 각 CPU 코어가 캐시를 사용
  - 따라서 하나의 쓰레드에서 값을 변경해도, 다른 쓰레드가 바로 그 값을 메인 메모리(Main Memory) 에서 다시 읽지 않으면 변경 사실을 모름.


```java
class Flag {
    boolean running = true;
}

Thread A: while (flag.running) { ... }
Thread B: flag.running = false;
```

- Thread B가 running = false를 썼어도, Thread A가 CPU 캐시에만 있는 오래된 true 값을 계속 읽으면 무한 루프가 됨.

## 정의

- volatile을 붙이면 자바 메모리 모델에서 두 가지 효과를 보장

### 가시성 보장 (Visibility)

- volatile 변수에 쓰기(write) 연산이 발생하면, 값이 즉시 메인 메모리에 기록
- 다른 쓰레드가 이 변수를 읽을 때는 **항상 메인 메모리에서 읽음**을 보장


```java
class Flag {
    volatile boolean running = true;
}
```
- Thread B의 변경 사항을 Thread A가 즉시 볼 수 있음.

### happens-before 관계와 재배치 방지(Ordering)

- JIT 컴파일러나 CPU는 성능 최적화를 위해 **명령어를 재배치(reordering)**할 수 있음.
- 하지만 volatile 변수에 대한 **쓰기(write)** 는 이전의 모든 연산이 끝난 후 수행되어야 하고, volatile 변수에 대한 읽기(read) 는 이후의 모든 연산보다 먼저 수행되어야 합니다.
- 즉, volatile은 메모리 장벽(Memory Barrier) 효과를 줍니다.

## 한계 

- 원자성 미보장
  - volatile은 읽기/쓰기의 **단일 연산**에 대해서만 안전
  - count++ 같은 **복합 연산**은 여전히 경쟁 조건(race condition)이 있음.
  - AtomicInteger 또는 synchronized 함수 필요


## 참고
https://www.baeldung.com/java-volatile