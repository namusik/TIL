# Springboot Local Cache

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

## NoOpCacheManager
```java
caching:
  enabled: true

@Value("${caching.enabled}")
public boolean cacheEnabled;

@Bean
public CacheManager cacheManager() {
    if(cacheEnabled) {
        // 캐시 미사용 (false)
        return new NoOpCacheManager();
    }
    return new ConcurrentMapCacheManager("director" , "title", "movie", "movie2");
}
```
- 캐시 비활성화를 해주기 위해 캐싱을 수행하지 않는 캐시 매니저 **NoOpCacheManager**를 사용해준다.

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

```java
java.lang.IllegalArgumentException: Cannot find cache named 'aaaaa' for Builder[public java.lang.String com.example.cache.service.MovieService.getDirector(java.lang.String)] caches=[aaaaa] | key='' | keyGenerator='' | cacheManager='' | cacheResolver='' | condition='' | unless='' | sync='false'
```
- 

## 특정 캐시 데이터 확인 
```java
private final CacheManager cacheManager;

public Map<Object, Object> getAllCaches(String cacheName) {
    Cache cache = cacheManager.getCache(cacheName);
    if(cache instanceof ConcurrentMapCache concurrentMapCache) {
        return new HashMap<>(concurrentMapCache.getNativeCache());
    }
    return new HashMap<>();
}
```
- 특정한 이름의 캐시에 저장된 모든 데이터를 조회한다.

## KeyGenerator
```java
@Component("moveKeyGenerator")
public class MovieKeyGenerator implements KeyGenerator {
    @Override
    public Object generate(Object target, Method method, Object... params) {
        StringJoiner key = new StringJoiner("-");

        for (Object param : params) {
            key.add(param.toString());
        }

        key.add("1");

        return key.toString();
    }
}
```
- 미리 정의해둔 캐시 키 생성 설정

```java
@Configuration
@EnableCaching
public class CacheConfig {
    @Bean("movieKeyGenerator")
    public MovieKeyGenerator movieKeyGenerator() {
        return new MovieKeyGenerator();
    }
}
```
- KeyGenerator를 Bean 등록

```java
@Cacheable(value = "director", keyGenerator = "movieKeyGenerator")
```
- bean으로 등록한 keyGenerator 사용법

## @Cacheable
```java
// 기본 키 생성
@Cacheable({"addresses", "directory"})
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
- 해당 메소드의 결과를 지정한 캐시에 저장
- 동일한 인자로 메소드가 다시 호출되면, 메소드를 실행하는 대신 캐시된 결과를 반환
- **value**
  - 캐시의 이름을 지정
  - 이 이름을 사용하여 특정 캐시 공간(**네임스페이스**)을 구분
  - 일종의 prefix 역할
- **key**
  - **캐시 key**를 **함수의 파라미터**로 커스터마이징 할 수 있다.
  - **#을 붙여야**하는 이유는 SpEL 표현식에서 메소드 인자나 객체의 속성을 참조하기 위해 필수적이기 때문
  - #을 붙이지 않으면 getData(parama1)의 파라미터 `param1`이 키로 들어가는게 아니라 `parameter` 글자 자체가 캐시 key가 됨
- 2 개 이상의 캐시에 저장을 하면, 적혀있는 순서 첫번 째 캐시에서 조회를 한다.
- **주의사항**
  - 동일한 param1을 인자로 가지지만 A 함수는 String을 반환하고, B 함수는 Object를 반환할 때,
  - 두 함수 중 먼저 호출이 된 함수의 return type이 캐시에 param1을 key로 가지는 데이터로 저장이 된다. 
  - 따라서, A를 먼저 호출후, B를 호출하면 DB에서 검색하는 것이 아니라, 동일한 param1을 key로 가지는 캐시에서 조회하기 때문에 오류가 발생한다.

```
// 저장된 캐시 예시
{
    // 인자가 하나인 함수의 자동생성 key
    "살인의 추억": "봉준호", 
    // 인자가 2개인 함수의 커스터마이즈 key
    "살인의 추억-봉준호": {
        "id": 1,
        "title": "살인의 추억",
        "director": "봉준호"
    },
    // 인자가 2개인 함수의 자동생성 key
    "SimpleKey [살인의 추억, 봉준호]": {
        "id": 1,
        "title": "살인의 추억",
        "director": "봉준호"
    }
}
```

## @CacheEvict
```java
// 지정한 캐시의 모든 데이터를 삭제
// value :: 지정한 캐시 이름, allEntries=true :: 모든 값 제거 , beforeInvocation = true :: 메서드가 호출되기전에 캐시 제거. default는 false
@CacheEvict(value="addresses", allEntries=true, , beforeInvocation = true)
public String getAddress(Customer customer) {...}

// 삭제할 key를 지정
// 현재 default key로 저장된 캐시를 삭제하는 법은 찾지 못했다.
@CacheEvict(value="addresses", key="#oldTitle + '-' + #oldDirector")
public String getAddress(Customer customer) {...}

