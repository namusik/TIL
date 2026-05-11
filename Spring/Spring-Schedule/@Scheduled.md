# @Scheduled

## 개념
- @Scheduled 어노테이션을 사용

## 특징
- 함수의 return 타입이 void이어야 한다.
- 함수에 매개변수가 없어야 함.
- 스케줄링을 통해 실행되는 메서드는 별도의 스레드에서 실행되므로 스레드 안전(thread-safe)하게 작성해야함.

## @EnableScheduling
```java
@Configuration
@EnableScheduling
public class SpringConfig {
    ...
}
```
- @Scheduled 어노테이션 활성화를 위한 config annotation
- 기본적으로 `ConcurrentTaskScheduler`를 제공한다.
  - 단일 스레드로 스케줄링 작업을 처리


```java
@Bean
public ThreadPoolTaskScheduler threadPoolTaskScheduler() {
    ThreadPoolTaskScheduler threadPoolTaskScheduler = new ThreadPoolTaskScheduler();
    // 스레드 풀의 크기를 설정.  동시에 실행할 수 있는 스케줄링 작업의 수를 제한
    threadPoolTaskScheduler.setPoolSize(10);
    // 스레드 이름의 접두사를 설정. 스레드 덤프를 분석하거나 로그를 확인할 때 유용
    threadPoolTaskScheduler.setThreadNamePrefix("threadPoolTaskScheduler");
    // 애플리케이션 종료 시 현재 실행 중인 작업이 완료될 때까지 기다림
    threadPoolTaskScheduler.setWaitForTasksToCompleteOnShutdown(true);
    //  애플리케이션이 종료될 때 최대 60초 동안 현재 실행 중인 작업이 완료되기를 기다림.
    threadPoolTaskScheduler.setAwaitTerminationSeconds(60);
    //  작업이 취소되었을 때, 해당 작업을 큐에서 제거
    threadPoolTaskScheduler.setRemoveOnCancelPolicy(true);
    // 스케줄러 초기화
    threadPoolTaskScheduler.initialize();
    return threadPoolTaskScheduler;
}
```
- 추가적으로 다중 스레드로 스케줄링을 처리할 때는 `ThreadPoolTaskScheduler`를 Bean으로 등록해주면 된다.
- 동일한 작업에 대해서는 순차적인 실행을 보장하지만 서로 다른 작업들은 병렬적으로 한다.

## 기본 스케쥴러 vs ThreadPoolTaskScheduler

```java
@Scheduled(fixedRate = 1000)
public void scheduleFixedRateTask() throws InterruptedException {
    String name = Thread.currentThread().getName();
    log.info("scheduleFixedRateTask start :: {}", name);
    log.info("threadPoolTaskScheduler pool size: {}", threadPoolTaskScheduler.getPoolSize());
    log.info("threadPoolTaskScheduler active count: {}", threadPoolTaskScheduler.getActiveCount());
    Thread.sleep(10000);
    log.info("scheduleFixedRateTask end :: {}", name);
}

@Scheduled(fixedRate = 1000)
public void scheduleFixedRateTask2() throws InterruptedException {
    String name = Thread.currentThread().getName();
    log.info("scheduleFixedRateTask2 start :: {}", name);
    log.info("threadPoolTaskScheduler2 pool size: {}", threadPoolTaskScheduler.getPoolSize());
    log.info("threadPoolTaskScheduler2 active count: {}", threadPoolTaskScheduler.getActiveCount());
}
```
- 동시에 동작하는 스케줄러를 2개를 세팅 
  - 1번 스케줄러는 고의적으로 작업완료에 10초를 부과
