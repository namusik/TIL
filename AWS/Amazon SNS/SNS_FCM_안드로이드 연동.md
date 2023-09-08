# Aws SNS와 FCM 연동하기

## FCM 프로젝트 설정

1. 프로젝트 생성
2. 앱 추가하기
   1. 프로젝트 설정 > 일반 > 내 앱
   2. 앱에 Firebase 추가 > Android 선택
   3. Android 앱에 Firebase 추가 1. 앱 등록 1. Android 패키지 이름 : build.gralde의 `applicationId` 값 2. google-services.json 파일 추가 1. app 디렉토리 아래에 추가 3. 안드로이드 앱에 Firebase SDK 추가 1. 프로젝트 수준 build.gradle 1. `plugins{ id("com.google.gms.google-services") version "4.3.15" apply false}` 추가 2. 앱 수준 build.gradle 1. `plugins{ id("com.google.gms.google-services") version "4.3.15" apply false}` 추가 2. `dependencies {implementation(platform("com.google.firebase:firebase-bom:32.2.3"))  implementation ("com.google.firebase:firebase-messaging:22.0.0")}` 추가
      noAccessToProcedureBodies=true

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

## 엔드포인트에 메시지 게시

1. 각 전송 프로토콜의 사용자 지정 페이로드
   1. JSON 객체로 전송
2. 안드로이드 스튜디오에서 로그 확인
