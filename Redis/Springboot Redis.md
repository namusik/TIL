# Springboot에서 Redis

## Lettuce
- 가장 많이 사용되는 라이브러리
- Spring Data Redis 안에 들어있음.
- RedisTemplate이라는 추상화된 클래스를 제공해줌.
  - Lettuce를 직접 쓰지 않는 이유는, 추후에 Lettuce가 아닌 다른 라이브러리로 바뀌더라고 대응할 수 있도록 추상화된 클래스 의존.
- 장점
  - 비차단 I/O 사용
    - 고성능 및 높은 동시성 시나리오에 적합.
  - 반응형 프로그래밍에 대해 지원
  - 포괄적인 고급 Redis 기능 제공
    - pub/sub, redis stream, cluster

## yml
```yml
spring:
  data:
    redis:
      host: localhost
      port: 6379
```
- springboot 3.3.1 기준 redis host와 port 설정방법

## StringRedisTemplate 

- Redis의 String data type을 다루는 클래스

```java
ValueOperations<String, String> ops = redisTemplate.opsForValue();
ops.set("fruit", name);
ops.get("fruit");
```
-  simplevalue를 가지고 operation을 수행할 수 있는 객체

## Redis에 LocalDateTime 저장하기 

~~~java
@Bean
public ObjectMapper objectMapper() {
    return new ObjectMapper()
            .findAndRegisterModules()
            //ObjectMapper 클래스의 메서드로써 JDK ServiceLoader에 의해
            //기본적으로 제공되는 모듈들을 찾아 넣어줌.
            .enable(SerializationFeature.INDENT_OUTPUT)
            //JSON 형태로 저장하거나 출력할 때 인덴트를 맞춰서 formatting 해줌
            .disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS)
            //Date를 TimeStamp 형식으로 직렬화하지 못하게 함.
            .configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false)
            //역직렬화하는 대상에 모르는 속성 (필드) 이 있더라도 역직렬화를 수행하라는 의미에서 false
            .registerModule(new JavaTimeModule());
            //JavaTimeModule 혹은 JDK8Module을 넣어주면 LocalDateTime 직렬화 / 역직렬화가 가능
}
~~~

