# ODBC 설정

## ODBC란

- Open Database Connectivity
- 애플리케이션이 데이터베이스에 접근할 수 있게 해주는 표준 인터페이스
- 드라이버나 연결 문자열을 직접 코딩하지 않고, DSN 이름만으로 DB에 연결할 수 있다.

## 설정 파일 : `/etc/odbc.ini`

```ini
[kpa]
Driver = MySQL
Description = MySQL Connector for umm
SERVER = 서버주소
PORT = 3306
USER = 사용자
Password = 비밀번호
Database = mms
Charset = utf8
```

- `[kpa]` : DSN(Data Source Name) 이름. 연결 시 이 이름으로 참조
- `Charset` : DB의 실제 캐릭터셋에 맞게 지정 (utf8, euckr)

## 연결 테스트 : `isql`

```bash
isql DSN이름 사용자ID 비밀번호
```

```bash
isql kpa id passwd
```

- **unixODBC** 패키지에 포함된 명령줄 도구
- 연결 성공 시 `SQL>` 프롬프트가 뜨고, 직접 쿼리 실행 가능
- 연결 실패 시 에러 메시지 출력
