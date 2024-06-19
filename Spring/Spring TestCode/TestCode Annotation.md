# Spring TestCode Annotation


## @SpringBootTest

- 통합 테스트를 수행할 때 사용
- 애플리케이션 전체 context를 로드. 애플리케이션이 실행될 때와 동일한 환경에서 테스트를 수행


### 사용 목적
- 애플리케이션 컨텍스트 전체를 로드하여 모든 빈(bean)을 테스트하고 싶을 때
- 실제 데이터베이스와의 통합 테스트를 수행하고 싶을 때
- 애플리케이션의 여러 계층 (컨트롤러, 서비스, 리포지토리 등)을 통합적으로 테스트하고 싶을 때


## @Autowired 

- 의존성 주입을 위해 사용


## @TestConfiguration

- 테스트에 필요한 특정 Bean을 정의하기 위해 사용
- 테스트 환경에서만 필요한 설정을 정의할 때.


### 예시
```java
@Slf4j
@SpringBootTest
class Test {

    @Autowired
    private MemberRepositoryV3 memberRepository;

    @Autowired
    private MemberServiceV3_3 memberService;

    @TestConfiguration
    static class TestConfig {
        @Bean
        DataSource dataSource() {
            return new DriverManagerDataSource(URL, USERNAME, PASSWORD);
        }

        @Bean
        PlatformTransactionManager transactionManager() {
            return new DataSourceTransactionManager(dataSource());
        }

        @Bean
        MemberRepositoryV3 memberRepositoryV3() {
            return new MemberRepositoryV3(dataSource());
        }

        @Bean
        MemberServiceV3_3 memberServiceV3_3() {
            return new MemberServiceV3_3(memberRepositoryV3());
        }
    }
}
```
- @TestConfiguration에서 Bean을 정의하고, @Autowird에서 Bean을 주입받는다.

## AfterEach
- 각각의 테스트가 끝나는 시점에 호출됨