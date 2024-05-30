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
- key 설정을 통해 캐시 key를 커스터마이징 할 수 있다.
  - #을 붙여야하는 이유는 SpEL 표현식에서 메소드 인자나 객체의 속성을 참조하기 위해 필수적이기 때문
  - #을 붙이지 않으면 getData(parama1)의 인자값 `param1`이 키로 들어가는게 아니라 `parameter` 글자 자체가 캐시 key가 됨
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
//  value :: 지정한 캐시 이름, allEntries=true :: 모든 값 제거 , beforeInvocation = true :: 메서드가 호출되기전에 캐시 제거. default는 false
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
- 주의사항
  - @CacheEvict는 AOP를 통해 동작하기 때문에 같은 클래스 내에서 @CacheEvict이 붙은 메서드를 내부 호출하면 캐시 삭제가 되지 않는다. 
  - 외부의 class에서 @CacheEvict 함수를 호출하는 방식을 사용해야 캐시 삭제가 된다.

## @CachePut
```java

```

1. @CachePut(value = "sample", key = "#sam") : 캐시 수정

## 캐싱 전략에 대한 생각

- 조회를 할 때 캐시에 저장
- 저장을 할 때 캐싱하지 않음 (조회시 캐시에 저장하니까)
- 수정을 할 때 캐시에서 삭제
- 삭제를 할 때 

## 출처
https://www.baeldung.com/spring-cache-tutorial