# Servlet (서블릿)

## 정의

- 클라이언트의 요청을 받고, 그에 대한 응답을 만들어내는 웹 요청을 처리하기 위한 **자바(Java) 클래스(코드 조각)**
- Java의 표준 웹 기술 스펙(Java EE / Jakarta EE)에 정의된 **웹 요청을 처리하는 기본 단위이자 규약(인터페이스/추상 클래스)**

## 예시

```java
// src/main/java/com/example/servlet/HelloServlet.java

package com.example.servlet; // 패키지 정의

import java.io.IOException; // 입출력 예외 처리를 위한 import
import java.io.PrintWriter; // 클라이언트에게 데이터를 보내기 위한 import

import javax.servlet.ServletException; // 서블릿 관련 예외 처리를 위한 import
import javax.servlet.http.HttpServlet; // HTTP 서블릿 기능을 사용하기 위한 import
import javax.servlet.http.HttpServletRequest; // HTTP 요청 정보를 받기 위한 import
import javax.servlet.http.HttpServletResponse; // HTTP 응답 정보를 보내기 위한 import

// HttpServlet 클래스를 상속받아 HTTP 요청을 처리할 서블릿을 정의합니다.
public class HelloServlet extends HttpServlet {

    // GET 요청이 왔을 때 호출되는 메서드
    // HttpServletRequest: 클라이언트의 요청 정보를 담고 있는 객체 (URL, 헤더, 파라미터 등)
    // HttpServletResponse: 클라이언트에게 보낼 응답 정보를 설정하고 데이터를 쓰는 객체
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        // 1. 응답의 콘텐츠 타입 설정: 웹 브라우저에게 "HTML 문서로 해석해!"라고 알려줍니다.
        response.setContentType("text/html;charset=UTF-8");

        // 2. 클라이언트에게 데이터를 보낼 출력 스트림을 얻습니다.
        PrintWriter out = response.getWriter();

        // 3. HTML 내용을 작성하여 클라이언트에게 보냅니다.
        out.println("<!DOCTYPE html>");
        out.println("<html>");
        out.println("<head>");
        out.println("<title>Hello Servlet</title>");
        out.println("</head>");
        out.println("<body>");
        out.println("<h1>안녕하세요, 순수 Servlet으로 만든 페이지입니다!</h1>");
        out.println("<p>이것은 doGet() 메서드가 처리한 결과입니다.</p>");
        out.println("</body>");
        out.println("</html>");

        // 4. 스트림을 닫습니다.
        out.close();
    }

    // POST 요청이 왔을 때 호출되는 메서드 (여기서는 GET과 동일하게 처리)
    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        doGet(request, response); // POST 요청이 오면 doGet 메서드를 호출하여 동일하게 처리
    }
}
```
- 독립 실행 불가능: 
  - 위 HelloServlet.java 파일에는 **public static void main(String[] args)** 메서드가 없다. 
  - 즉, 이 파일만으로는 직접 실행할 수 없고, 이 코드는 오직 웹 서버(정확히는 WAS/서블릿 컨테이너인 Tomcat) 위에서만 의미를 가진다.
- Tomcat에게 의존: 
  - 누가 이 doGet 메서드를 호출해주고, request와 response 객체를 만들어주자면 **바로 Tomcat**

## Servlet Container

- 서블릿들의 생명주기(생성, 실행, 소멸)를 관리하고, 요청이 들어오면 어떤 서블릿에게 일을 시킬지 연결해주는 역할
- 서블릿을 담아서 실행시켜주는 그릇
- 대표적으로 Tomcat

### Tomcat 설정 순수 Java 방식

```xml
<!-- src/main/webapp/WEB-INF/web.xml -->

<!DOCTYPE web-app PUBLIC
 "-//Sun Microsystems, Inc.//DTD Web Application 2.3//EN"
 "http://java.sun.com/dtd/web-app_2_3.dtd" >

<web-app>
  <display-name>Hello Servlet Application</display-name>

  <!-- 1. 서블릿 정의: 우리가 만든 HelloServlet 클래스를 Tomcat에게 "이런 서블릿이 있어요!"라고 알려줍니다. -->
  <servlet>
    <servlet-name>HelloServlet</servlet-name> <!-- 서블릿의 논리적인 이름 (아무거나 가능) -->
    <servlet-class>com.example.servlet.HelloServlet</servlet-class> <!-- 서블릿 클래스의 완전한 경로 -->
  </servlet>

  <!-- 2. 서블릿 매핑: 어떤 URL 패턴으로 요청이 들어오면 어떤 서블릿을 실행할지 연결합니다. -->
  <servlet-mapping>
    <servlet-name>HelloServlet</servlet-name> <!-- 위에서 정의한 서블릿의 논리적인 이름 -->
    <url-pattern>/hello</url-pattern> <!-- 이 URL 패턴으로 요청이 오면 해당 서블릿을 실행 -->
  </servlet-mapping>

</web-app>
```
- web.xml의 역할: 
  - 이 파일은 Tomcat에게 "만약 /hello라는 URL로 요청이 들어오면, com.example.servlet.HelloServlet이라는 클래스를 찾아서 실행시켜줘!"라고 지시하는 설정서
- servlet 태그: 
  - HelloServlet이라는 이름을 가진 서블릿이 com.example.servlet.HelloServlet 클래스에 의해 구현된다는 것을 선언
- servlet-mapping 태그: 
  - HelloServlet이라는 이름의 서블릿을 /hello라는 URL 경로에 매핑