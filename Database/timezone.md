# DB 서버 타임존

## 개념
- TIMESTAMP 컬럼은 “세션 타임존” 기준으로 작동
- MySQL 서버 는 세션 타임존(@@session.time_zone) 으로 들어온 값을 해석해 UTC로 변환하여 저장, 조회 시 다시 세션 타임존으로 변환합니다

## Mysql

```mysql
SELECT @@global.time_zone, @@session.time_zone, @@system_time_zone;
```

### @@global.time_zone

- RDS 인스턴스 전체(Global) 수준의 시간대 설정값
  - aws rds 클러스터가 아닌 인스턴스 단위별로 적용되는 값
  - 서버 전체(모든 세션 기본값) 이 사용하는 표준 타임존
  - time_zone 파라미터가 “클러스터 파라미터 그룹”에 존재
    - Aurora 클러스터 전체의 기본 타임존 (Writer/Reader 공통 적용)

### @@session.time_zone

- 현재 접속 중인 세션(커넥션)만의 시간대입니다.
  - MySQL은 접속할 때 이 세션 타임존을 자동으로 global 값으로 복사합니다.
  - 이후 SET time_zone = '+00:00'; 같은 명령으로 세션별로 따로 변경 가능

### @@system_time_zone

- 운영체제(OS)의 실제 시스템 시간대
  - MySQL이 설치된 호스트(OS) 수준에서의 시간대이며, 보통 UTC로 유지합니다.
  - RDS에서는 Amazon 리눅스 기반으로 OS 시간을 UTC로 고정해둡니다.
- 물리적 OS 시간은 UTC지만, MySQL이 논리적으로 이를 KST로 해석


## JDBC URL에서의 설정

```sh
jdbc-url: jdbc:mysql://aaa.ap-northeast-2.rds.amazonaws.com:3306/aaa?serverTimezone=Asia/Seoul
```

- JDBC URL의 serverTimezone 설정은 MySQL 드라이버에게 “DB 서버의 시간대를 이렇게 간주하라”고 알려주는 역할
- serverTimezone 값을 “참고해서 해석만” 할 뿐, 실제로 DB에 넘길 때는 그냥 자바에서 받은 시각(로컬 시각)을 그대로 MySQL 서버에 전달


## 서버 시간

### LocalDateTime.now()
- LocalDateTime 은 타임존(UTC, KST 등)에 대한 정보가 전혀 없는 “순수한 시·분·초” 값


## 흐름
### 저장 시 (INSERT)

1. JDBC 드라이버는 serverTimezone 을 기반으로 “서버가 Asia/Seoul로 동작할 것이다”라고 가정
   1. (즉, 이 값이 UTC든 Asia/Seoul이든, MySQL에는 전달되지 않습니다.)

2. 드라이버는 LocalDateTime을 그대로 'YYYY-MM-DD HH:MM:SS' 문자열 형태로 MySQL에 전송

3. MySQL 서버는 그 문자열을 세션 타임존(@@session.time_zone) 기준 로컬시각으로 해석(interpretation) 합니다.

4. 그 값을 UTC로 변환(normalization) 해서 TIMESTAMP 내부 저장소에 저장합니다.

→ 따라서 실제 UTC 변환을 수행하는 건 DB, 드라이버는 “서버가 어떤 타임존일 거야”라고 가정할 뿐

⸻

### 조회 시 (SELECT)

1. MySQL은 내부에 저장된 UTC 값을 읽습니다.
2. 이 값을 현재 세션의 @@session.time_zone 기준으로 변환
3. 변환된 “로컬 시각”이 JDBC로 반환됩니다.
4. 드라이버는 이 문자열을 LocalDateTime 으로 매핑합니다. (즉, 다시 타임존 정보 없는 “로컬 시각 객체”로 돌려줌)


### 고민

- 굳이 jdbcurl에 serverTimezone 옵션을 넣을 필요가 있을까?
- mysql 서버 시간대와 애플리케이션 서버 시간대만 일치하면 문제 없을 수도
- 글로벌 기업으로 전환될 때 asia/seoul 타임존일 때 이걸 utc로 변환해야 할까?