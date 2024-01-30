# @Async

## 정의
- 메서드가 비동기적으로 실행되어야 함을 나타내는 어노테이션
- 스프링은 이 어노테이션을 보고, 해당 메서드를 별도의 스레드(보통 스레드 풀에서 가져온 스레드)에서 실행

## @EnableAsync
- @EnableAsync 어노테이션을 포함하는 설정 클래스는 스프링에게 애플리케이션에서 비동기 기능을 활성화하도록 지시

```java
@Configuration
@EnableAsync
public class AsyncConfig {

    @Bean
    public Executor taskExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(10);
        executor.setMaxPoolSize(20);
        executor.setQueueCapacity(500);
        executor.initialize();
        return executor;
    }
}

```