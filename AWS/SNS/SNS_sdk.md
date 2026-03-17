# SNS aws sdk

## java 코드 예제

https://docs.aws.amazon.com/ko_kr/sns/latest/dg/service_code_examples_actions.html

## Api Reference

https://docs.aws.amazon.com/sns/latest/api/API_Operations.html

## sns 주제 생성

필요한 값

- 주제 이름

1. 중복된 이름의 주제를 등록하면 예외는 발생하지 않지만 중복 등록도 되지 않는다.
2. 특정 주제의 ARN 정보를 가져오는 함수는 없다.
3. 전체 주제ARN 리스트를 가져오는 함수만 있음.
   1. ARN의 형식이 정해져있기 때문에 SNS 주제의 name만 알고있으면 조합가능

## sns 주제 삭제

필요한 값

- SNS 주제 ARN

## 푸시 알림 플랫폼 애플리케이션 생성

필요한 값

- 사용할 플랫폼 (FCM / APNS)
- 이름
- 각 플랫폼 서버키 혹은 인증키

참고 : https://docs.aws.amazon.com/sns/latest/api/API_SetPlatformApplicationAttributes.html

중복된 이름과, 서버키를 가지고 재요청을 보내도 예외는 터지지 않는다. 그리고 중복생성되지 않는다.

## 푸시 알림 플랫폼 애플리케이션 엔드포인트 생성

필요한 값

- 해당 디바이스 토큰
- 등록하려는 플랫픔 애플리케이션 ARN

## Application 프로토콜 유형 구독 생성

필요한 값

- 주제의 ARN
- 플랫폼 애플리케이션 엔드포인트 값

## 특정 주제의 구독자 리스트 가져오기

필요한 값

- 주제의 ARN

## 주제에 메시지 발송

https://docs.aws.amazon.com/sns/latest/api/API_Publish.html
