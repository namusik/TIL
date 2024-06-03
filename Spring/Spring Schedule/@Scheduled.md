# @Scheduled

## 개념
- @Scheduled 어노테이션을 사용


## 특징
- 함수의 return 타입이 void
- 함수에 매개변수가 없어야 함.

## @EnableScheduling
```java
@Configuration
@EnableScheduling
public class SpringConfig {
    ...
}
```