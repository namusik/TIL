# .serialize()

## 용도 

    form에 있는 객체들을 한번에 받을 수 있음. 

    직렬화 : 입력받은 여러 데이터를 하나의 쿼리 문자열로 만드는 것. 

## 형식

    key1=value1&key2=value2

## 사용법 

$("form #id 또는 .name").serialize()

    HTML form 요소를 통해 입력된 데이터를 쿼리 문자열로 변환.

예시
~~~javascript
$.ajax({
 url: ajax_url
 ,type: "POST"
 ,data : $("#Form").serialize() //name1=value1&name2=value2
 ,success: function(json){
 }
});
~~~

~~~html
<form id='Form'>

  <input type='text' name='name1' value='value1'>

  <input type='text' name='name2' value='value2'>

</form>
~~~



## 참고

http://www.tcpschool.com/jquery/jq_ajax_form

https://m.blog.naver.com/PostView.naver?isHttpsRedirect=true&blogId=perpectmj&logNo=220411799224
