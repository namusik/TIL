#OAuth2

## 정의

    OAuth2의 핵심역할은 AccessToken을 얻어내는 것.

## 배경

    나의 서비스에서 다른 서비스(google, facebook)을 이용할 수 있는 방법은 다른 서비스의 아이디와 비밀번호를 입력받아 사용하는 것이다. 

    하지만, 이 방법은 사용자, 나의 서비스, 다른 서비스 모두에게 위험을 가지고있는 방식이다. 

## 특징 

    실제 비밀번호 대신 AccessToken이라는 비밀키를 주고 받음. 

    OAuth2는 다른 서비스로부터 이런 AccessToken을 받아내는 기술이다. 

    이 AccessToken을 가지고 해당 서비스의 일부 기능을 이용할 수 있게됨.

## OAuth 인증 주체

    1. User : 일반 사용자

    2. App(client) : 나의 서비스

    3. Auth Server : 구글, 네이버 같은 AccessToken을 제공해주는 곳.
       1. Resource server : 리소스 저장 서버. API 제공.
       2. Authorization server : 인증 담당 서버. accesstoken을 client에 제공. 일반적으로 리소스 서버와 인증서버를 분리

## OAuth를 위해 필요한 것

    1. Client ID : 퍼블릭한 키
    2. Client Secret : 시크릿 키. 
    3. Redirect URL : id, secret 확인 후 리다이렉트할 주소.

    위 3가지를 먼저, Auth Server에서 받아야 함. 

    로그인 요청시 위 3가지 요소가 일치 했을 때 OAuth 로그인 성공.

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