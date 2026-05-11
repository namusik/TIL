# Spring Batch 심화 03: 메타테이블과 조회포인트

## 1. 왜 중요한가

`JobRepository` 메타테이블은 장애 분석, 재실행 판단, 처리량 분석의 기준 데이터다.

## 2. 핵심 테이블

- `BATCH_JOB_INSTANCE`: Job + 파라미터 조합
- `BATCH_JOB_EXECUTION`: 실행 이력(시작/종료/상태)
- `BATCH_JOB_EXECUTION_PARAMS`: 실행 파라미터 저장
- `BATCH_STEP_EXECUTION`: Step별 건수/상태
- `BATCH_JOB_EXECUTION_CONTEXT`, `BATCH_STEP_EXECUTION_CONTEXT`: 재시작 상태

## 3. 자주 보는 컬럼

- `STATUS`, `EXIT_CODE`, `EXIT_MESSAGE`
- `START_TIME`, `END_TIME`, `LAST_UPDATED`
- `READ_COUNT`, `WRITE_COUNT`, `FILTER_COUNT`
- `READ_SKIP_COUNT`, `PROCESS_SKIP_COUNT`, `WRITE_SKIP_COUNT`, `ROLLBACK_COUNT`

## 4. 운영 조회 SQL 예시

실패 실행 목록:
```sql
SELECT JOB_EXECUTION_ID, START_TIME, END_TIME, STATUS, EXIT_CODE
FROM BATCH_JOB_EXECUTION
WHERE STATUS = 'FAILED'
ORDER BY START_TIME DESC;
```

Step 처리량 상위:
```sql
SELECT STEP_NAME, SUM(READ_COUNT) AS total_read, SUM(WRITE_COUNT) AS total_write
FROM BATCH_STEP_EXECUTION
GROUP BY STEP_NAME
ORDER BY total_write DESC;
```

지연 실행 탐지(예: 30분 초과):
```sql
SELECT JOB_EXECUTION_ID,
       TIMESTAMPDIFF(MINUTE, START_TIME, END_TIME) AS duration_min,
       STATUS
FROM BATCH_JOB_EXECUTION
WHERE END_TIME IS NOT NULL
  AND TIMESTAMPDIFF(MINUTE, START_TIME, END_TIME) > 30;
```

## 5. 장애 분석 루틴

1. `BATCH_JOB_EXECUTION`에서 실패 건 식별
2. 동일 `JOB_EXECUTION_ID`의 `BATCH_STEP_EXECUTION` 확인
3. `EXIT_MESSAGE`와 애플리케이션 로그 상호 검증
4. `ExecutionContext` 복구 가능 여부 판단 후 재실행

## 6. 체크리스트

- 메타테이블 인덱스가 충분한가
- 운영 대시보드가 `FAILED`, `STARTED`를 실시간 감지하는가
- `EXIT_MESSAGE`가 지나치게 truncate 되지 않는가
