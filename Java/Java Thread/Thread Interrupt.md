# 자바 쓰레드를 끝내는 방법

stop() 메서드가 deprecated 되면서 다른 방법이 필요하다.

## Flag 사용하기

## interrupt()

장시간 sleep() 상태이거나, 해제되지 않는 lock을 기다리는 상태라면

스레드가 꺠끗하게 종료되지 않을 위험이 크다.

이때 interrupt()를 사용한다.

## InterruptedException

Thread가 waiting, sleeping 상태일 때, 쓰레드에서 interrupt()가 호출되면 던져지는 예외

`checked exception`이다.

## 참고

https://www.baeldung.com/java-interrupted-exception
