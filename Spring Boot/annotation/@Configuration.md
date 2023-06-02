# @Configuration

## 개념
설정파일이나 Bean을 만들기 위한 annotation

xml 설정 파일을 대체하는 스프링 설정 클래스가 된다. 

@Bean은 이 @Configuration 클래스 안에서만 쓸 수 있다. 그래야 싱글톤이 보장된다. 

수동으로 스프링 컨테이너에 빈을 등록하는 방법.

You need not put all your @Configuration into a single class. 

### @Component와의 등록과의 차이

메소드 레벨에서 선언이 가능하다. 

Injecting Inter-bean Dependencies
빈이 서로에 대해 종속성을 가지도록 표현할 수 있다. 

~~~java
@Configuration
public class AppConfig {
	
    @Bean
    public BeanOne beanOne() {
    	return new BeanOne(beanTwo());
    } //
    
    @Bean
    public BeanTwo beanTwo() {
    	return new BeanTwo();
    }
}
~~~


## 참고
https://velog.io/@tco0427/Spring-Configuration

https://docs.spring.io/spring-boot/docs/current/reference/html/using.html#using.configuration-classes