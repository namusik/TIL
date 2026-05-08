# MySQL 비밀번호

> 최종 업데이트: 2026-05-07 | 기준: MySQL 8.0 / 8.4, RDS for MySQL 8.0, Aurora MySQL 3.x

## 개념

MySQL의 비밀번호는 단순한 "문자열 비교"가 아니라 **인증 플러그인 + 해시 저장 + 정책 시스템**의 조합으로 동작한다.

- **인증 플러그인** — 비밀번호를 어떤 알고리즘으로 검증할지 결정 (`caching_sha2_password`, `mysql_native_password` 등)
- **저장 위치** — 모든 비밀번호 관련 정보는 `mysql.user` 테이블에 해시 형태로 저장
- **정책** — 만료(lifetime), 강도 검증(validate_password), 재사용 금지(reuse history), 다중 비밀번호(dual password) 등

> 비유하자면 출입카드 시스템에 가깝다. 카드(비밀번호) 자체뿐 아니라, 어떤 리더기(플러그인)를 쓸지·언제 만료시킬지·예전 카드 재사용을 막을지·새 카드 발급 동안 옛 카드도 잠깐 같이 살릴지까지 모두 정책으로 묶여 있다.

## 배경/역사

| 버전 | 변화 |
|------|------|
| **MySQL 5.6** | 기본 인증 플러그인 `mysql_native_password` (SHA-1 기반) |
| **MySQL 5.7.4** | **비밀번호 만료(`default_password_lifetime`) 도입** — 초기 기본값 360일 |
| **MySQL 5.7.6** | `ALTER USER ... PASSWORD EXPIRE` 등 정책 SQL 정비 |
| **MySQL 5.7.11** | 운영 사고 다발로 `default_password_lifetime` **기본값 0**(비활성)으로 변경 |
| **MySQL 8.0** | **`caching_sha2_password` 기본 인증 플러그인으로 채택**, 비밀번호 검증 정책을 컴포넌트(`validate_password`)로 재구성 |
| **MySQL 8.0.13** | `password_require_current` (변경 시 현재 비밀번호 요구) |
| **MySQL 8.0.14** | **Dual Password (이중 비밀번호)** — 무중단 로테이션 |
| **MySQL 8.4** | `mysql_native_password` **기본 비활성화** (옵션으로만 활성 가능) |
| **MySQL 9.0** | `mysql_native_password` **완전 제거 예정** |

## 인증 플러그인

비밀번호를 어떻게 검증할지 결정하는 모듈. `IDENTIFIED WITH <plugin>`으로 사용자 단위 지정.

| 플러그인 | 도입 | 특징 |
|----------|------|------|
| **`caching_sha2_password`** | 8.0 (기본) | SHA-256 해시 + 메모리 캐시. 첫 인증은 TLS/RSA 키 교환 필요, 이후는 빠른 캐시 hit |
| **`mysql_native_password`** | 4.1~ | SHA-1 기반의 레거시 표준. 8.4부터 기본 비활성, 9.0에서 제거 예정 |
| **`sha256_password`** | 5.6 | 순수 SHA-256. 매번 풀 검증이라 느림 → `caching_sha2_password`로 사실상 대체 |
| **`auth_socket`** | — | OS 사용자 = MySQL 사용자로 연결 (소켓 기반, 비밀번호 없음) |
| **`authentication_ldap_*`** | 8.0 (Enterprise) | LDAP 연동 |
| **`authentication_kerberos`** | 8.0.26+ | Kerberos SSO |
| **`authentication_aws`** | RDS/Aurora | IAM 인증 — RDS 전용 |

```sql
-- 사용자 생성 시 플러그인 지정
CREATE USER 'app'@'%' IDENTIFIED WITH caching_sha2_password BY '실제 사용할 비밀번호(평문)';

-- 기존 사용자 변경 (다른 플러그인으로)
ALTER USER 'legacy'@'%' IDENTIFIED WITH mysql_native_password BY '실제 사용할 비밀번호(평문)';

-- 현재 사용자별 인증 방식 확인
SELECT user, host, plugin FROM mysql.user;
```