```
- 캐시에서 하나 이상의 값 또는 모든 값의 제거
- 캐시된 데이터가 무효화되어, 다음번 데이터 요청 시 새로운 값을 가져온다.
- 모든 메서드를 @Cacheable로 만들면 캐시는 상당히 크고 빠르게 커질 수 있으며, 오래되거나 사용하지 않는 데이터를 많이 보유하게 됨. 이를 제거하기 위해 사용
- 조회 함수에 @Cacheable을 붙이고, 저장/수정 함수에 @CacheEvict를 붙이면 DB에 수정이 될 때마다 캐시를 삭제하고 다시 조회할 때 캐시를 갱신하는 전략을 가질 수 있다.
- key를 지정하지 않거나, allEntries=true를 설정해주지 않으면 캐시가 삭제되지 않는다.

## CacheManager.clear()
```java
@Autowired
CacheManager cacheManager;

public void evictSingleCacheValue(String cacheName, String cacheKey) {
    cacheManager.getCache(cacheName).evict(cacheKey);
}

public void evictAllCacheValues(String cacheName) {
    cacheManager.getCache(cacheName).clear();
}

// 캐시 전체 삭제
public void evictAllCaches() {
    cacheManager.getCacheNames().stream()
      .forEach(cacheName -> cacheManager.getCache(cacheName).clear());
}
```
- @CacheEvict 대시 직접 주입받은 cacheManager에서 clear() 메서드를 호출해서 캐시를 삭제할 수 있다.

## @CachePut
```java
@CachePut(value = "hash", key = "#movieSaveDto.title + '-' + #movieSaveDto.director")
public String getAddress(Customer customer) {...}
```
- @CachePut은 메서드를 항상 실행하고 그 결과를 캐시에 저장
  - @Cachealbe의 캐시에 값이 존재하면 캐시된 값을 반환하고 메서드를 실행하지 않는점과 다름
- 메서드가 항상 실행되므로 메서드 실행 비용이 높을 때 주의해야 함.
- @Cacheable과 @CachePut을 함께 사용할 때, 동일한 키를 명시적으로 사용하여 캐시의 일관성을 유지해야 한다.

## @Caching
```java
@Caching(
  cacheable = {@Cacheable(value = "userCache", key = "#userId")},
  put = {@CachePut(value = "userCache", key = "#result.id")},
  evict = { 
  @CacheEvict("addresses"), 
  @CacheEvict(value="directory", key="#customer.name") })
public String getAddress(Customer customer) {...}
```
- 동시에 여러개의 캐시 애노테이션을 사용하려면 @Caching으로 감싸준다.

## @CacheConfig
```java
@CacheConfig(cacheNames={"addresses"})
public class CustomerDataService {

    @Cacheable
    public String getAddress(Customer customer) {...}
```
- 클래스에 붙이는 애노테이션
- 캐싱의 공통적인 부분을 빼서 한 번에 선언한다.


## Caching Condition
```java
@CachePut(value="addresses", condition="#customer.name=='Tom'")
public String getAddress(Customer customer) {...}
```
- confition 설정을 주면, 매개변수의 입력에 따라 일치할 때만 캐시에 저장한다.

```java
@CachePut(value="addresses", unless="#result.length()<64")
public String getAddress(Customer customer) {...}
```
- 함수 출력의 결과에 조건을 둬서 캐싱할 수 도 있다. 
- 결과가 64글자보다 큰경우에만 캐싱을 하는 조건이다.


## 캐싱 TTL
```java
@Scheduled(fixedRateString = "${caching.movieTTL}")
@CacheEvict(value = "movie", allEntries = true)
public void deleteMovieCacheTTL() {
    log.info("10초마다 캐시 삭제");
}
```
- Time-to-Live
- 캐싱 시간제한 설정하여 일정 시간마다 삭제되도록 설정할 수 있다. 
- spring 내장 캐시에는 TTL 설정을 직접적으로 할 수 없기에 @Scheduled를 활용해야 함.

## 캐싱과 AOP
- Spring Cache 애노테이션은 AOP를 통해 동작하기 때문에 같은 클래스 내에서 캐시 메서드를 내부 호출하면 캐시 삭제가 되지 않는다. 
- 외부의 class에서 캐시 함수를 호출하는 방식을 사용해야 캐시 삭제가 된다

## 캐싱 전략에 대한 고민

- 조회를 할 때 캐시에 저장하자
  - 조회하지 않은 데이터를 미리 캐시에 저장할 필요는 없을 것 같다.
- 수정을 할 때 캐시에서 삭제하고 저장해야 하나 말아야하나
- 삭제를 할 때 캐시에서 삭제하자 
- 만약 테이블 전체를 빈번하게 

## 출처
https://www.baeldung.com/spring-cache-tutorial
https://www.baeldung.com/spring-setting-ttl-value-cache
https://www.baeldung.com/spring-boot-evict-cache
https://www.baeldung.com/spring-boot-disable-cacheable-annotation
