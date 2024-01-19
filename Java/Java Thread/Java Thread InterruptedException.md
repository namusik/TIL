# 자바 interrupted exception

stop() 메서드가 deprecated 되면서 다른 방법이 필요하다.

## Flag 사용하기

## interrupt()

장시간 sleep() 상태이거나, 해제되지 않는 lock을 기다리는 상태라면

스레드가 꺠끗하게 종료되지 않을 위험이 크다.

이때 interrupt()를 사용한다.

- 스레드가 다른 스레드의 작업(잠재적으로 시간이 많이 걸리는 작업)을 인터럽트할 수 있도록 잘 정의된 프레임워크를 제공

- 실행 중인 스레드를 실제로 중단하는 것이 아니라 다음 편리한 기회에 스레드가 **스스로** interrupt 하도록 요청

## InterruptedException

- Thread가 waiting, sleeping 상태일 때, 쓰레드에 interrupt()가 호출되면 InterruptedException을 발생시키고 동시에 스레드의 인터럽트 상태를 초기화합니다(즉, 인터럽트 상태를 false로 변경).

- `checked exception`이다.

```java
try {
  Thread.sleep(1000);
} catch (InterruptedException e) {
  //sleep이 끝났을 때, interrupt()가 예약되어있는 쓰레드라면 InterruptedException이 발생할 것이므로. catch로 잡아준다.
  System.out.println("InterruptedException 발생");
  Thread.currentThread().interrupt();
}
```

## 쓰레드 상태 복원
- Thread.currentThread().interrupt()를 호출하는 이유는 
- InterrupedException이 발생하면 쓰레드의 interrupt 상태는 자동으로 초기화되고, 쓰레드가 interrupt 되었다는 정보가 사라진다.
- 쓰레드의 interrupt 상태를 다시 설정해서, 나중에 해당 쓰레드를 처러할 떄 interrupt 된 것을 알 수 있다.

## 참고

https://www.baeldung.com/java-interrupted-exception
