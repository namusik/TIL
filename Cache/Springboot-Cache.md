# Spring Boot Cache

> 최종 업데이트: 2026-04-15 | Spring Boot 3.x / Spring Framework 6.x 기준

## 개념

Spring Cache Abstraction은 **캐시 로직을 비즈니스 코드에서 분리**해주는 추상화 계층이다. 특정 캐시 구현체(Caffeine, Redis 등)에 종속되지 않고, 어노테이션만으로 캐싱을 선언적으로 적용할 수 있다.

> 도서관 사서에 비유하면, 자주 요청되는 책을 매번 창고에서 찾는 대신 카운터 옆 선반(캐시)에 꺼내두는 것과 같다. Spring Cache는 "어떤 선반을 쓸지"는 상관없이, "이 책은 선반에 놓아라"라는 규칙만 정의하는 방식이다.

### 동작 원리 (AOP 프록시 기반)

```
Client → Proxy(CacheInterceptor) → 캐시 조회
                                     ├─ HIT  → 캐시된 값 반환 (메서드 실행 안 함)
                                     └─ MISS → 실제 메서드 실행 → 결과 캐시 저장 → 반환
```

- `@Cacheable` 등의 어노테이션이 붙은 메서드 호출 시, Spring AOP가 **프록시 객체**를 통해 가로챈다
- 내부적으로 `CacheInterceptor` → `CacheAspectSupport`가 처리
- Spring Boot 3.x 기본 프록시 방식은 **CGLIB**

### 핵심 구성 요소

| 구성 요소 | 역할 |
|---|---|
| `CacheManager` | 캐시 인스턴스를 관리하는 최상위 인터페이스 |
| `Cache` | 실제 캐시 저장소 추상화 (get/put/evict) |
| `KeyGenerator` | 캐시 키 생성 전략 |
| `CacheResolver` | 어떤 캐시를 사용할지 결정 |

## 의존성

```gradle
implementation 'org.springframework.boot:spring-boot-starter-cache'
```

## 캐시 활성화

```java
@SpringBootApplication
@EnableCaching
public class Application { }
```

- `@EnableCaching`을 추가하면 캐싱 기능이 활성화된다
- 별도의 `@Bean` 등록하지 않으면 **ConcurrentMapCacheManager**를 기본으로 사용

## Auto-Configuration

Spring Boot는 `CacheAutoConfiguration`을 통해 CacheManager를 자동 구성한다.

### spring.cache.type 프로퍼티

```yaml
spring:
  cache:
    type: caffeine
    cache-names: users,products
```

가능한 값: `generic`, `jcache`, `hazelcast`, `infinispan`, `couchbase`, `redis`, `caffeine`, `simple`, `none`

### 자동 감지 우선순위 (type 미지정 시)

| 우선순위 | 구현체 |
|---|---|
| 1 | Generic (사용자 정의 `Cache` 빈이 있으면) |
| 2 | JCache (JSR-107) |
| 3 | Hazelcast |
| 4 | Infinispan |
| 5 | Couchbase |
| 6 | Redis |
| 7 | Caffeine |
| 8 | **Simple** (`ConcurrentMapCacheManager` - 최종 fallback) |

## CacheManager 구현체 비교

| 구현체 | 특징 | 적합한 경우 |
|---|---|---|
| `ConcurrentMapCacheManager` | JDK ConcurrentHashMap 기반. TTL 없음. 의존성 불필요 | 테스트, 프로토타입 |
| **`CaffeineCacheManager`** | 고성능 로컬 캐시. TTL/TTI/최대크기 등 풍부한 설정 | **프로덕션 로컬 캐시 (권장)** |
| `JCacheCacheManager` | JSR-107 표준. EhCache 3 등과 연동 | 표준 호환 필요 시 |
| `RedisCacheManager` | Redis 기반 분산 캐시 | 분산 환경, 멀티 인스턴스 |
| `SimpleCacheManager` | 수동으로 Cache 인스턴스 목록 주입 | 캐시별 세밀한 설정 |
| `NoOpCacheManager` | 아무것도 캐시하지 않음 | 캐시 비활성화 |

