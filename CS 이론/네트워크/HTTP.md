# HTTP

## multipart/form-data

### 개념
- 요청 바디를 여러 “파트(part)”로 나누어 전송하는 표준 형식
- 주로 파일 업로드에 사용
- 각 파트는 개별 헤더와 **콘텐츠(바이너리/텍스트)**를 갖습니다. 파트 사이를 구분하기 위해 **boundary(경계 문자열)**를 사용

- Content-Type: multipart/form-data; boundary=<임의문자열>
	•	boundary는 파트들의 시작/끝을 구분하는 토큰입니다. 클라이언트가 임의로 생성하며, 바디 안에서 --<boundary> 형태로 사용
각 Part 구조:
	•	최소 Content-Disposition 헤더가 필요합니다.
	•	form-data; name="<필드명>"; filename="<파일명>" (파일일 때 filename 포함)
	•	(선택) Content-Type 헤더: 파일이면 MIME 타입(예: image/png)
	•	빈 줄 후 실제 콘텐츠(바이너리/텍스트)
	•	마지막 표식: 바디 끝은 --<boundary>-- 로 닫습니다.

```http
POST /client/v1/attach/info/bp_0001_20200924145602 HTTP/1.1
Host: api.rcs.uplus.co.kr
Authorization: Bearer <access_token>
Content-Type: multipart/form-data; boundary=----Boundary7MA4YWxkTrZu0gW

------Boundary7MA4YWxkTrZu0gW
Content-Disposition: form-data; name="attach_file"; filename="image.png"
Content-Type: image/png

<PNG 바이너리 바이트...>
------Boundary7MA4YWxkTrZu0gW--
```