> **MySQL 8.0+에서는 `IDENTIFIED WITH caching_sha2_password`를 생략해도 동일하게 동작**한다. 기본 플러그인이 `caching_sha2_password`이기 때문에 `CREATE USER 'app'@'%' IDENTIFIED BY '비밀번호';`만 써도 자동으로 `caching_sha2_password`로 생성된다. **명시가 필요한 경우**: ① 기본값과 다른 플러그인(`mysql_native_password`, `auth_socket` 등)을 쓸 때, ② 5.7/8.x 혼용 환경에서 버전별 동작을 명확히 고정하고 싶을 때.

```sql
-- 현재 서버의 기본 인증 플러그인 확인
SHOW VARIABLES LIKE 'default_authentication_plugin';
-- 또는
SELECT @@default_authentication_plugin;
-- MySQL 8.0 → caching_sha2_password
-- MySQL 8.4+ → caching_sha2_password (mysql_native_password는 기본 비활성)
```

### `caching_sha2_password` 동작 흐름

| 인증 시점 | 동작 |
|-----------|------|
| 첫 인증 | SHA-256 풀 검증 (느림). **TLS** 또는 **RSA 공개키 교환** 필수 — 평문 패스워드 전송 방지 |
| 이후 인증 | 메모리 캐시 hit → 즉시 통과 (`mysql_native_password` 수준 속도) |
| 서버 재시작 | 캐시 초기화 → 다음 인증은 다시 풀 검증 |

> **자주 만나는 에러**: `Authentication plugin 'caching_sha2_password' cannot be loaded` — 구 클라이언트(MySQL 5.7용 JDBC, 일부 GUI)는 이 플러그인을 모름. 해결: 드라이버 업그레이드(`mysql-connector-j` 8.x+) 또는 사용자를 `mysql_native_password`로 임시 변경.

## `mysql.user` 테이블의 비밀번호 관련 컬럼

| 컬럼 | 타입 | 설명 |
|------|------|------|
| `authentication_string` | text | **비밀번호 해시**(평문 저장 안 함) |
| `plugin` | char(64) | 인증 플러그인 이름 |
| `password_last_changed` | timestamp | 마지막 비밀번호 변경 시각. 만료 판정 기준점 |
| `password_lifetime` | smallint unsigned | 계정별 수명(일). NULL/0/N 의미 → 아래 표 |
| `password_expired` | enum('N','Y') | 즉시 강제 만료 플래그 |
| `password_reuse_history` | smallint unsigned | 재사용 금지 이력 개수 |
| `password_reuse_time` | smallint unsigned | 재사용 금지 기간(일) |
| `password_require_current` | enum('N','Y','') | 변경 시 현재 비밀번호 요구 (8.0.13+) |
| `account_locked` | enum('N','Y') | 계정 잠금 |
| `user_attributes` | json | 다중 비밀번호 등 부가 속성 (8.0.14+) |

## 비밀번호 만료 정책

만료 정책은 **글로벌 기본값** + **계정별 오버라이드**의 2단계로 동작한다.

| 단계 | 설정 위치 | 설명 |
|------|-----------|------|
| 글로벌 | `default_password_lifetime` 시스템 변수 | 서버 전체 기본값 (일) |
| 계정별 | `mysql.user.password_lifetime` 컬럼 | 계정 단위 오버라이드. 글로벌보다 우선 |

### 글로벌 — `default_password_lifetime`

| 항목 | 값 |
|------|------|
| Scope | GLOBAL |
| Dynamic | Yes (재부팅 불필요) |
| Range | `0` ~ `65535` (일) |
| Default | `0` (비활성) |

```sql
SHOW GLOBAL VARIABLES LIKE 'default_password_lifetime';
SET GLOBAL default_password_lifetime = 90;     -- 90일
SET GLOBAL default_password_lifetime = 0;      -- 비활성
```

### 계정별 — `password_lifetime`

| 컬럼 값 | 의미 | 동등한 ALTER USER 구문 |
|---------|------|------------------------|
| `NULL` | 글로벌 정책 따름 | `PASSWORD EXPIRE DEFAULT` |
| `0` | 절대 만료 안 함 | `PASSWORD EXPIRE NEVER` |
| `N` (양수) | 이 계정만 N일마다 만료 | `PASSWORD EXPIRE INTERVAL N DAY` |

```sql
ALTER USER 'app_user'@'%' PASSWORD EXPIRE INTERVAL 90 DAY;
ALTER USER 'app_user'@'%' PASSWORD EXPIRE NEVER;
ALTER USER 'app_user'@'%' PASSWORD EXPIRE DEFAULT;
ALTER USER 'app_user'@'%' PASSWORD EXPIRE;       -- 즉시 강제 만료
```

