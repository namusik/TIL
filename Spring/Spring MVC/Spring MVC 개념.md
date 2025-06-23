# Spring MVC pattern

## 개념
과거에 servlet 혹은 jsp 안에서 비즈니스 로직, 뷰 처리를 모두 한번에 하던 것에서 탈피. 

비즈니스 로직과 뷰 로직을 구분한다. 

![mvc](../../images/Spring/springmvc.png)

## Front Controller Pattern (서블릿)
![frontcontroller](../../images/Spring/frontcontroller.png)

DispatcherServlet이 이 패턴이다. 

## Spring MVC (Model-View-Controller)
![springmvc](../../images/Spring/dispatcherservlet.png)

- Spring Framework의 여러 모듈 중 하나로, 웹 애플리케이션 개발을 위한 프레임워크
- Model (모델): 
  - 애플리케이션의 비즈니스 로직과 데이터를 담당합니다. (예: 데이터베이스에서 데이터를 가져오거나, 계산을 수행하는 부분)
- View (뷰): 
  - 사용자에게 보여지는 UI 화면을 담당합니다. (예: HTML, CSS, JavaScript로 이루어진 웹 페이지)
- Controller (컨트롤러): 
  - 클라이언트의 **요청을 받아서 모델과 뷰를 연결해주는 역할**을 합니다. (예: 사용자가 요청한 URL에 따라 어떤 비즈니스 로직을 실행하고 어떤 화면을 보여줄지 결정)
  - DispatcherServlet을 중심으로 하여, @Controller, @GetMapping 등 **어노테이션 기반으로 웹 요청을 효율적으로 처리할 수 있도록 추상화된 '프레임워크'**
  - 개발자는 직접 서블릿을 만들지 않고 Spring MVC의 규칙에 따라 @Controller를 만듭니다.
- Spring MVC는 웹 요청을 효율적으로 처리하고, **애플리케이션의 구조를 명확하게 분리**하여 유지보수를 쉽게 하기 위한 '웹 개발 방식'을 제공

## Spring MVC Servlet
- Spring MVC는 여전히 웹 요청을 처리하기 위해 Servlet 기술을 사용
- 대신 Java에서 개발자가 직접 HttpServlet을 상속받아 서블릿 클래스를 만들고 web.xml을 작성하는 대신
- **DispatcherServlet이라는 '단 하나의 대표 서블릿'** 이 모든 웹 요청을 받도록 설계
  - 이 DispatcherServlet 자체가 HttpServlet을 상속받아 구현
- DispatcherServlet은 @Controller, @RestController, @GetMapping 등 **Spring MVC의 편리한 어노테이션 기반 기능**을 사용하여, 들어온 요청을 개발자가 작성한 특정 메서드(예: HelloController의 hello() 메서드)로 **효율적으로 위임(delegate)**


## Spring MVC 흐름

### 0. 애플리케이션 시작 및 초기 설정 (Tomcat + DispatcherServlet 준비)

- Spring Boot 앱 실행
  - SpringBootTomcatApplication.java의 main 메서드를 실행합니다 (java -jar my-app.jar).
- 내장 Tomcat 구동:
  - **@SpringBootApplication** 어노테이션과 **spring-boot-starter-web 의존성** 덕분에, Spring Boot는 내부적으로 경량화된 Tomcat 라이브러리를 로드하고, **기본 포트(보통 8080)로 웹 서버를 자동으로 시작**.
  - Tomcat은 이제 8080 포트에서 클라이언트의 HTTP 요청을 기다림.
- `DispatcherServlet` 등록:
  - Spring Boot는 Spring MVC의 핵심인 org.springframework.web.servlet.DispatcherServlet 인스턴스를 자동으로 생성하고
  - 이를 **Tomcat에 '유일한' 서블릿으로 등록**
  - Tomcat에게 "모든 웹 요청(/*)은 이 DispatcherServlet이 처리하도록 넘겨줘!"라고 지시하는 것과 같다. (과거 web.xml의 역할을 Spring Boot가 대신하는 셈)
