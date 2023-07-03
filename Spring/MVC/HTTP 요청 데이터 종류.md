# HTTP 요청에 데이터 담는 종류

서버에 HTTP 요청을 보낼 때, 데이터를 담는 경우에 여러가지가 있다. 

## GET 쿼리 파라미터
GET요청을 보낼 때, URL에 쿼리 파라미터를 붙이는 경우.

형식    

    /hello?name=aa&age=10

메시지 바디를 쓰지 않기 때문에 content-type이 없다.

?뒤에 key와 value를 써준다. 

검색, 필터, 페이징등에 주로 사용한다. 

## POST - FORM 데이터 전송
쿼리 파라미터를 URL이 아닌 메세지 바디에 넣어서 전달한다. 

형식

    name=aa&age=10

형식은 GET 쿼리 파라미터와 동일하다. 단지 어디에 있느냐의 차이.

특이점은 content-type이 application/x-www-form-urlencoded

회원가입, 주문, HTML Form에 주로 사용.

서버입장에서는 url에 붙이나, 메세지바디에 붙이나 형식이 똑같아서 같은 걸로 인식한다.

## 메세지 바디 JSON 형식으로 전송

HTTP 요청 메시지 바디에 JSON 형식으로 넣어서 보내는 경우다.

주로 HTTP API에서 사용한다. 

형식 
~~~json
{
    "username" : "hello",
    "age" : 20
}
~~~