### 만료 판정 로직

```
나이(days) = NOW() - password_last_changed
허용수명   = COALESCE(password_lifetime, default_password_lifetime)

IF password_expired = 'Y'   → 만료
ELSIF 허용수명 = 0          → 만료 안 됨
ELSIF 나이 > 허용수명       → 만료
ELSE                        → 정상
```

### 만료된 비밀번호로 접속 시

만료된 계정은 **샌드박스 모드(restricted mode)** 진입.

```sql
mysql> SELECT 1;
ERROR 1820 (HY000): You must reset your password using ALTER USER
statement before executing this statement.

mysql> ALTER USER USER() IDENTIFIED BY '새 비밀번호';
mysql> SELECT 1;   -- 정상 동작
```

| `disconnect_on_expired_password` | 동작 |
|----|------|
| `ON` (기본값) | 클라이언트가 만료 처리를 못하면 즉시 연결 끊김 |
| `OFF` | 일단 연결은 받고 비밀번호 변경 SQL만 허용 |

> 레거시 커넥션 풀이나 일부 ORM은 만료 응답을 못 알아듣고 죽는다. 운영 중 만료가 갑자기 적용되면 무작위 커넥션 폭사로 이어질 수 있음.

## 비밀번호 강도 검증 — `validate_password` 컴포넌트

8.0부터 **컴포넌트** 형태로 제공(이전엔 플러그인). 비밀번호 변경 시 강도를 강제한다.

```sql
-- 컴포넌트 설치
INSTALL COMPONENT 'file://component_validate_password';

-- 현재 정책 확인
SHOW VARIABLES LIKE 'validate_password.%';
```

| 변수 | 기본값 | 설명 |
|------|--------|------|
| `validate_password.policy` | MEDIUM | LOW / MEDIUM / STRONG |
| `validate_password.length` | 8 | 최소 길이 |
| `validate_password.mixed_case_count` | 1 | 대소문자 각각 최소 개수 (MEDIUM+) |
| `validate_password.number_count` | 1 | 숫자 최소 개수 (MEDIUM+) |
| `validate_password.special_char_count` | 1 | 특수문자 최소 개수 (MEDIUM+) |
| `validate_password.dictionary_file` | NULL | 금지어 사전 파일 경로 (STRONG) |
| `validate_password.check_user_name` | ON | 사용자명을 비밀번호로 못 쓰게 |

| 정책 | 검사 항목 |
|------|-----------|
| LOW | 길이만 |
| MEDIUM (기본) | 길이 + 숫자 + 대소문자 혼용 + 특수문자 |
| STRONG | MEDIUM + 4자 이상의 부분 문자열을 사전 파일과 비교 |

```sql
-- 강도 직접 평가
SELECT VALIDATE_PASSWORD_STRENGTH('hunter2');   -- 0~100점
```

## 비밀번호 재사용 금지

이전 N개 또는 N일 이내의 비밀번호를 다시 못 쓰게 막는 기능.

| 변수 | 의미 |
|------|------|
| `password_history` | 직전 N개 비밀번호 재사용 금지 |
| `password_reuse_interval` | N일 이내 사용한 비밀번호 재사용 금지 |

```sql
-- 글로벌 기본값
SET PERSIST password_history = 5;
SET PERSIST password_reuse_interval = 365;

-- 계정별 오버라이드
ALTER USER 'app'@'%' PASSWORD HISTORY 5;
ALTER USER 'app'@'%' PASSWORD REUSE INTERVAL 365 DAY;
```

이력은 `mysql.password_history` 테이블에 보관된다.

## 변경 시 현재 비밀번호 요구 (8.0.13+)

탈취된 세션이 비밀번호를 마음대로 바꾸지 못하게 한다.

```sql
ALTER USER 'app'@'%' PASSWORD REQUIRE CURRENT;

-- 변경 시
ALTER USER USER() IDENTIFIED BY '새 비밀번호' REPLACE '기존 비밀번호';
```

## 다중 비밀번호(Dual Password) — 8.0.14+

운영에서 **무중단 비밀번호 로테이션**을 위한 핵심 기능. 옛 비밀번호와 새 비밀번호를 잠시 동시에 살려둘 수 있다.

