# Amazon SNS FCM 모바일 푸시 알림 연동

## FCM 프로젝트 설정

1. 프로젝트 생성
2. 앱 추가하기
   1. 프로젝트 설정 > 일반 > 내 앱
   2. 앱에 Firebase 추가 > Android 선택
   3. Android 앱에 Firebase 추가
      1. 앱 등록
         1. Android 패키지 이름 : build.gralde의 `applicationId` 값
         2. google-services.json 파일 추가
            1. app 디렉토리 아래에 추가
         3. 안드로이드 앱에 Firebase SDK 추가
            1. 프로젝트 수준 build.gradle
               1. `plugins{ id("com.google.gms.google-services") version "4.3.15" apply false}` 추가
            2. 앱 수준 build.gradle
               1. `plugins{ id("com.google.gms.google-services")}` 추가
               2. `dependencies {implementation(platform("com.google.firebase:firebase-bom:32.2.3"))  implementation ("com.google.firebase:firebase-messaging:22.0.0")}` 추가

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
2. 주제 생성
   1. 유형
      1. 표준 선택
         1. 모바일 애플리케이션 엔드포인트를 구독으로 설정하려면 표준을 선택해야 한다.
   2. 액세스 정책
      1. 현재 dev에서는 **alex-moring**이라는 계정을 쓰는데, 이 계정은 권한이 S3, SES FullAccess만 가지고 있다. SNS 권한추가가 필요.
         1. 권한 추가 완료
3. 구독 생성
   1. 프로토콜
      1. 플랫폼 애플리케이션 엔드포인트
   2. 엔드포인트
      1. 위에서 생성한 애플리케이션 엔드포인트의 ARN을 입력.

## 안드로이드 앱 생성

1. 안드로이드 스튜디오 설치
2. New Project > Empty Activity
3. FCM 토큰 확인 코드

   ```kotlin
       override fun onCreate(savedInstanceState: Bundle?) {
         .....
        logRegToken()
      }
       private fun logRegToken() {
        // [START log_reg_token]
        Firebase.messaging.token.addOnCompleteListener { task ->
            if (!task.isSuccessful) {
                Log.w(TAG, "Fetching FCM registration token failed", task.exception)
                return@addOnCompleteListener
            }

            // Get new FCM registration token
            val token = task.result

            // Log and toast
            val msg = "FCM Registration token: $token"
            Log.d(TAG, msg)
            Toast.makeText(baseContext, msg, Toast.LENGTH_SHORT).show()
        }
        // [END log_reg_token]
    }
   ```

4. SNS 메시지 수신 후 로그 남기는 코드

```kotlin
package com.example.megabird_android

import com.google.firebase.messaging.FirebaseMessagingService
import com.google.firebase.messaging.RemoteMessage
import android.util.Log

class MyFirebaseMessagingService : FirebaseMessagingService() {
    companion object {
        private const val TAG = "MyFirebaseMsgService"
    }

    // [START receive_message]
    override fun onMessageReceived(remoteMessage: RemoteMessage) {
        // TODO(developer): Handle FCM messages here.
        // Not getting messages here? See why this may be: https://goo.gl/39bRNJ
        Log.d(TAG, "From: ${remoteMessage.from}")

        // Check if message contains a data payload.
        if (remoteMessage.data.isNotEmpty()) {
            Log.d(TAG, "Message data payload: ${remoteMessage.data}")
        }

        // Check if message contains a notification payload.
        remoteMessage.notification?.let {
            Log.d(TAG, "Message Notification Body: ${it.body}")
        }
    }
    // [END receive_message]
}
```

5. 위에 만든 클래스 manifest 추가

```xml
<service
   android:name=".MyFirebaseMessagingService" //클래스 경로
   android:exported="false">
   <intent-filter>
         <action android:name="com.google.firebase.MESSAGING_EVENT" />
   </intent-filter>
</service>
```

안드로이드 FCM 샘플 코드
https://github.com/firebase/snippets-android/blob/a5b7968230d3d256182b3b9f50a01df626a11a7b/messaging/app/src/main/java/com/google/firebase/example/messaging/kotlin/MainActivity.kt

## SpringBoot 코드

### AmazonSNS 라이브러리 추가

```java
// aws sns
implementation 'com.amazonaws:aws-java-sdk-sns:1.12.123'
```

### AmazonSNS Bean 등록

```java
public class SNSConfiguration {

    @Value("AWS 액세스 키")
    private String awsAccessKey;

    @Value("AWS 시크릿 키")
    private String awsSecretKey;

    @Bean
    public AmazonSNS amazonSNS() {
        BasicAWSCredentials awsCredentials = new BasicAWSCredentials(awsAccessKey, awsSecretKey);
        return AmazonSNSClient.builder()
                .withRegion(Regions.AP_NORTHEAST_2) // SNS 리전 선택
                .withCredentials(new AWSStaticCredentialsProvider(awsCredentials))
                .build();
    }
}
```

```java
void sendPushToTopic() {
    String message = "본문내용";
    String topicArn = "푸시 알림을 보낼 토픽 ARN";

    PublishRequest publishRequest = new PublishRequest()
            .withMessage(message) //본문
            .withTopicArn(topicArn);

    PublishResult publishResult = amazonSNS.publish(publishRequest);

    log.info("Message sent: {}" , publishResult.getMessageId());
}
```

## 고려 사항

1. API가 전달받을 데이터 형식, SNS에 전달할 데이터 형식
2. 메시지 저장 여부
   1. 메시지를 저장한다면 어디에 저장해야 하나
      1. 현재의 DB 테이블?
      2. Redis?
3. SQS 사용 여부
   1. 메시지를 큐에 저장.
   2. 전달이 실패한 경우에도 다시 시도할 수 있다.
4. 대용량 처리?
   1. 이벤트 App Push 발생
   2. SNS에 메시지만 보내면 됨.
   3. 발신번호가 따로 필요없다. 앱 내부에 fcm push를 받는 코드가 있을 것이기 때문에.
