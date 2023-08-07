# Spring Bean

## @Component

## @Configuration
애플리케이션 설정정보 클래스에 적어주는 애노테이션

## @Bean
`spring container`에 등록이 된다.

~~~java
@Configuration
public class AppConfig {
    @Bean
    public MemberService memberService() {
        return new MemberServiceImpl(memberRepository());
    }
    @Bean
    public static MemberRepository memberRepository() {
        return new MemoryMemberRepository();
    }
}
~~~

## ApplicationContext
`Spring Container`

`@Bean`들을 관리해준다.

#### AnnotationConfigApplicationContext
어노테이션을 기반으로 Config를 할 때 사용

~~~java
ApplicationContext ac = 
new AnnotationConfigApplicationContext(AppConfig.class);
~~~
등록할 @Configuration 클래스를 적어준다.

이러면, 스프링이 @Configuration 클래스 내의 @Bean을 모두 Spring Container에 등록하고 관리해준다.