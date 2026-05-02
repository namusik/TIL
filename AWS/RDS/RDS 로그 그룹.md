# RDS 로그 설정 및 CloudWatch 내보내기

> 최종 업데이트: 2026-04-20 | 기준: Aurora MySQL 3.x (MySQL 8.0 호환)

## 개념

Aurora/RDS의 로그를 운영에서 활용하려면 **두 단계**를 모두 설정해야 한다.

1. **DB 엔진 레벨** — 파라미터 그룹/옵션 그룹에서 "로그를 생성하게" 만든다
2. **RDS 리소스 레벨** — 인스턴스/클러스터 설정의 "로그 내보내기"에서 **CloudWatch Logs로 내보내기**를 켠다

> 비유하자면 ① 집에서 일기를 쓰게 만들고(DB 엔진 설정), ② 그 일기를 도서관에 기증하게(CloudWatch Logs 내보내기) 하는 2단계. 하나만 켜면 로그는 있으되 어디서도 볼 수 없다.

## 전체 흐름

```
[파라미터 그룹]           [옵션 그룹]               [RDS 클러스터/인스턴스]
 slow_query_log=1         MARIADB_AUDIT_PLUGIN      로그 내보내기 체크박스
 server_audit_logging=ON  (감사 로그용)              ┌────────┐
 general_log=1            ───────────────────────►  │ Audit  │ ─► CloudWatch Logs
 ...                                                │ Error  │ ─►   /aws/rds/cluster/xxx/audit
                                                    │ General│
                                                    │ Slow   │
                                                    └────────┘
```

## RDS 로그 내보내기 설정 화면

![rdsLog](../../images/AWS/rdsLog.png)

## 로그 종류별 설정

### 1. 감사 로그 (Audit Log) for Aurora MySQL

누가 언제 어떤 쿼리를 실행했는지 추적. 규제/보안 대응 필수.

**옵션 그룹 설정**
- Aurora MySQL 클러스터의 옵션 그룹에 **`MARIADB_AUDIT_PLUGIN`** 추가·활성화. 이 플러그인이 감사 기능을 제공

**DB 클러스터 파라미터 그룹**

| 파라미터 | 값 | 설명 |
|---------|----|----|
| `server_audit_logging` | `ON` | 감사 로깅 시작 (**기본 OFF**) |
| `server_audit_events` | 이벤트 목록 | 기록할 이벤트 유형을 **쉼표로 구분**해 지정. 단순 `1`이 아닌 명시적 목록 |
| `server_audit_output_type` | `FILE` | CloudWatch로 내보내려면 파일로 기록되어야 함. 보통 RDS가 `FILE`로 관리 |

**`server_audit_events` 가능 값**

| 값 | 내용 |
|----|------|
| `CONNECT` | 접속·접속 해제·실패한 로그인 시도 |
| `QUERY` | 모든 쿼리 (로그 폭주 주의) |
| `QUERY_DCL` | `GRANT`, `REVOKE` 등 DCL |
| `QUERY_DDL` | `CREATE`, `ALTER`, `DROP` 등 DDL |
| `QUERY_DML` | `SELECT`, `INSERT`, `UPDATE`, `DELETE` 등 DML |
| `TABLE` | 특정 테이블에 대한 DML/DDL |

```
# 권장 조합 예
server_audit_events = CONNECT,QUERY_DDL,QUERY_DCL
```
- `QUERY_DML`까지 켜면 로그 폭주/비용 증가 — 필요할 때만

### 2. 에러 로그 (Error Log) for Aurora MySQL

- 기본적으로 활성화되어 파일로 기록됨 — **별도의 ON/1 파라미터 없음**
- 클러스터 파라미터 그룹에서 생성을 강제할 필요 없음

| 파라미터 | 기본값 | 설명 |
|---------|--------|------|
| `log_error_verbosity` | `3` | 1=Error, 2=Warning, 3=Note. 상세 수준 조절 |

> Aurora MySQL 2.07/MySQL 5.7 호환 이상, 또는 Aurora MySQL 3.x/MySQL 8.0 호환에서 사용 가능.

### 3. 일반 로그 (General Log) for Aurora MySQL

모든 실행된 SQL을 기록. **성능 저하·스토리지 비용 증가** 주의 — 디버깅 시에만 임시 ON 권장.

| 파라미터 | 값 | 설명 |
|---------|----|----|
| `general_log` | `1` / `ON` | **기본 OFF** |
| `log_output` | `FILE` 또는 `TABLE,FILE` | RDS는 `FILE`로 기록된 로그만 CloudWatch로 내보냄 |

### 4. 느린 쿼리 로그 (Slow Query Log)

성능 튜닝의 기본. 운영에서는 항상 켜둘 것.

