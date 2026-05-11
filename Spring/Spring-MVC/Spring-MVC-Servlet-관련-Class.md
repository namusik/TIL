# Spring Boot 에서의 Servlet

## 개념




## 동작
1. 스프링 부트 실행
2. 스프링 부트가 내장 톰캣 서버 생성
3. 톰캣 서버는 내부에 서블릿 컨테이너를 가지고 있음. 
4. 서블릿 컨테이너 안에 서블릿들을 생성해줌. 
5. Http 요청이 오면 메시지를 기반으로 request, response 객체를 생성해서 서블릿에 넘겨줌. 
6. 서블릿에서 작업을 하면 response객체를 가지고 HTTP 응답을 만들어서 웹에 응답.
7. 
## 사용법

### @ServletComponentScan

~~~java
@SpringBootApplication
@ServletComponentScan //서블릿 자동 등록
public class ServletApplication {

    public static void main(String[] args) {
        SpringApplication.run(ServletApplication.class, args);
    }
}
~~~
main() 메서드가 존재하는 클래스 붙인다. 
Servlet components 들을 스캔해서 빈으로 등록한다. 

### @WebServlet
~~~java
@WebServlet(name = "helloServlet", urlPatterns = "/hello")
public class HelloServlet extends HttpServlet {
    @Override
    protected void service(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
    
    }
}
~~~

클래스를 서블릿으로 만들어주는 애노테이션.
위에 servletcomponentscan의 대상임을 설정하는 것. 

HttpServlet을 상속받아 service()메서드를 override. 

Servlet이 호출되면 자동으로 service()를 호출.

## HttpServletRequest

ServletRequest 상속한 클래스.

HTTP Request 메시지를 알아서 파싱해서 객체로 만들어줌.

임시 저장소 기능
HTTP 요청이 끝날 때까지 유지되는 임시 저장소.
~~~java
저장 : request.setAttribute(name, value)
조회 : request.getAttribute(name)
~~~

세션 관리 기능
~~~java
request.getSession(true)
~~~
현재의 세션을 반환 혹은 없으면 만들어줌.

~~~java
request.getParameter(name)
~~~
URL에 붙은 쿼리 파라미터의 값을 가져올 수 있음.

# HttpServletResponse
ServletResponse를 상속.

HTTP 응답메시지를 대신 생성해준다. 

~~~java
response.setStatus(int)
~~~
응답 코드 설정.
HttpServletResponse안에 필드로 다 들어있음.

~~~java
response.sendRedirect("/basic/hello-form.html");
~~~

리다이렉트 설정. 알아서 응답코드도 302로 바뀜.

응답을 보낼 때는 
~~~java
response.getWriter().writer(내용)
혹은
response.getWriter().println()
~~~
으로 하면 된다.

