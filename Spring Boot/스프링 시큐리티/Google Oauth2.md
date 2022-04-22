# Google

## 등록하기

1. 구글 클라우드 플랫폼 접속
https://console.cloud.google.com/getting-started?pli=1
</br>

2. 프로젝트 만들기
![project](../../images/Spring/googleproject.png)

</br>

3. OAuth 클라이언트 ID 만들기
![OauthID](../../images/Spring/OAuthid.png)

<br>

4. 먼저 동의화면 구성페이지로 이동됨 -> User Type 외부 선택
![usertype](../../images/Spring/userType.png)

</br>

5. 앱이름, 이메일 입력해주기
![accept](../../images/Spring/accept.png)

</br>

6. 가져올 정보 범위 설정. email, profile, openid 3개 선택
![range](../../images/Spring/range.png)
</br>
7. 테스트 사용자 설정은 패스. 
</br>
8. 다시 OAuth 클라이언트 ID 만들기 클릭.
</br>
9. 애플리케이션 유형, 이름, 리다이렉트 URI 설정

![client](../../images/Spring/client.png)


기본적으로 스프링에서 

{도메인}/login/oauth2/code/{소셜서비스코드}로 리다이렉트 URI을 지원하고 있습니다. 

따라서, 별도 Controller 구현없이 하기위해 제공되는 URI를 사용하면 됩니다. 

</br>
1.  생성된 클라이언트ID, 클라이언트 Secret 기억해두기