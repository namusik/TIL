# Spring Exception

## 서블릿의 예외 처리 방식

### 1. Exception(예외)

#### 자바 흐름

자바 main() 실행 -> main 쓰레드 생성 -> 실행 도중에 예외 발생 -> main() 넘어서 예외가 던저짐 -> 예외 정보를 남기고 쓰레드 종료

#### 웹 애플리케이션

사용자 요청마다 쓰레드가 할당되고, 서블릿 컨테이너 안에서 실행됨 -> 컨트롤러에서 예외가 발생 -> 인터셉터 -> 서블릿 -> 필터 -> WAS 까지 예외가 전달.

### 2. response.sendError(HTTP 상태 코드, 오류 메시지)

```java
@GetMapping("/error-404")
public void error404(HttpServletResponse response) throws IOException {
    response.sendError(404, "404  오류"); // HTTP 상태코드, 오류 메시지
    response.sendError(500); // HTTP 상태코드
}
```

#### sendError 흐름
컨트롤러에서 sendError 호출 -> reponse 내부에 오류 발생 상태 저장 -> 인터셉터 -> 서블릿 -> 필터 -> WAS에서 response에 sendError 호출 기록 확인

#### 특이점 
- sendError를 호출했다고 실제 예외가 발생한 것은 아님.

### 3. 서블릿 오류 화면 제공
```java
@Component 
public class WebServerCustomizer implements WebServerFactoryCustomizer<ConfigurableWebServerFactory> {
    @Override
    public void customize(ConfigurableWebServerFactory factory) {
        ErrorPage errorPage404 = new ErrorPage(HttpStatus.NOT_FOUND, "/error-page/404");
        ErrorPage errorPage500 = new ErrorPage(HttpStatus.INTERNAL_SERVER_ERROR, "/error-page/500");
        ErrorPage errorPageEx = new ErrorPage(RuntimeException.class, "/error-page/500");

        factory.addErrorPages(errorPage404, errorPage500, errorPageEx);
    }
}

@RequestMapping("/error-page/404")
public String errorPage404(HttpServletRequest request, HttpServletResponse response) {
    log.info("errorPage 404 ");    
    return "error-page/404";
}
```
- @Component 등록 필요
- WebServerFactoryCustomizer를 구현한 custom 클래스 생성
- customize 메서드를 override
- new ErrorPage에는 특정 HttpStatus를 넣을 수도 있고, 특정 예외 클래스를 넣을 수 도 있다. 이때, 자식 타입의 예외도 포함이 됨.
- 두번째 인자에는, 오류가 발생했을 때 호출할 controller 핸들러 주소를 넣어준다.
- 해당 컨트롤러의 핸들러를 호출하면, 지정해준 html 페이지를 응답.

#### 오류 페이지 요청 흐름 

예외가 WAS까지 전달됨 -> WAS에서 WebServerCustomizer를 보고 해당 HttpStatus, 예외에 맞는 api 요청 -> 필터 -> 서블릿 -> 인터셉터 -> 컨트롤러 -> View

- 클라이언트(웹 브라우저)에서는 최종 View만 확인하지 서버에서 일어나는 일련의 과정을 전혀 모른다.

- WAS에서 오류페이지 컨트롤러를 호출할 때, 오류정보를 request의 attribute에 추가해서 넘겨준다.

### 4. Filter - DispatcherType
- 흐름을 살펴보면, 최초의 request와 오류 페이지호출 request 모두 filter와 interceptor를 거치는 것을 알 수 있음. 
- 이렇게 중복으로 거치는 것은 비효율적
- 정상 request와 오류 request를 구분하기 위해 DistpatherType이 존재.
- REQUEST : 클라이언트 요청
- ERROR : 오류 요청
- FORWARD : 서블릿에서 다른 서블릿, JSP 호출

```java
public FilterRegistrationBean logFilter() {
  filterRegistrationBean.setDispatcherTypes(DispatcherType.REQUEST, DispatcherType.ERROR);
}
```
- setDispatcherType으로 어떤 타입에 filter를 적용시킬지 정할 수 있음.
- 디폴트는 REQUEST

### 5. Interceptor
- 인터셉터는 서블릿이 제공하는 기능이 아니기 때문에, DispatcherType을 사용할 수 없다.
- 대신 오류페이지를 호출하는 핸들러 경로를 제외시켜 주면 된다.


## 스프링부트의 예외 처리 방식 
- 스프링부트는 일련의 과정을 기본으로 제공한다. 
- `BasicErrorController`라는 에러 페이지 매칭 컨트롤러를 자동 등록함.
- `/error` 경로로 오류 페이지 호출
- `ErrorMvcAutoConfiguration`에서 오류 페이지 html 렌더링

### 오류 페이지 View 우선순위
- resources/templates/error > resources/static/error
- 500.html > 5xx.html

### BasicErrorController
- model에 예외 정보를 담아서 view에 보냄.
  - sendError()는 예외가 발생한 것이 아니기 때문에 exception 정보는 없음
- 