> ConcurrentMapCacheManager는 TTL이 없어서 메모리가 계속 쌓인다. 프로덕션에서는 **Caffeine**(로컬) 또는 **Redis**(분산)를 사용하는 것이 표준이다.

### ConcurrentMapCacheManager 설정

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

- 메모리 기반 캐시를 제공하는 캐시 매니저
- ConcurrentMap을 사용해서 키-값 쌍으로 데이터가 저장된다
- 각 캐시는 ConcurrentMapCache로 관리됨
- 캐시 생성 시 캐시 이름을 명시적으로 지정 가능

### CacheManagerCustomizer

```java
@Component
public class CustomCacheManagerCustomizer implements CacheManagerCustomizer<ConcurrentMapCacheManager> {

    @Override
    public void customize(ConcurrentMapCacheManager cacheManager) {
      // "cache1"와 "cache2"라는 두 개의 캐시를 설정
         cacheManager.setCacheNames(asList("cache1", "cache2"));
    }
}
```

- **CacheManagerCustomizer\<T\>** 빈을 사용하여 자동 구성된 CacheManager를 사용자 정의할 수 있음
- 만약 캐시 이름을 Bean 설정과 Customizer 설정을 동시에 사용하게 되면 **Bean 설정**이 덮어쓰는 것으로 확인된다

### NoOpCacheManager (캐시 비활성화)

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

- 캐시 비활성화를 해주기 위해 캐싱을 수행하지 않는 캐시 매니저 **NoOpCacheManager**를 사용
- 또는 `spring.cache.type=none`으로도 Auto-Configuration 레벨에서 비활성화 가능

## @Cacheable

메서드 결과를 캐시에 저장하고, 동일한 인자로 재호출하면 캐시된 값을 반환한다.

> 한 번 계산한 답안지를 파일에 보관해두고, 같은 문제가 나오면 다시 풀지 않고 파일에서 꺼내는 것과 같다.

```java
// 기본 키 생성
@Cacheable({"addresses", "directory"})
public String getAddress(Customer customer) {...}

// 단일 인자 키 생성
@Cacheable(value = "exampleCache", key = "#parameter")
public String getData(String parameter) {...}

// 여러 인자 조합 키 생성
@Cacheable(value = "exampleCache", key = "#param1 + '-' + #param2")
public String getData(String param1, int param2) {...}

// 객체 필드 참조하여 키 생성
@Cacheable(value = "exampleCache", key = "#user.username")
public String getUserData(User user) {...}

// 복합 객체 필드 참조하여 키 생성
@Cacheable(value = "exampleCache", key = "#user.username + '-' + #user.age")
public String getUserData(User user) {}
```

### 주요 속성

| 속성 | 설명 |
|---|---|
| `value` / `cacheNames` | 캐시 이름 (복수 가능). 일종의 네임스페이스(prefix) 역할 |
| `key` | SpEL로 캐시 키 지정. `#`을 붙여야 파라미터를 참조 |
| `keyGenerator` | 커스텀 KeyGenerator 빈 이름 |
| `condition` | 메서드 실행 **전** 평가. true일 때만 캐시 동작 |
| `unless` | 메서드 실행 **후** 평가. true이면 캐시에 저장 안 함 |
| `sync` | true면 동일 키에 대해 하나의 스레드만 실행 |
| `cacheManager` | 사용할 CacheManager 빈 이름 |
| `cacheResolver` | 사용할 CacheResolver 빈 이름 |

### key에 # 을 붙이는 이유

SpEL 표현식에서 메소드 인자나 객체의 속성을 참조하기 위해 필수적이다. `#`을 붙이지 않으면 `getData(param1)`의 파라미터 `param1`이 키로 들어가는게 아니라 `"parameter"` 글자 자체가 캐시 key가 된다.

### 저장된 캐시 예시

