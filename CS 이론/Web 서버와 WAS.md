# Web 서버와 WAS

## 요약 

웹 서버는 정적 파일을 제공하는 서버 

WAS는 동적 컨텐츠를 제공하는 서버

## Web Server (웹 서버)

- **정적 콘텐츠**를 제공하는 서버
  - 누가 언제 요청하든 변하지 않는 파일들 (이미지, css, index.html)
- `Apache`, `Nginx`

## Web Application Server (WAS)

- **동적 콘텐츠**를 제공하는 서버
  - 요청에 따라 결과가 바뀌는 콘텐츠
  - 개인정보, 개인 게시글 등등
- 요청을 받으면 프로그래밍 로직을 실행해서 결과를 내려줌.
- `Tomcat`
  - 스프링은 was가 아니다.
  - 스프링 부트 프로젝트에 embedded tomcat(was)가 포함되어 있는 것.

## 참고 

https://gmlwjd9405.github.io/2018/10/27/webserver-vs-was.html

https://www.ibm.com/kr-ko/cloud/learn/web-server-vs-application-server