# FCM으로 App에 Push 보내기

## FCM

## FCM Json 파일 다운받기

- FCM 서비스 계정 탭
  - Admin SDK 구성 스니펫 자바 선택
    - 복사
  - 새 비공개 키 생성
    - 다운받기

## Firebase Admin SDK 사용하기

https://firebase.google.com/docs/cloud-messaging/server?authuser=2&hl=ko

## topic 생성

## topic 관리

현재 fcm admin sdk 에서 topic 리스트를 불러오는 api는 없다.

topic을 새로 만들 때 db에 저장해줘야 한다.

그리고 해당 topic을 구독하는 토큰들도 저장해줘야 한다.

마찬가지로 unsubscribe 할 때는 delete 해야 한다.

그리고 기존 토픽에 이미 등록된 번호를 재구독 api를 요청하면 fcm 내부에서 중복 구독을 알아서 처리해준다. 따로 ㅇ

## 참고

https://zuminternet.github.io/FCM-PUSH/