```json
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

### 주의사항

- 2개 이상의 캐시에 저장을 하면, 적혀있는 순서 첫번째 캐시에서 조회를 한다
- 동일한 param을 인자로 가지지만 A 함수는 String을 반환하고, B 함수는 Object를 반환할 때, 먼저 호출된 함수의 return type이 캐시에 저장된다. 이후 다른 함수를 호출하면 DB 대신 캐시에서 조회하므로 **타입 불일치 오류**가 발생한다
- 등록되지 않은 캐시 이름을 사용하면 에러 발생:
```
java.lang.IllegalArgumentException: Cannot find cache named 'aaaaa' for Builder[...]
```

## @CacheEvict

캐시에서 항목을 제거한다. 오래되거나 변경된 데이터를 무효화할 때 사용한다.

```java
// 지정한 캐시의 모든 데이터를 삭제
// allEntries=true :: 모든 값 제거 , beforeInvocation = true :: 메서드 호출 전에 캐시 제거 (default false)
@CacheEvict(value="addresses", allEntries=true, beforeInvocation = true)
public String getAddress(Customer customer) {...}

// 삭제할 key를 지정
@CacheEvict(value="addresses", key="#oldTitle + '-' + #oldDirector")
public String getAddress(Customer customer) {...}
```

| 속성 | 설명 |
|---|---|
| `allEntries` | true면 해당 캐시의 모든 항목 제거 |
| `beforeInvocation` | true면 메서드 실행 **전** 제거 (기본 false = 메서드 성공 후 제거) |

- **key를 지정하지 않고 allEntries=true도 설정하지 않으면 캐시가 삭제되지 않는다**
- 모든 메서드를 `@Cacheable`로 만들면 캐시가 빠르게 커질 수 있으며, 오래된 데이터를 많이 보유하게 됨
- 일반적인 전략: 조회 함수에 `@Cacheable`, 수정/삭제 함수에 `@CacheEvict`를 붙여 DB 수정 시 캐시를 삭제하고 다시 조회할 때 캐시를 갱신

## @CachePut

**항상 메서드를 실행**하고 결과를 캐시에 저장한다. `@Cacheable`과 달리 메서드 실행을 건너뛰지 않는다.

```java
@CachePut(value = "hash", key = "#movieSaveDto.title + '-' + #movieSaveDto.director")
public String getAddress(Customer customer) {...}
```

- 메서드가 항상 실행되므로 메서드 실행 비용이 높을 때 주의
- `@Cacheable`과 `@CachePut`을 함께 사용할 때, **동일한 키를 명시적으로 사용**하여 캐시의 일관성을 유지해야 한다

## @Caching

동시에 여러 개의 캐시 어노테이션을 사용하려면 `@Caching`으로 감싸준다.

```java
@Caching(
  cacheable = {@Cacheable(value = "userCache", key = "#userId")},
  put = {@CachePut(value = "userCache", key = "#result.id")},
  evict = { 
  @CacheEvict("addresses"), 
  @CacheEvict(value="directory", key="#customer.name") })
public String getAddress(Customer customer) {...}
```

## @CacheConfig

클래스 레벨에서 공통 캐시 설정을 지정하여 반복을 줄인다.

```java
@CacheConfig(cacheNames={"addresses"})
public class CustomerDataService {

    @Cacheable           // cacheNames 생략 가능
    public String getAddress(Customer customer) {...}

