# 쓰레드 동기화 synchronization

## 개념

멀티쓰레드의 경우 공유되는 데이터의 값이 각 쓰레드에 의해서 변하지 않도록 하기 위한 개념.

공유 데이터를 사용하는 코드 영역을 임계영역(critical section)으로 지정.

한 쓰레드가 임계영역에 들어오면, 해당 객체의 잠금(lock)을 획득한다.

한 쓰레드가 진행 중인 작업을 다른 쓰레드가 간섭하지 못하도록 막는 것을 쓰레드 동기화 라고 한다.

## synchronized

synchronized 키워드를 사용한 쓰레드 동기화 방식

```java
// 메서드 전체에 키워드를 사용해서 임계 영역으로 설정
public synchronized void aa(){
  ...
}
```

synchronized 메서드가 호출된 시점부터 해당 메서드가 포함된 객체의 lock을 얻어 작업을 수행하고, 종료되면 lock을 반환한다.

```java
// 메서드 안에서 특정 코드를 임계영역으로 설정
synchronized(객체 인스턴스){
  ...
}
```

메서드 안에 특정 부분에 synchronized블럭을 만든다. lock을 얻고 싶은 객체를 변수로 사용하면 된다.

synchronized블럭으로 임계 영역을 최소화해서 효율적으로 만드는 것이 필요하다.

## wait()

## notify()
