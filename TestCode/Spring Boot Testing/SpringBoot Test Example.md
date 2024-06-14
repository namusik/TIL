# SpringBoot Test Code Example

```java
    private MemberRepositoryV1 memberRepository;
    private MemberServiceV1 memberService;

    @BeforeEach
    void before() {
        DriverManagerDataSource dataSource = new DriverManagerDataSource(URL, USERNAME, PASSWORD);
        memberRepository = new MemberRepositoryV1(dataSource);
        memberService = new MemberServiceV1(memberRepository);
    }
```
- @SpringBootTest없이 클래스 의존성 주입해주는 방법.

```java
Assertions.assertThatThrownBy(() -> repository.findById(member.getMemberId()))
        .isInstanceOf(NoSuchElementException.class);
```
- db 조회했을 때 없는지 확인
- 예외상황을 강제로 만들 때, 로직을 계속 진행할 때도 사용할 수 도 있다.
  - 예외가 터지고 끝나면 아래 로직이 수행되지 않기 때문에