    @CacheEvict          // cacheNames 생략 가능
    public void delete(Customer customer) {...}
```

## 캐시 키 생성 전략

### SimpleKeyGenerator (기본)

`key`를 명시하지 않으면 `SimpleKeyGenerator`가 기본으로 사용된다.

| 파라미터 상태 | 생성되는 키 |
|---|---|
| 파라미터 없음 | `SimpleKey.EMPTY` |
| 파라미터 1개 | 파라미터 인스턴스 자체 |
| 파라미터 2개 이상 | `SimpleKey(params)` - 모든 파라미터의 hashCode 조합 |

- 파라미터 객체의 `hashCode()`와 `equals()`가 올바르게 구현되어 있어야 한다
- 다른 메서드가 같은 캐시 이름, 같은 파라미터를 사용하면 **키 충돌** 발생 가능 → `key`를 명시하거나 캐시 이름을 분리

### 커스텀 KeyGenerator

```java
@Component("movieKeyGenerator")
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

```java
// bean으로 등록한 keyGenerator 사용
@Cacheable(value = "director", keyGenerator = "movieKeyGenerator")
```

## 조건부 캐싱 (condition vs unless)

| 속성 | 평가 시점 | 역할 | `#result` 사용 |
|---|---|---|---|
| `condition` | 메서드 실행 **전** | true일 때만 캐시 로직 적용 | 불가 |
| `unless` | 메서드 실행 **후** | true이면 결과를 캐시에 저장 안 함 | **가능** |

> `condition=false`는 캐시 조회도, 저장도 안 하는 것(완전 비활성)이고, `unless=true`는 캐시 **조회는 하되** 새 결과를 저장만 안 하는 것이다.

```java
// 매개변수의 입력에 따라 일치할 때만 캐시에 저장
@CachePut(value="addresses", condition="#customer.name=='Tom'")
public String getAddress(Customer customer) {...}
```

```java
// 함수 출력의 결과에 조건을 둬서 캐싱. 결과가 64글자보다 큰 경우에만 캐싱
@CachePut(value="addresses", unless="#result.length()<64")
public String getAddress(Customer customer) {...}
```

## sync 속성

**Cache Stampede(캐시 스탬피드) 방지**를 위한 속성이다.

> 인기 식당에서 캐시 미스가 나면 10명이 동시에 주방에 같은 주문을 넣는 상황이 벌어진다. `sync=true`면 1명만 주방에 주문하고 나머지는 결과를 기다린다.

```java
@Cacheable(value = "heavyData", key = "#id", sync = true)
public Data computeExpensiveData(Long id) {
    // 같은 키에 대해 한 번에 하나의 스레드만 실행
}
```

| sync | 동일 키 동시 요청 시 |
|---|---|
| `false` (기본) | 모든 스레드가 각자 메서드 실행 (Thundering Herd) |
| `true` | 첫 번째 스레드만 실행, 나머지는 대기 후 캐시된 결과 사용 |

- 내부적으로 `Cache.get(key, Callable)`을 사용하므로, 캐시 구현체가 이를 지원해야 한다 (Caffeine, ConcurrentMapCache 지원)
- `sync=true`일 때 `unless` 속성은 사용 불가
- 캐시 이름도 1개만 지정 가능

## Caffeine Cache (프로덕션 권장)

Caffeine은 Google Guava Cache의 후속 프로젝트로, **Window TinyLfu** 알고리즘 기반의 고성능 로컬 캐시다. Java 진영에서 **사실상 표준 로컬 캐시 라이브러리**이다.

```gradle
implementation 'com.github.ben-manes.caffeine:caffeine'
```

### TTL / TTI 설정

| 용어 | 설명 | Caffeine 설정 |
|---|---|---|
| **TTL** (Time To Live) | 항목 **생성 후** 일정 시간 지나면 만료 | `expireAfterWrite` |
| **TTI** (Time To Idle) | 마지막 **접근 후** 일정 시간 지나면 만료 | `expireAfterAccess` |

**방법 1: application.yml**

```yaml
spring:
  cache:
    type: caffeine
    caffeine:
      spec: maximumSize=1000,expireAfterWrite=600s,expireAfterAccess=300s
```

**방법 2: Java Config**

```java
@Bean
public CaffeineCacheManager cacheManager() {
    CaffeineCacheManager manager = new CaffeineCacheManager("users", "products");
    manager.setCaffeine(Caffeine.newBuilder()
        .maximumSize(1_000)
        .expireAfterWrite(Duration.ofMinutes(10))
        .expireAfterAccess(Duration.ofMinutes(5))
        .recordStats());
    return manager;
}
```

**방법 3: 캐시별 다른 TTL 적용**

```java
@Bean
public CacheManager cacheManager() {
    SimpleCacheManager manager = new SimpleCacheManager();
    manager.setCaches(List.of(
        buildCache("users", 10, TimeUnit.MINUTES, 500),
        buildCache("products", 1, TimeUnit.HOURS, 1000)
    ));
    return manager;
}

private CaffeineCache buildCache(String name, long duration, TimeUnit unit, long maxSize) {
    return new CaffeineCache(name, Caffeine.newBuilder()
        .expireAfterWrite(duration, unit)
        .maximumSize(maxSize)
        .build());
}
```

## 캐싱 TTL (@Scheduled 방식)

Spring 내장 ConcurrentMapCacheManager는 TTL을 직접 설정할 수 없기에 `@Scheduled`를 활용해야 한다.

```java
@Scheduled(fixedRateString = "${caching.movieTTL}")
@CacheEvict(value = "movie", allEntries = true)
public void deleteMovieCacheTTL() {
    log.info("10초마다 캐시 삭제");
}
```

> **Caffeine을 쓰면 `expireAfterWrite`로 TTL을 네이티브 지원**하므로 이런 우회가 필요 없다.

## 캐시 데이터 조회/삭제 (CacheManager 직접 사용)

### 생성된 캐시 이름 확인

```java
@GetMapping("/caches")
public Collection<String> getCacheNames() {
    return cacheManager.getCacheNames();
}
```

### 특정 캐시 데이터 조회

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

### 프로그래밍 방식 캐시 삭제

```java
@Autowired
CacheManager cacheManager;

// 특정 캐시 항목 삭제
public void evictSingleCacheValue(String cacheName, String cacheKey) {
    cacheManager.getCache(cacheName).evict(cacheKey);
}

// 특정 캐시 전체 삭제
public void evictAllCacheValues(String cacheName) {
    cacheManager.getCache(cacheName).clear();
}

// 모든 캐시 전체 삭제
public void evictAllCaches() {
    cacheManager.getCacheNames().stream()
      .forEach(cacheName -> cacheManager.getCache(cacheName).clear());
}
```

## AOP 주의사항

### Self-Invocation 문제

**같은 클래스 내부에서 캐시 메서드를 호출하면 캐시가 동작하지 않는다.**

```java
@Service
public class UserService {

    public User getUser(Long id) {
        return findById(id);  // ❌ 프록시를 거치지 않아 캐시 미동작
    }

    @Cacheable("users")
    public User findById(Long id) { ... }
}
```

프록시 기반 AOP이므로 `this.findById()` 호출은 프록시가 아닌 실제 객체의 메서드를 직접 호출하게 된다.

**해결 방법**:
1. **클래스 분리** (권장): 캐시 메서드를 별도 서비스로 추출
2. `@Lazy` self-injection
3. AspectJ 위빙 모드: `@EnableCaching(mode = AdviceMode.ASPECTJ)`

### 그 외 주의사항

- **private 메서드**: 프록시가 오버라이드 불가하므로 캐시 어노테이션이 무시됨. **public 메서드에만 사용**
- **void 반환 메서드**: `@Cacheable`은 캐시할 값이 없으므로 무의미
- **null 캐싱**: null도 캐시될 수 있다. `unless = "#result == null"`로 방지 가능
- **직렬화**: Redis 등 분산 캐시 사용 시 캐시 대상 객체가 `Serializable`이어야 함

## 캐시 전략 가이드

| 작업 | 전략 | 어노테이션 |
|---|---|---|
| 조회 | 처음 조회 시 캐시에 저장 | `@Cacheable` |
| 수정 | 캐시 갱신 또는 삭제 | `@CachePut` 또는 `@CacheEvict` |
| 삭제 | 캐시에서 제거 | `@CacheEvict` |

> 조회 시 `@Cacheable`로 캐시에 저장하고, 수정/삭제 시 `@CacheEvict`로 무효화하면 자연스럽게 다음 조회에서 최신 데이터가 캐시된다.

## 출처

- https://docs.spring.io/spring-boot/reference/io/caching.html
- https://docs.spring.io/spring-framework/reference/integration/cache.html
- https://www.baeldung.com/spring-cache-tutorial
- https://www.baeldung.com/spring-setting-ttl-value-cache
- https://www.baeldung.com/spring-boot-evict-cache
- https://www.baeldung.com/spring-boot-disable-cacheable-annotation
- https://github.com/ben-manes/caffeine
