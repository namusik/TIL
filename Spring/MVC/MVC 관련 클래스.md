# MVC pattern

## 개념
과거에 servlet 혹은 jsp 안에서 비즈니스 로직, 뷰 처리를 모두 한번에 하던 것에서 탈피. 

비즈니스 로직과 뷰 로직을 구분한다. 

![mvc](../../images/Spring/springmvc.png)

## Front Controller Pattern (서블릿)
![frontcontroller](../../images/Spring/frontcontroller.png)

DispatcherServlet이 이 패턴이다. 

## Spring MVC
![springmvc](../../images/Spring/dispatcherservlet.png)

### 1. 서버에 HTTP 요청이 오면 DispatcherServlet.doDispatch()가 호출된다. 

#### DispatcherServlet
핵심 메서드
~~~java
doDispatch()
~~~

이 클래스 안에서 HTTP 요청을 처리하는 작업이 모두 들어있다. 

### 2. 먼저, 등록된 핸들러 매핑들을 우선순위 순서대로 쭉 돌린다. 각 핸들러 매핑에서 핸들러(컨트롤러)를 찾아서 반환한다. 없으면 다음 순위 핸들러 매핑 실행.

#### HandlerMapping
이미 여러가지 핸들러 매핑이 등록되어 있다. 

* RequestMappingHandlerMapping @RequestMapping 기반 컨트롤러 
* BeanNameUrlHandlerMapping 스프링 빈의 이름(url)

### 3. 핸들러 매핑으로 찾은 핸들러를 실행하기 위해 핸들러 어댑터가 필요하다. 해당하는 핸들러 어댑터를 우선순위 순서로 쭉 찾아서 해당하면 실행한다. 핸들러 어댑터 내부에서 핸들러를 실행.

### HandlerAdapter
핸들러 매핑으로 찾은 핸들러를 실행할 수 있는 핸들러 어댑터

* RequestMappingHandlerAdapter 애노티에션 기반. @RequestMapping.
* HttpRequestHandlerAdapter HttpRequestHandler 처리
* SimpleControllerHandlerAdapter Controller 인터페이스 처리.

핸들러매핑과 핸들러어댑터 우선순위부터 순차적으로 실행해서 찾는다.

## ArgumentResolver

핸들러 어댑터, 그 중에서도 애노테이션 기반을 처리하는 **RequestMappingHandlerAdapter**가 핸들러(Controller)를 호출할 때, ArgumentResolver를 사용한다. 

![argumentresolver](../../images/Spring/argumentresolver.png)

argumentResolver의 역할은 다양한 파라미터들의 객체를 생성해서 핸들러에 넘겨 주는 것이다. 

### ReturnValueHandler
ArgumentResolver가 요청을 받을 때 사용된다면, ReturnValueHandler는 응답을 보낼 때 사용된다. 

### ViewResolver
뷰 리졸버.
스프링은 뷰 리졸버를 자동으로 등록해준다. 

* BeanNameResolver Bean 이름으로 View 탐색.
* JSP - InternalResourceViewResolver
* Thymeleaf - ThymeleafViewResolver

~~~properties
spring.mvc.view.prefix=/WEB-INF/views/
spring.mvc.view.suffix=.jsp
~~~
등록을 해주어야함.

### View

뷰 리졸버가 반환하는 뷰.

JSTL 라이브러리 - JstlView 반환.

## HTTP 메시지 컨버터 

@ReponseBody를 사용하면, View로 이동하는 것이 아니라, HTTP 바디 메세지에 직접 쓰기 때문에, 뷰 리졸버를 찾는 것이 아니라 HTTPMessageConverter를 사용한다.

참고로, @RequestBody로 요청 데이터를 읽을 때도 HTTP 메시지 컨버터가 쓰인다. 

* StringHttpMessageConverter : String 처리
  * String 클래스 읽거나 반환 할 때. 
  * 미디어 타입은 무엇이나 가능
* MappingJackson2HttpMessageConverter : 객체 처리
  * HashMap이나 객체 클래스 읽거나 반환할 때.
  * 미디어 타입은 application/json 만.

HTTP 메시지 컨버터는 ArugmentResolver와 ReturnValueHandler에서 사용된다.