- 컨트롤러 및 매핑 정보 스캔:
  - Spring Boot는 @ComponentScan (자동 설정의 일부)을 통해 HelloController와 같이 **@Controller 또는 @RestController 어노테이션이 붙은 클래스들을 찾아 스캔**
  - 이 클래스들 안에 있는 @GetMapping, @PostMapping 등의 어노테이션을 분석하여, **어떤 URL 경로가 어떤 메서드에 연결되어 있는지 매핑 정보를 파악**하고, 이 정보를 DispatcherServlet이 사용할 수 있도록 준비

### 1. Client의 웹 요청 (HTTP Request)
- 사용자: 웹 브라우저(크롬, 엣지 등)에 http://localhost:8080/hello (또는 http://localhost:8080/greet/world)를 입력하고 Enter
- 브라우저: 웹 브라우저는 이 URL에 해당하는 HTTP GET 요청 메시지를 생성하여 localhost 서버의 8080 포트로 전송

### 2. Tomcat의 요청 수신 및 DispatcherServlet 호출

- Tomcat (웹 서버): 8080 포트에서 클라이언트로부터 GET /hello (또는 GET /greet/world) 라는 **HTTP 요청 메시지를 가장 먼저 수신**
- Tomcat의 서블릿 컨테이너 역할:
  - Tomcat은 이 요청이 자신이 관리하는 **DispatcherServlet에 매핑되어 있음을 인지**합니다.
  - Tomcat은 `HttpServletRequest` 객체 (클라이언트의 요청 정보를 담음)와 `HttpServletResponse` 객체 (서버의 응답을 작성할 도구)를 생성
  - 그리고 이 두 객체를 인자로 넘겨주면서 **DispatcherServlet의 service() 메서드를 호출**
  - Tomcat은 여기서 직접 응답을 만들지 않는다. 주방에 주문을 건네주는 웨이터 역할


### 3. 서버에 HTTP 요청이 오면 DispatcherServlet.doDispatch()가 호출된다. 

- DispatcherServlet (Spring MVC의 Front Controller): Tomcat으로부터 HttpServletRequest와 HttpServletResponse 객체를 전달받음
  - 요청 분석: DispatcherServlet은 HttpServletRequest를 분석하여 요청 URL (/hello 또는 /greet/world), HTTP 메서드 (GET), 요청 헤더, 파라미터 등 **모든 요청 정보를 파악**
  - **핸들러 매핑** (Handler Mapping): DispatcherServlet은 **미리 준비된 매핑 정보**(단계 0에서 Spring Boot가 스캔하여 준비한 정보)를 조회하여, /hello GET 요청에 해당하는 **처리 메서드(HelloController의 hello() 메서드)** 를 찾음.
  - **핸들러 어댑터** (Handler Adapter): 적절한 처리 메서드를 찾았으면, DispatcherServlet은 **해당 메서드를 실제로 호출하기 위해 HandlerAdapter를 사용**합니다. 
    - 이 어댑터는 메서드의 인자들(예: @PathVariable String name)을 HttpServletRequest에서 추출하여 올바른 타입으로 변환하고 **메서드에 전달**합니다.

### 4. Controller 메서드의 비즈니스 로직 실행 (Model-Controller의 'C')

- HelloController (당신의 컨트롤러): DispatcherServlet에 의해 hello() 또는 greet() 메서드가 호출됨.
- 모델과의 상호작용
  - 만약 복잡한 애플리케이션이라면, 컨트롤러는 이 단계에서 데이터베이스 연동이나 복잡한 계산 등을 위해 **Service 계층(Model)** 의 메서드를 호출하고, 그 결과를 받아서 처리
- 결과 반환: 메서드의 최종 결과 값(예: "Hello, Spring Boot!")이 **DispatcherServlet으로 다시 반환**됩니다.

### 5. DispatcherServlet의 응답 처리 및 변환 (View-Controller의 'V' 또는 Direct Response)

