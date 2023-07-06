# Spring에서 html 관련 설정


## 첫화면 html 위치
war 인 경우
src/main/webapp에 index.html이라는 이름으로 넣으면 홈페이지로 설정된다. 

## html 끼리 이동
~~~html
<a href="basic.html">
~~~
이동하려는 html 경로 써주기.

혹은 
~~~html
<button onclick="location.href='items.html'" type="button">
~~~
버튼 태그 onclick에 location.href로 html 넣어주기.

## webapp/WEB-INF 폴더 
WAR 일 경우 에만.
WEB-INF 안에 JSP가 있으면 외부에서 다이렉트로 이동이 불가능하고, 서버를 거쳐야 한다. 

## resources/static/
Jar 일 경우 정적리소스 위치.

resources/static/index.html
Welcome 페이지 위치 및 이름.

웹브라우저에서 경로로 바로 실행이 가능하다. 

## resources/templates

뷰 템플릿. 

주로 동적 뷰 템플릿이 위치한다. 

## 부트스트랩 적용
Compiled CSS and JS 다운
압축풀기 후 bootstrap.min.css 복사
resources/static/css 경로에 붙여넣기

Html에서 적용할 때는
~~~html
<link href="부트스트랩 파일 경로" rel="stylesheet">
~~~ 
