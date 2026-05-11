# JSP

# 의존성 추가
~~~gradle
//JSP 의존성 추가
implementation 'org.apache.tomcat.embed:tomcat-embed-jasper'
//JSTL 의존성 추가
implementation 'javax.servlet:jstl'
~~~


# 첫줄
~~~jsp
<%@ page contentType="text/html;charset=UTF-8" language="java" %>
~~~

jsp문서라는 뜻. 모든 JSP의 시작.

# 자바 코드 사용하기
JSP에서는 자바 코드를 그대로 사용할 수 있음. 

~~~jsp
<%  ~~  %>
안에 자바 코드를 입력.
html 태그 전에 주로 사용. 서버 로직처럼.
~~~

~~~jsp
<%@ page import="hello.servlet.domain.member.MemberRepository" %>
~~~
import할 때 사용.

~~~jsp
<%=member.getId()%>
~~~
자바 코드를 출력할 때 사용. html태그 내부에서 주로.

코드가 위에서 부터 순차적으로 돌아감.

# attribute 값 가져오기
${}
~~~jsp
${member.id}
~~~
request attribute에 있는 값을 가져온다.