- DispatcherServlet: 컨트롤러 메서드의 반환 값을 받음.
  - Case A: @RestController (REST API - 주로 JSON/XML 등 데이터 반환)
    - DispatcherServlet은 컨트롤러에 @RestController 어노테이션이 붙어있거나 메서드에 @ResponseBody가 붙어있음을 인지. 이는 "반환 값이 직접 HTTP 응답 본문이 되어야 한다"는 의미
    - **HttpMessageConverter** 사용: DispatcherServlet은 적절한 HttpMessageConverter (예: StringHttpMessageConverter for String, MappingJackson2HttpMessageConverter for Java 객체를 JSON으로)를 사용하여 컨트롤러가 반환한 객체를 HTTP 응답의 body 부분에 적절한 형식(예: 일반 텍스트, JSON 문자열)으로 변환하고 HttpServletResponse 객체에 기록
  - Case B: @Controller (전통적인 웹 - 주로 HTML 페이지 반환)
    - 컨트롤러 메서드가 **논리적인 뷰 이름** (예: return "index";)을 반환하고, Model 객체에 데이터를 담았다면:
    - **뷰 리졸버** (View Resolver): DispatcherServlet은 ViewResolver (예: ThymeleafViewResolver, InternalResourceViewResolver 등)를 사용하여 "index"라는 논리적인 뷰 이름을 실제 물리적인 뷰 리소스(예: src/main/resources/templates/index.html)로 찾아냄.
    - **뷰 렌더링** (View Rendering): 찾아낸 뷰(예: index.html Thymeleaf 템플릿)가, 컨트롤러가 Model에 담아 보낸 데이터(예: model.addAttribute("message", "환영합니다!"))를 가지고 HTML을 최종적으로 렌더링. 이 과정에서 HTML 파일 내의 플레이스홀더([[${message}]])가 실제 데이터로 채워짐.
    - 생성된 최종 HTML이 HttpServletResponse 객체에 기록됩니다.
  - 응답 헤더 설정: DispatcherServlet은 HttpServletResponse에 Content-Type, Status Code (예: 200 OK) 등 필요한 HTTP 응답 헤더를 설정합니다.

### 6. Tomcat의 최종 응답 전송 (HTTP Response)

- Tomcat 
  - DispatcherServlet이 HttpServletResponse 객체에 모든 응답 데이터를 완벽하게 작성하고 나면, 제어권은 다시 Tomcat으로 돌아옵니다.
- Tomcat의 역할
  - HttpServletResponse 객체에 담긴 최종적인 응답 메시지(상태 코드, 헤더, 본문)를 **HTTP 프로토콜에 맞춰 클라이언트의 웹 브라우저로 네트워크를 통해 전송**합니다.

## DispatcherServlet 상세 구조
핵심 메서드
~~~java
doDispatch()
~~~
DispatcherServlet은 HttpServlet을 상속받았다.

이 method안에 아래의 HTTP 요청을 처리하는 작업이 모두 들어있다. 

### 2. 먼저, 등록된 핸들러 매핑들을 우선순위 순서대로 쭉 돌린다. 각 핸들러 매핑에서 핸들러(컨트롤러)를 찾아서 반환한다. 없으면 다음 순위 핸들러 매핑 실행.
URI가 일치하는 Handler 반환.
~~~java
mappedHandler=getHandler(processRequest)
~~~

#### HandlerMapping
최종 구현체 핸들러 매핑이 등록되어 있다. 각 HandlerMapping에는 Order, 우선순위가 있다. 

* RequestMappingHandlerMapping @Controller가 붙어있는 경우 인식 (0)
* BeanNameUrlHandlerMapping 스프링 빈의 이름(url) order(2)
* WelcomePageHandlerMapping (2)
* RouterFunctionMapping order(3)
* SimpleUrlHandlerMapping (2147483646)

등이 있다.

**위에 3개는 WebMvcConfigurationSupport에서 setOrder()를 통해 우선순위를 부과한다.** 

**SimpleUrlHandlerMapping의 order가 특이한 이유는 Integer의 MaxValue에서 1을 뺀 크기로 지정해놨기 때문이다.**

#### AbstractHandlerMapping
HandlerMapping의 구현체. 
여기서 구현한 getHandler()가 호출된다.

