# 자바 interrupted exception

stop() 메서드가 deprecated 되면서 다른 방법이 필요하다.

## interrupted 필드

외부에서 중단 요청을 받았는지 여부를 나타내는 플래그 역할

thread는 생성될 때, interrupted 필드 값이 false로 설정된다. 

interrupt()가 호출되면, interrupted가 true로 된다.

InterruptedException이 발생되면 interrupted가 다시 false로 초기화된다.



## interrupt()

장시간 sleep() 상태이거나, 해제되지 않는 lock을 기다리는 상태라면

스레드가 꺠끗하게 종료되지 않을 위험이 크다.

이때 interrupt()를 사용한다.

- 스레드가 다른 스레드의 작업(잠재적으로 시간이 많이 걸리는 작업)을 인터럽트할 수 있도록 잘 정의된 프레임워크를 제공

- 실행 중인 스레드를 실제로 중단하는 것이 아니라 다음 편리한 기회에 스레드가 **스스로** interrupt 하도록 요청

interrupt() 메서드는 호출된 스레드의 인터럽트 상태를 설정한다.

이 상태는 스레드가 인터럽트 요청을 받았음을 나타내는 플래그입니다.

스레드가 블로킹 상태가 아닐 때 인터럽트 상태가 설정되어도, 스레드는 계속해서 현재 작업을 진행합니다.


## InterruptedException

- Thread가 waiting, sleeping 상태로 진입하면, 스레드의 인터럽트 상태를 확인한다. 

- 이미 인터럽트 상태이면, 즉시 InterruptedException을 발생시키고 동시에 스레드의 인터럽트 상태를 초기화합니다(즉, 인터럽트 상태를 false로 변경).

- sleep()의 시간을 기다리지 않고 즉시 예외가 발생한다.

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
- interrupt 상태를 복원해주지 않으면 다음과 같은 문제가 생긴다.
  - 스레드의 응답 무시: 인터럽트 상태가 복원되지 않으면, 스레드는 자신이 인터럽트되었다는 사실을 인지하지 못합니다. 이로 인해 스레드는 중단 요청을 무시하고 계속 실행될 수 있습니다.
  - 리소스 정리 실패: 인터럽트는 종종 중요한 자원을 정리하고 스레드를 안전하게 종료하기 위한 메커니즘으로 사용됩니다. 인터럽트 상태가 복원되지 않으면, 이러한 정리 작업이 제대로 이루어지지 않을 수 있습니다.
  - 스레드 행동의 예측 불가: 스레드가 나중에 인터럽트 상태를 확인해야 하는 경우, 인터럽트 상태가 올바르게 설정되어 있지 않으면 스레드는 예상치 못한 방식으로 동작할 수 있습니다.
  - 멀티스레드 환경의 복잡성 증가: 인터럽트가 적절히 처리되지 않으면, 멀티스레드 환경에서의 동작이 더 복잡하고 예측하기 어려워질 수 있습니다.



## 참고

https://www.baeldung.com/java-interrupted-exception
