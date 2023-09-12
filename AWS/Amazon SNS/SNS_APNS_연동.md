# Amazon SNS APNS 모바일 푸시 알림 연동

[가이드](https://aws.amazon.com/ko/about-aws/whats-new/2021/11/amazon-sns-token-authentication-api-mobile-notifications/)

## 개념

토큰 기반 알림을 지원

.p8 키 파일 사용. 매년 갱신할 필요가 없어짐.

토큰 기반 인증은 Amazon SNS와 Apple Push Notification Service(APNS) 간 무상태 통신을 제공

무상태 통신은 인증서를 검토하기 위한 APNS가 필요하지 않으므로 인증서 기반 통신보다 빠르다.

## 애플 developer program 등록

[가이드](https://developer.apple.com/kr/support/app-account/)

등록금 필요
129,000/년

## Amazon SNS 설정

1. Mobile > 푸시 알림
   1. 플랫폼 애플리케이션 생성
      1. 이름
      2. 푸시 알림 플랫폼
         1. FCM 선택
      3. API 키 입력
         1. FCM에서 생성 필요
         2. FCM 프로젝트 설정 > 클라우드 메시징
         3. Cloud Messaging API 햄버거 클릭 > Cloud Messaging 사용 버튼 클릭
         4. 생성된 서버 키 사용
   2. 애플리케이션 엔드포인트 생성
      1. 디바이스 토큰 입력
         1. 안드로이드 앱에 코드를 추가해서 FCM 토큰을 받아서 입력 후 생성 (아래 설명)