```sql
-- 1. 새 비밀번호 등록, 기존 것 보조 비밀번호로 유지
ALTER USER 'app'@'%' IDENTIFIED BY '새 비밀번호' RETAIN CURRENT PASSWORD;

-- 2. 애플리케이션 설정을 '새 비밀번호'로 모두 갱신/배포

-- 3. 기존(보조) 비밀번호 폐기
ALTER USER 'app'@'%' DISCARD OLD PASSWORD;
```

> Secrets Manager 자동 로테이션도 내부적으로 이 흐름을 활용한다. 이 기능 없이는 비밀번호 교체 = 일시적 인증 실패가 거의 필연이다.

## RDS / Aurora에서의 적용

### 1. 글로벌 정책은 파라미터 그룹으로

`SET GLOBAL`이 막힌 경우가 많아 **DB 파라미터 그룹**에서 변경한다.

```sh
aws rds describe-db-parameters \
  --db-parameter-group-name my-mysql-pg \
  --query "Parameters[?ParameterName=='default_password_lifetime']"

aws rds modify-db-parameter-group \
  --db-parameter-group-name my-mysql-pg \
  --parameters "ParameterName=default_password_lifetime,ParameterValue=90,ApplyMethod=immediate"
```

| 항목 | 값 |
|------|----|
| 그룹 종류 | DB Parameter Group (RDS for MySQL) / DB Cluster Parameter Group (Aurora) |
| Apply Type | Dynamic (재부팅 불필요) |
| 권장 운영값 | `0`(비활성) 또는 `90`~`180` |

`validate_password.*`, `password_history`, `password_reuse_interval` 등도 동일하게 파라미터 그룹에서 설정.

### 2. 계정별 정책은 `ALTER USER`

`mysql.user`는 RDS에서도 직접 UPDATE 불가. 반드시 `ALTER USER`.

```sql
ALTER USER 'app_user'@'%' PASSWORD EXPIRE NEVER;
ALTER USER 'batch_user'@'%' PASSWORD EXPIRE INTERVAL 365 DAY;
```

### 3. 마스터 유저 / `rdsadmin`

| 계정 | 비고 |
|------|------|
| **Master User** | 일반 사용자처럼 만료 정책 영향. **Secrets Manager 자동 로테이션 권장** |
| **`rdsadmin`** | RDS 내부 시스템 계정. 사용자가 건드리지 말 것. 만료 정책 영향 없음 |

> 마스터 유저 비밀번호가 만료되면 `aws rds modify-db-instance --master-user-password`로 즉시 재설정. 단, 애플리케이션 커넥션 문자열도 동기화.

### 4. IAM 인증

비밀번호 대신 IAM 토큰으로 접속 가능. 토큰은 15분 유효.

```sql
CREATE USER 'iam_user'@'%' IDENTIFIED WITH AWSAuthenticationPlugin AS 'RDS';
GRANT SELECT ON appdb.* TO 'iam_user'@'%';
```

```sh
TOKEN=$(aws rds generate-db-auth-token \
  --hostname mydb.cluster-xxx.rds.amazonaws.com \
  --port 3306 --username iam_user)
mysql -h mydb... -u iam_user --enable-cleartext-plugin -p"$TOKEN"
```

## 비밀번호 변경

```sql
-- 자기 자신 변경
ALTER USER USER() IDENTIFIED BY '새 비밀번호';

-- 특정 사용자 변경
ALTER USER 'app'@'%' IDENTIFIED BY '새 비밀번호';

-- 인증 플러그인까지 변경
ALTER USER 'app'@'%' IDENTIFIED WITH caching_sha2_password BY '새 비밀번호';

-- 즉시 만료시키기 (다음 로그인 시 재설정 강요)
ALTER USER 'app'@'%' PASSWORD EXPIRE;

-- 잠금 / 해제
ALTER USER 'app'@'%' ACCOUNT LOCK;
ALTER USER 'app'@'%' ACCOUNT UNLOCK;
```

> 비밀번호를 변경하면 `password_last_changed`가 현재 시각으로 갱신되어 만료 카운트가 다시 시작된다.

## 운영 점검 쿼리

