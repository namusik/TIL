# Cache in Springboot

## 의존성
```gradle
implementation 'org.springframework.boot:spring-boot-starter-cache'
```

## Config 클래스
```java
@Configuration
@EnableCaching
public class CachingConfig {

    @Bean
    public CacheManager cacheManager() {
        return new ConcurrentMapCacheManager("addresses");
    }
}
```
- @EnableCaching 추가
- CacheManager를 지정하지하않으면 SimpleCacheManager
- CaffeineCacheManager, ConcurrentMapCacheManager, EhCacheCacheManager, JCacheCacheManager 등등 사용 가능
- Spring의 기본 내장 캐시 중 하나인 ConcurrentMapCacheManager를 지정해 줄 수 도 있음
  - 메모리 기반 캐시를 제공하는 캐시 매니저
  - ConcurrentMap을 사용해서 캐시를 구현
  - 애플리케이션의 JVM 메모리에 데이터를 저장하며, 설정이 매우 간단하지만, 분산 캐시나 영구 저장소를 필요로 하지 않는 경우에 유용



1. @Cacheable(value = "sample") : 캐시 저장
   1. 서버의 메모리에 sample이라는 해쉬 테이블을 만들게 됨.
   2. 첫번째 접근 때는 DB에서 find해서 가져옴
2. @CachePut(value = "sample", key = "#sam") : 캐시 수정
3. @CacheEvict() : 캐시 삭제 


## 출처
https://www.baeldung.com/spring-cache-tutorial