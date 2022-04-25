#OAuth2

## 정의
    The OAuth 2.0 Authorization Framework

    OAuth은 "인가"를 위해 사용하는 프레임워크다.

    토큰을 기반으로 하는 인가 프레임워크



## 배경

    나의 서비스에서 다른 서비스(google, facebook)을 이용할 수 있는 방법은 다른 서비스의 아이디와 비밀번호를 입력받아 사용하는 것이다. 

    하지만, 이 방법은 사용자, 나의 서비스, 다른 서비스 모두에게 위험을 가지고있는 방식이다. 

## 특징 

    실제 비밀번호 대신 AccessToken이라는 비밀키를 주고 받음. 

    OAuth2는 다른 서비스로부터 이런 AccessToken을 받아내는 기술이다. 

    이 AccessToken을 가지고 해당 서비스의 일부 기능을 이용할 수 있게됨.

## OAuth 필수 4요소

    1. Resource Owner : 일반 사용자

    2. Client : 나의 서비스. Resource Owner가 실질적으로 사용하려하는 서비스

    3. Authorization Server : 인가의 주체자. 구글, 네이버. 페이스북, 카카오 ....
       1. 인증을 받은 이후에, OAuth로 인가를 받으면 Access Token이 발급됨.

    4. Resource Server
       1.  Access Token을 얻은 Application의 인증받은 요청에 대해서 핸들링을 하는 곳.
       2.  Authorization Server로 부터 발급받은 토큰을 확인하거나, 인가받았는지 여부를 확인하는 문지기 역할
       3.  Authorization Server - 매표소. Resource Server - 검표하는 곳.
       4.  3가지 역할
           1.  Aceess Token의 확인
           2.  Scope의 확인 - 해당 Cient의 권한 범위
           3.  에러코드 및 비인가 접근에 대한 처리
       5.  실제로 하는 역할은 필터에 가까운 모습. 

## Client가 Authorization Server에 전달해야 하는 것들

    1. Client id, client secret : Client 고유의 id, password
    2. Redirect URL : id, secret 확인 후 다시 제어권을 돌려받을 수 있는 리다이렉트할 주소.
    3. response_type :  Authorization Server의 응답유형에 대한 정의

    위 3가지를 먼저, Auth Server에서 받아야 함. 

    로그인 요청시 위 3가지 요소가 일치 했을 때 OAuth 로그인 성공.

## OAuth Grant Type

    OAuth 2.0에는 Clientrㅏ OAuth Provider로 부터 토큰을 받아가는 4가지 방식

    Grant Type에 따라 파라미터의 종류를 다르게 하거나 값을 달리해서 보냄.

## OAuth2 흐름

![oauth](../../images/Spring/OAuth2.jpeg)

1. Client는 이미 등록을 통해 id, secret, redirect url을 가지고 있는 상태
</br>   
2. 사용자가 로그인을 하면 Auth server에서 redirect url 뒤에 Authorization Code를 붙여서 발급
   1. redirect_url?code={code}
</br>   
3. Client는 위 4가지 정보를 Auth server로 전송. 
</br>   
4. 4가지 정보가 모두 일치하면 Access Token 발급.
   1. 이 떄, 역할을 다한 Authorization Code는 삭제됨. 
</br>   
5. 발급받은 Access Token을 활용해 Resource Server의 기능을 이용할 수 있음. 
</br>
![oauth2](../../images/Spring/Oauth22.png)

6. Refresh Token을 사용하는 경우.
   1. Access Token에는 유효기간이 있음. 
   2. Access Token 재발급을 위해 Refresh Token 사용.
   3. Access Token은 주로 세션에 저장하고
   4. Refresh Token은 주로 DB에 저장한다. 


## 출저

https://velog.io/@sonypark/OAuth2-%EC%9D%B8%EC%A6%9D

https://otrodevym.tistory.com/entry/spring-boot-%EC%84%A4%EC%A0%95%ED%95%98%EA%B8%B0-9-oauth2-%EC%84%A4%EC%A0%95-%EB%B0%8F-%ED%85%8C%EC%8A%A4%ED%8A%B8-%EC%86%8C%EC%8A%A4

https://blinders.tistory.com/63?category=825013