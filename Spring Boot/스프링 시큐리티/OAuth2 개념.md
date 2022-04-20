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

## 출저

    https://velog.io/@sonypark/OAuth2-%EC%9D%B8%EC%A6%9D