- 기본 스케줄러
  - 2024-06-12T13:25:08.313+09:00  scheduleFixedRateTask start :: scheduling-1
    2024-06-12T13:25:08.313+09:00  threadPoolTaskScheduler pool size: 1
    2024-06-12T13:25:08.313+09:00  threadPoolTaskScheduler active count: 1
    2024-06-12T13:25:18.319+09:00  scheduleFixedRateTask end :: scheduling-1
    2024-06-12T13:25:18.320+09:00  scheduleFixedRateTask2 start :: scheduling-1
    2024-06-12T13:25:18.321+09:00  threadPoolTaskScheduler2 pool size: 1
    2024-06-12T13:25:18.321+09:00  threadPoolTaskScheduler2 active count: 1
  - 기본스케줄러는 단일 스레드이기 때문에 pool size도 1이고, 동작중인 스레드오 1인 것을 확인 가능.
  - 그렇게 때문에 2번 스케줄러가 1초마다 실행되지 않고 1번스케줄러가 작업이 완료되는 10초마다 동작하는 것을 확인 가능.
- ThreadPoolTaskScheduler
2024-06-12T13:29:19.205+09:00  scheduleFixedRateTask2 start :: threadPoolTaskScheduler2
2024-06-12T13:29:19.205+09:00  scheduleFixedRateTask start :: threadPoolTaskScheduler1
2024-06-12T13:29:19.205+09:00  threadPoolTaskScheduler2 pool size: 2
2024-06-12T13:29:19.205+09:00  threadPoolTaskScheduler pool size: 2
2024-06-12T13:29:19.206+09:00  threadPoolTaskScheduler2 active count: 2
2024-06-12T13:29:19.206+09:00  threadPoolTaskScheduler active count: 2
2024-06-12T13:29:20.207+09:00  scheduleFixedRateTask2 start :: threadPoolTaskScheduler2
  - 1번, 2번 스케줄러가 서로 독립적으로 동작하는 것을 확인 가능.
  - 또한 thread pool에 2개의 스레드가 동작중인 것도 확인 가능.


## @Scheduled
```java
@Scheduled(fixedDelay = 1000)
    @Scheduled(fixedDelay = 1000)
    public void scheduleFixedDelayTask() {}

    @Scheduled(fixedRate = 1000)
    public void scheduleFixedRateTask() {}

    @Scheduled(initialDelay = 10000, fixedRate = 5000)
    public void scheduleInitialDelayTask() {}

    @Scheduled(cron = "0 27 * * * *")
    public void scheduleCronTask() {}
```
- fixedDelay
  - 마지막 실행이 끝나고 다음 실행이 시작될 때까지의 기간이 고정
  - 이전 실행이 완료되어야만 다시 실행할 수 있는 경우에 사용해야 함.
- fixedRate
  - 작업이 일정한 간격으로 반복 실행
  - 각 실행이 독립적인 경우에 사용
  - 동일하게 이전 작업이 완료되어야 다음 작업이 시작된다.
  - 메모리와 스레드 풀의 크기를 초과할 것으로 예상하지 않는다면 fixedRate가 매우 유용
- initialDelay
  -  첫 작업이 시작되기 전에 대기하는 시간
- cron
  - 원하는 날짜와 시간에 작업이 실행되도록 예약


## @Scheduled + @Async
```java
@Async
@Scheduled(fixedRate = 2000)
public void scheduleFixedRateTask() throws InterruptedException {
    log.info("scheduleFixedRateTask start");
    Thread.sleep(4000);
    log.info("scheduleFixedRateTask end");
}
```
- fixedRate와 @Async를 같이 사용하면 이전 작업이 끝나지 않아도 일정한 간격마다 다음 작업이 시작된다.
- 기본스케줄러, ThreadPoolTaskScheduler 무관하게 동작

## 외부 설정 properties
```java
schedule.fixedDelay.milliseconds=3000
```

```java
@Scheduled(fixedDelayString = "${schedule.fixedDelay.milliseconds}")
```

- 코드 내부에 하드코딩하는 것 보다, properties 설정 파일에 저장해두고 불러온다. 
- 이때 fixedDelay는 Long 타입만 받기 때문에, 문자열을 받을 수 있는 `fixedDelayString`를 사용해준다.



## 출처
https://www.baeldung.com/spring-scheduled-tasks
https://docs.spring.io/spring-framework/reference/integration/scheduling.html#scheduling-enable-annotation-support
https://dkswnkk.tistory.com/728
