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
       return new ConcurrentMapCacheManager("string" , "hash"); // 캐시 이름 명시
    }
}
```
- **@EnableCaching** 추가해서 캐싱기능 활성화
- 별도의 @Bean 등록하지 않으면 **ConcurrentMapCacheManager**를 사용
- CaffeineCacheManager, EhCacheCacheManager, JCacheCacheManager 등등 Bean으로 등록하여 사용 가능
- **ConcurrentMapCacheManager**
  - 메모리 기반 캐시를 제공하는 캐시 매니저
  - ConcurrentMap을 사용해서 캐시를 구현
    - 단순하게 키-값 쌍으로 데이터가 저장된다.
  - 각 캐시는 ConcurrentMapCache로 관리됨.
  - 캐시 생성 시 캐시 이름을 명시적으로 지정 가능

## CacheManager 커스터마이징
```java
@Component
public class CustomCacheManagerCustomizer implements org.springframework.boot.autoconfigure.cache.CacheManagerCustomizer<ConcurrentMapCacheManager> {

    @Override
    public void customize(ConcurrentMapCacheManager cacheManager) {
      // "cache1"와 "cache2"라는 두 개의 캐시를 설정
         cacheManager.setCacheNames(asList("cache1", "cache2"));
    }
}
```
- **CacheManagerCustomizer<T>** 빈을 사용하여 자동 구성된 CacheManager를 사용자 정의할 수 있음
- 만약 캐시 이름을 Bean 설정과 Customizer 설정을 동시에 사용하게 되면 **Bean 설정**이 덮어쓰는 것으로 확인된다. 

## 생성된 캐시 확인
```java
@GetMapping("/caches")
public Collection<String> getCachenNames() {
    return cacheManager.getCacheNames();
}
```
- 다양한 방법이 있지만 간단하게 핸들러를 사용해서 cacheManager에 저장된 캐시이름을 확인할 수 있음.

## @Cacheable
```java
// 기본 키 생성
@Cacheable("cache1", "cache2")
public String getAddress(Customer customer) {...}

// 단일 인자 키 생성
@Cacheable(value = "exampleCache", key = "#parameter")
public String getData(String parameter) {...}

// 여러 인지 조합 키 생성
@Cacheable(value = "exampleCache", key = "#param1 + '-' + #param2")
public String getData(String param1, int param2) {...}

// 객체 필드 참조하여 키 생성
@Cacheable(value = "exampleCache", key = "#user.username")
public String getUserData(User user) {...}

// 복합 객체 필드 참조하여 키 생성
@Cacheable(value = "exampleCache", key = "#user.username + '-' + #user.age")
public String getUserData(User user) {}

```
- @Cacheable("캐시이름")을 메서드에 붙여주면 된다.
- 해당 메소드의 결과를 지정하누캐시에 저장
- 동일한 인자로 메소드가 다시 호출되면, 메소드를 실행하는 대신 캐시된 결과를 반환
- key 설정을 통해 캐시 key를 커스터마이징 할 수 있다.
  - #을 붙여야하는 이유는 SpEL 표현식에서 메소드 인자나 객체의 속성을 참조하기 위해 필수적이기 때문
  - #을 붙이지 않으면 getData(parama1)의 인자값 `param1`이 키로 들어가는게 아니라 `parameter` 글자 자체가 캐시 key가 됨
- 



1. @CachePut(value = "sample", key = "#sam") : 캐시 수정
2. @CacheEvict() : 캐시 삭제 


## 출처
https://www.baeldung.com/spring-cache-tutorial