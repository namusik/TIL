# Filter

![interceptor](../../images/Spring/interceptor.png)

## 정의

    DispatcherServlet 이전에 실행. 최초/최종 단계에 위치

    지정한 자원의 앞단에서 요청내용을 변경하거나, 여러가지 체크 수행

    인코딩 변환처리, XSS방어 등에 사용됨.

## 장점

    유일하게 ServletRequest/Reponse 객체를 변환할 수 있음.

## 구현

```java
@Componenet
@Order(1)
public class JwtAuthenticationFilter extends GenericFilterBean {

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) throws IOException, ServletException {
        
        //요청 전처리 

        chain.doFilter(reqeust, response);

        //응답 후처리
    }

}

```

## 선언

방법 1 : 모든 요청에 적용시키고자 할 때.

```
    Filter 위에 @Component만 붙여주면 됨.

    여러 Filter 사이에 순서를 지정해주고 싶다면 @Order(1)를 붙이면 됨.

    하지만, @Component로 Filter를 등록하면 모든 url 패턴에 매핑됨.
````

방법2

```
    BootApplication에 @ServletComponentScan 붙이기(서블릿 Component 스캔하는 애너테이션).

    Filter 위에 @WebFilter(urlPatterns = "/api/user") 붙여주기

    하지만, Order가 안먹혀서 순서 지정을 할 수 가 없음.
```

방법3

FilterRegistrationBean을 이용한 Filter 등록

여타 애너테이션 필요없음.

```java
    @Configuration 
    public class ServletConfig { 

        @Bean 
        public FilterRegistrationBean<SecondFilter> secondFilter(){ 
            FilterRegistrationBean<SecondFilter> registrationBean = new FilterRegistrationBean<>(); 
            registrationBean.setFilter(new SecondFilter()); //내가 만든 필터 등록 
            registrationBean.addUrlPatterns("/user/*");  //매칭 URL도 지정가능
            registrationBean.setOrder(2);   // Filter 순서지정가능
            registrationBean.setName("second-filter"); 
            return registrationBean; 
        } 
            
        @Bean public FilterRegistrationBean<FirstFilter> firstFilter(){
             FilterRegistrationBean<FirstFilter> registrationBean = new FilterRegistrationBean<>(); 
             registrationBean.setFilter(new FirstFilter()); 
             registrationBean.addUrlPatterns("/user/*"); 
             registrationBean.setOrder(1); 
             registrationBean.setName("first-filter"); 
             return registrationBean; 
        } 
    }
```
## 연습예제 

https://velog.io/@rainbowweb/%EC%8A%A4%ED%94%84%EB%A7%81%EB%B6%80%ED%8A%B8-Filter-%EC%84%A4%EC%A0%95-%EC%98%88%EC%A0%9C

## 참고

https://jronin.tistory.com/124
https://taetaetae.github.io/2020/04/06/spring-boot-filter/