| 파라미터 | 기본값 | 권장값 | 설명 |
|---------|-------|--------|------|
| `slow_query_log` | OFF | `1` | 느린 쿼리 로그 활성화 |
| `long_query_time` | `10.0` | `1.0` | "느린" 기준 시간(초). 10초는 너무 관대 |
| `log_output` | `FILE` | `FILE` 또는 `TABLE,FILE` | CloudWatch 내보내기에는 FILE 필요 |
| `log_queries_not_using_indexes` | OFF | `1` | 인덱스 안 타는 쿼리도 기록 (`long_query_time` 미만이어도) |
| `min_examined_row_limit` | `0` | `0` | 특정 행 수 이상 검사한 쿼리만 로깅하려면 조정 |

**환경별 `long_query_time` 기준**

| 환경 | 기준 시간 | 예시 |
|------|----------|------|
| 실시간 시스템 | 0.5~1초 | 주식 거래, 게임 서버, 금융 플랫폼 |
| 일반 웹 애플리케이션 | 1~3초 | 커머스, 블로그, 기업 앱 |
| 데이터 분석/OLAP | 5초 이상 | DW, ETL, 배치 |

### 5. iam-db-auth-error 로그

RDS **IAM 데이터베이스 인증** 사용 시 인증 오류를 기록.

- **선행 조건**: Aurora 클러스터/인스턴스에 IAM DB 인증 활성화
- 사용자가 파라미터 그룹에서 별도 ON 설정을 하지는 않음 — IAM 인증이 켜져 있고 실패가 발생하면 자동 생성
- CloudWatch로 내보내기는 클러스터 "로그 내보내기" 체크박스로 제어

### 6. Instance 로그

Aurora 스토리지 또는 특정 인스턴스 관련 이벤트 로그.

- Aurora 플랫폼이 관리 — 파라미터 그룹에서 생성 여부를 직접 제어하는 파라미터 없음
- CloudWatch 내보내기는 클러스터 "로그 내보내기" 체크박스로 제어

## CloudWatch Logs로 내보내기 (2단계 요약)

RDS의 로그를 CloudWatch Logs로 전송하려면 아래 두 단계가 **모두** 필요.

### (1) DB 엔진 레벨에서 로그 생성 활성화 (파라미터/옵션 그룹)

- **감사 로그**
  - 옵션 그룹에 `MARIADB_AUDIT_PLUGIN` 추가·활성화
  - 파라미터 그룹에서 `server_audit_logging = ON`
  - `server_audit_events`에 원하는 이벤트 유형 지정 (예: `CONNECT,QUERY_DML`)
  - 필요 시 `server_audit_output_type = FILE`
- **에러 로그** — 기본 활성화
- **일반 로그 / 느린 쿼리 로그**
  - `general_log = 1` / `slow_query_log = 1`
  - `log_output = FILE` 확인

### (2) RDS 리소스 설정에서 "로그 내보내기" 활성화

DB 인스턴스 또는 클러스터 수정 페이지 → **로그 내보내기(Log exports)** 섹션에서 보낼 로그 유형의 체크박스 선택.

- 감사 로그 / 오류 로그 / 일반 로그 / 느린 쿼리 로그
- iam-db-auth-error 로그 / Instance 로그 / 데이터베이스 로그

> 변경 적용 시점: "즉시 적용" 또는 "다음 유지 관리 기간". **인스턴스 재시작이 필요한 경우도 있음**.

### CLI로 내보내기 활성화

```sh
aws rds modify-db-cluster \
  --db-cluster-identifier my-cluster \
  --cloudwatch-logs-export-configuration \
      'EnableLogTypes=["audit","error","general","slowquery"]' \
  --apply-immediately
```

## CloudWatch Logs 구조

Aurora 클러스터의 로그는 기본적으로 다음 Log Group에 저장됨.

```
/aws/rds/cluster/<cluster-name>/audit
/aws/rds/cluster/<cluster-name>/error
/aws/rds/cluster/<cluster-name>/general
/aws/rds/cluster/<cluster-name>/slowquery
```

- 보존 기간(retention)은 기본 "무기한" — **명시적으로 설정**하지 않으면 비용이 계속 증가
- CloudWatch Logs Insights로 쿼리하거나, Subscription Filter로 S3/Kinesis/Lambda에 포워딩 가능

## 운영 체크리스트

- [ ] 감사 플러그인 (MARIADB_AUDIT_PLUGIN) 활성화
- [ ] `server_audit_logging = ON`, `server_audit_events` 최소 `CONNECT,QUERY_DDL,QUERY_DCL`
- [ ] `slow_query_log = 1`, `long_query_time = 1`
- [ ] `general_log`는 평상시 OFF (필요 시 임시 ON)
- [ ] 로그 내보내기 체크박스: audit / error / slowquery (최소)
- [ ] CloudWatch Log Group 보존 기간 설정 (예: 30일)
- [ ] Subscription Filter로 장기 보관(S3) 파이프라인 구성

## 관련 문서

- [RDS 기본.md](RDS%20기본.md)
- [필수 파라미터 그룹 설정.md](필수%20%20파라미터%20그룹%20설정.md)
- [RDS 장애 대응.md](RDS%20장애%20대응.md)
