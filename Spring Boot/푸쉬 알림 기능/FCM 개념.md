#FCM

##정의 

Firebase Cloud Messaging

메세지를 안정적으로 클라이언트 인스턴스에게 전송할 수 있는 교차 플랫폼 메시징 솔루션.

![firebase](./../../images/Spring/firebase.png)

애플리케이션 서버에서 전송된 메세지
-> 
FCM backend
->
클라이언트

FCM이 중간에 끼어있는 형태. 

##장점 

메세징을 클라이언트의 플랫폼(Web, Android, IOS) 별로 개발할 필요가 없음.

플랫폼 종속성 낮음.

##구성 요소 

1. 메세지를 작성하고 FCM backend에 전송할 수 있는 애플리케이션 서버 

2. 웹, IOS, Android 같은 클라이언트

## 동작 원리 

1. 클라이언트가 FCM 서버에서 고유하게 발급하는 FCM 토큰을 받는다.

2. 서버는 클라리언트로부터 해당 토큰을 전달받는다. 

3. 서버에서 메세징을 작성하고 FCM backend에 전달할 때, 클라이언트의 토큰을 같이 전달한다. 

4. FCM backend는 전달받은 메세징을 해당 토큰의 클라이언트에게 전달한다. 


## 참고 

https://kerobero.tistory.com/38

https://firebase.google.com/docs/cloud-messaging/js/client?hl=ko