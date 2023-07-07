# Thymeleaf
타임리프는 서버 사이드 렌더링을 위한 용도로 사용된다. 


타임리프는 순수 HTML 코드를 해치지 않고 작성이 가능하다. 
그래서 HTML파일을 그대로 열어서 브라우저에서 확인도 가능하다. 
서버를 통해 뷰 템플릿을 거치면 동적으로 변경된 값을 확인할 수 도 있다. 

이런 특징을 가진 템플릿을 natural templates라고 한다. 

## 공식문서
https://www.thymeleaf.org/doc/tutorials/3.1/usingthymeleaf.html

https://www.thymeleaf.org/doc/tutorials/3.1/thymeleafspring.html

## gradle 추가
~~~gradle
implementation 'org.springframework.boot:spring-boot-starter-thymeleaf'
~~~

## 타임리프 사용 선언
~~~html
<html xmlns:th="http://www.thymeleaf.org">
~~~

## 핵심
~~~html
th:href
~~~
기존 html 속성 앞에 th를 붙여주면 되는데.
뷰 템플릿을 통해 볼 때는 th가 적용되고, HTML 파일을 열어 볼 때는 th 없다고 인식해서 모두 사용할 수 있다.

## 기능들
#### Escape 텍스트 출력
~~~html
<li>hello <span th:text="${data}"></span></li>
~~~
th:text 속성을 통해 텍스트를 출력할 수 있다. 

또는
~~~html
<li>hello [[${data}]]</li>
~~~
[[]]를  사용하면 HTML 콘텐츠 안에서 바로 데이터를 출력할 수 있다. 

참고로 th:text와 [[]]를 사용하면 자동으로 **이스케이프가** 적용되어서 <>같은 특수문자들을 태그의 시작이 아닌 HTML 엔티티(문자열) 그대로 인식하게 된다. 

#### Unescape 텍스트 출력
~~~html
<li> <span th:utext="${data}"></span></li>
~~~
Unescape, 즉 HTML에서 사용하는 태그들의 효과를 적용시키려면 **th:utext**를 사용 해야 한다. 

~~~html
<li><span th:inline="none">[(...)] = </span>[(${data})]</li>
~~~
또는 [(...)]를 사용하면 unescape를 적용할 수 있다.

#### th:inline="none"
~~~html
<li><span th:inline="none">[(...)] = </span>[(${data})]</li>
~~~
해당 속성을 주면 이 태그 안에서는 타임리프가 해석하지 말라는 옵션을 줄 수 있다. 


#### URL 링크 표현식
~~~html
th:href="@{/hello/world}"
th:href="@{resources/css/main.css}"
~~~
@{...}는 타임리프에서 api url이나 정적 리소스 경로를 표현할 때 쓴다. 

~~~html
th:href="@{/basic/items/{itemId}(itemId=${item.id})}" 
~~~
링크 표현식을 쓰면 경로 변수를 쉽게 넣을 수 있다. ()는 변수 생성해주는 부분인데, url의 가장 끝에 써준다.

~~~html
th:href="@{/basic/items/{itemId}(itemId=${item.id}, query='test')}"

<li><a th:href="@{/hello(param1=${param1}, param1=${param2})}">same name query parameter</a></li>
~~~
링크 표현식에는 쿼리 파라미터도 (..)안에 추가할 수 있다. url에 경로 변수가 없는 변수들은 쿼리 파라미터로 적용된다.
단, 경로변수명과 쿼리파라미터명은 서로 달라야 한다. 
쿼리파라미터끼리는 이름 중복 사용 가능.

#### 리터럴 대체 
~~~html
th:onclick="|location.href='@{/basic/items/add}'|"

th:href="@{|/basic/items/${item.id}|}"
~~~

**|.....|** 문자와 표현식을 같이 써주기 위해 사용한다.

#### 변수 표현식
~~~html
th:text="${item.price}"
~~~
${...}을 통해 model로 전달받은 값이나, 타임리프에서 변수로 설정한 값을 조회할 수 있다.

변수표현식에서는 SrpingEL 이라는 스프링 표현식을 그대로 사용할 수 있다. 

~~~html
객체 <span th:text="${user.username}"></span>
리스트 <span th:text="${users[0].username}"></span>
맵 <span th:text="${userMap['userA'].username}"></span>
~~~

#### 지역 변수 선언하기
~~~html
<div th:with="first=${users[0]}">
    <span th:text="${first.username}"></span>
</div>
<div th:text="${first.usernmae}"></div> --> 사용 불가
~~~
**th:with** 속성을 통해 태그 안에서 변수를 만들고 그 안에서 해당 변수를 쓸 수 있다. 

다른 태그에서는 변수를 인식하지 못한다.

#### 요청 쿼리파라미터 받기
~~~html
<h2 th:if="${param.status}" th:text="'저장완료'"></h2>
~~~
${**param.쿼리 파라미터명**}을 쓰면
URL에 붙어있는 쿼리파라미터를 타임리프에서 바로 조회할 수 있다. 

컨트롤러에서 꺼내서 모델에 담아줄 수고를 대신 해준다.

#### 내용 변경
~~~html
<td th:text="${item.quantity}">10</td>
~~~

td 태그의 값인 10을 **th:text**의 값으로 바꿀 수 있다. 

#### 속성 변경
~~~html
<input type="text" id="itemId" name="itemId" class="form-control"
value="1" th:value="${item.id}" readonly>
~~~
**th:value**는 태그 안에 있는 value 속성을 변경해준다. 

#### FORM th:action
~~~html
<form action="item.html" th:action th:object="${item}"  method="post">
</form>
~~~
form 에서 **th:action**을 통해 요청을 보낼 경로를 입력할 수 있다. 

아무 값을 입력하지않으면 현재의 HTTP URL에 그대로 POST method로 요청을 보내게 된다.

보통 같은 URL을 써서 GET은 뷰 이동용, POST는 객체 등록용으로는 쓰는 기법에 쓴다. 

#### 반복문
~~~html
<tr th:each="item : ${items}">
    <td th:text="${item.price}">10000</td>
</tr>
~~~
th:each. for each 문과 유사한 방법이다. 
item 변수를 th:each 안에서 ${item}으로 조회할 수 있다. 


