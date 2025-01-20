# ThreadLocal

## 개념
- 각 스레드마다 독립적인 변수를 가질 수 있도록 지원하는 클래스
- 독립적인 변수
  - ThreadLocal을 사용하면 **각 스레드마다 독립적인 변수 복사본**을 가진다
  - 즉, 하나의 ThreadLocal 인스턴스가 여러 스레드에서 사용되더라도 각 스레드는 자신만의 값을 유지
- 스레드 안전성 
  - 여러 스레드가 동시에 동일한 ThreadLocal 변수를 접근하더라도, 각 스레드는 자신의 로컬 변수에만 접근하기 때문에 동기화 문제를 신경 쓸 필요가 없어짐

## 예제
```java
public class ThreadLocalExample {
    // ThreadLocal 변수 선언
    private static ThreadLocal<Integer> threadLocal = ThreadLocal.withInitial(() -> 0);

    public static void main(String[] args) {
        // 두 개의 스레드 생성
        Runnable task = () -> {
            // 현재 스레드의 ThreadLocal 값 가져오기
            Integer value = threadLocal.get();
            System.out.println(Thread.currentThread().getName() + " 초기 값: " + value);
            
            // 값 설정
            threadLocal.set(value + 1);
            System.out.println(Thread.currentThread().getName() + " 변경된 값: " + threadLocal.get());
        };

        Thread thread1 = new Thread(task, "스레드-1");
        Thread thread2 = new Thread(task, "스레드-2");

        thread1.start();
        thread2.start();
    }
}

스레드-1 초기 값: 0
스레드-1 변경된 값: 1
스레드-2 초기 값: 0
스레드-2 변경된 값: 1
```

## 주의점
- 메모리 누수 방지: 
  - ThreadLocal은 스레드가 종료될 때 자동으로 정리되지 않을 수 있다.
  - 특히, 스레드 풀을 사용하는 경우, 스레드가 재사용되면서 이전 스레드의 ThreadLocal 값이 남아 있을 수 있음.
  - 이를 방지하기 위해 작업이 끝난 후 remove() 메서드를 호출하여 값을 제거하는 것이 좋다.
  - threadLocal.remove();
- 초기화
  - ThreadLocal 변수를 사용할 때는 초기값을 명확히 설정하거나, 사용 전에 값을 설정하는 것이 중요.
  - 그렇지 않으면 null 값을 참조할 위험이 있다.