### 3. 핸들러 매핑으로 찾은 Handler를 실행하기 위해 HandlerAdapter가 필요하다. 반환받은 Handler를 support하는 HanlderAdapter를 반환한다. HandlerAdapter 내부에서 Handler를 실행. 그리고 ModelAndView를 반환한다.

~~~java
HandlerAdapter ha = getHandlerAdapter(mappedHandler.getHandler());

mv = ha.handle(processedRequest, response, mappedHandler.getHandler());
~~~


#### HandlerAdapter
핸들러 매핑으로 찾은 핸들러를 실행할 수 있는 핸들러 어댑터

* RequestMappingHandlerAdapter 애노티에션 기반. @RequestMapping.
* HttpRequestHandlerAdapter HttpRequestHandler 처리
* SimpleControllerHandlerAdapter Controller 인터페이스 처리.

핸들러어댑터 우선순위부터 순차적으로 supports를 실행해서 true를 찾는다.
~~~java
boolean supports(Object handler)
//handler instance가 주어졌을 때, support 여부 boolean 반환

ModelAndView handle(HttpServletRequest request, HttpServletResponse response, Object handler)
//http request, response, hanlder를 받아 handle한다. 여기서 ModelAndView를 반환한다.
~~~

#### HandlerMethod
`RequestMappingHandlerAdapter`를 사용하면 불러오는 Handler들이 HandlerMethod 형태로 넘어온다.

#### ArgumentResolver

핸들러 어댑터, 그 중에서도 애노테이션 기반을 처리하는 **RequestMappingHandlerAdapter**가 핸들러(Controller)를 호출할 때, ArgumentResolver를 사용한다. 

![argumentresolver](../../images/Spring/argumentresolver.png)

argumentResolver의 역할은 다양한 파라미터들의 객체를 생성해서 핸들러에 넘겨 주는 것이다. 

#### ReturnValueHandler
ArgumentResolver가 요청을 받을 때 사용된다면, ReturnValueHandler는 응답을 보낼 때 사용된다. 

#### HTTP 메시지 컨버터 

@ReponseBody를 사용하면, View로 이동하는 것이 아니라, HTTP 바디 메세지에 직접 쓰기 때문에, ViewResolver 대신 HTTPMessageConverter를 사용한다.

참고로, @RequestBody로 요청 데이터를 읽을 때도 HTTP 메시지 컨버터가 쓰인다. 

* StringHttpMessageConverter : String 처리
  * String 클래스 읽거나 반환 할 때. 
  * 미디어 타입은 무엇이나 가능
* MappingJackson2HttpMessageConverter : 객체 처리
  * HashMap이나 객체 클래스 읽거나 반환할 때.
  * 미디어 타입은 application/json 만.

HTTP 메시지 컨버터는 ArugmentResolver와 ReturnValueHandler에서 사용된다.

### 4. 뷰 렌더링 함수 호출 
~~~java
private void processDispatchResult(
  render(mv, request, response);
)
~~~

### 5. ViewResolver 를 통해서 View 반환
~~~java
view = resolveViewName(viewName, mv.getModelInternal(), locale, request);
~~~

#### ViewResolver
뷰 리졸버.
스프링은 아래의 ViewResolver들을 자동으로 등록해준다. 

* BeanNameResolver - Bean 이름으로 View 탐색.
* JSP - InternalResourceViewResolver
* Thymeleaf - ThymeleafViewResolver

#### View

뷰 리졸버가 반환하는 뷰.

JSP 사용 - InternalResourceView 반환
JSTL 라이브러리 존재 - JstlView 반환.
Thymeleaf - ThymeleafView

#### 6. 반환받은 View 렌더링해서 HTML 응답.
~~~java
view.render(mv.getModelInternal(), request, response);
~~~

InternalResourceView
~~~java
renderMergedOutputModel(
  rd.forward(request, response);
)
~~~
InternalResourceView는 render()안에서 forward를 통해 JSP 실행

ThymeleafView는 바로 렌더링함.