```sql
-- 만료 임박 계정 찾기
SELECT user, host,
       password_last_changed,
       DATEDIFF(NOW(), password_last_changed) AS age_days,
       COALESCE(password_lifetime,
                @@global.default_password_lifetime) AS lifetime,
       password_expired
FROM mysql.user
ORDER BY age_days DESC;

-- 인증 플러그인 분포
SELECT plugin, COUNT(*) FROM mysql.user GROUP BY plugin;

-- 잠긴 계정
SELECT user, host FROM mysql.user WHERE account_locked = 'Y';
```

## 백엔드 개발자 관점 실무 포인트

- **앱 DB 계정엔 만료 정책을 직접 걸지 말 것** — 만료 시점에 커넥션 풀이 한꺼번에 인증 실패. `PASSWORD EXPIRE NEVER`로 명시적으로 락하고, 교체는 Secrets Manager 자동 로테이션 + Dual Password로 처리
- **Dual Password를 활용한 무중단 교체** — `RETAIN CURRENT PASSWORD` → 앱 배포 → `DISCARD OLD PASSWORD` 순서가 표준 패턴
- **`caching_sha2_password` 호환성** — JDBC는 `mysql-connector-j` 8.x 이상, Python은 `mysql-connector-python` / `PyMySQL` 최신, Node는 `mysql2` 사용. 구 드라이버는 즉시 인증 실패
- **TLS는 사실상 필수** — `caching_sha2_password`의 첫 인증은 TLS 또는 RSA 키 교환을 강제. RDS는 기본 TLS 제공이라 부담 없음
- **`mysql_native_password` 의존 정리** — 8.4에서 기본 비활성, 9.0에서 제거. 레거시 도구 점검 후 `caching_sha2_password`로 통일하는 마이그레이션 계획을 미리
- **HikariCP 등 풀 헬스 체크** — 만료된 계정 응답(ERROR 1820)을 풀이 어떻게 처리하는지 미리 확인. 풀 워밍 시점에 한꺼번에 실패하면 장애로 직결
- **Secrets Manager 보관** — 마스터/앱 비밀번호는 코드·환경변수에 평문 금지. Secrets Manager 핸들로만 가져오게
- **감사 자동화** — `mysql.user` 덤프 또는 `pt-show-grants`를 정기 실행해 정책 일관성 확인

## 문제 해결

| 증상 | 원인 / 해결 |
|------|-------------|
| `Authentication plugin 'caching_sha2_password' cannot be loaded` | 구 클라이언트 → 드라이버 업그레이드 또는 `IDENTIFIED WITH mysql_native_password`로 임시 변경 |
| `Public Key Retrieval is not allowed` | TLS 미사용 + RSA 키 교환 거부 → JDBC URL에 `allowPublicKeyRetrieval=true` (개발용) 또는 `useSSL=true` |
| `ERROR 1820: must reset password` | 비밀번호 만료 → `ALTER USER USER() IDENTIFIED BY ...` |
| `ERROR 1819: password does not satisfy the policy` | `validate_password` 정책 미달 → 정책 변수 확인 또는 비밀번호 변경 |
| `ER_MUST_CHANGE_PASSWORD_LOGIN` | 만료 + 디스커넥트 모드 → 디스커넥트 정책 확인, 비밀번호 재설정 |
| 풀이 한꺼번에 인증 실패 | 만료 적용 + 무중단 교체 미흡 → Dual Password 활용해 점진 교체 |
| `mysql.user` 직접 UPDATE 안 됨 | RDS 정책 → 반드시 `ALTER USER` 사용 |

## 출처

- https://dev.mysql.com/doc/refman/8.0/en/password-management.html
- https://dev.mysql.com/doc/refman/8.0/en/caching-sha2-pluggable-authentication.html
- https://dev.mysql.com/doc/refman/8.0/en/validate-password.html
- https://dev.mysql.com/doc/refman/8.0/en/password-reuse-policy.html
- https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/UsingWithRDS.IAMDBAuth.html

## 관련 문서

- [Transaction Isolation Level.md](Transaction%20Isolation%20Level.md)
- [../../AWS/RDS/RDS%20기본.md](../../AWS/RDS/RDS%20기본.md)
- [../../AWS/RDS/필수%20%20파라미터%20그룹%20설정.md](../../AWS/RDS/필수%20%20파라미터%20그룹%20설정.md)
- [../../AWS/RDS/RDS%20장애%20대응.md](../../AWS/RDS/RDS%20장애%20대응.md)
