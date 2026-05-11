# Spring Batch 심화 05: 성능튜닝

## 1. 성능 튜닝 순서

1. 병목 구간 계측
2. SQL/인덱스 개선
3. Reader/Writer 설정 최적화
4. chunk/스레드 조정
5. 재측정 및 회귀 방지

## 2. Reader 튜닝

- JDBC cursor/paging reader에서 fetch size 조정
- 정렬/범위 조건에 맞는 인덱스 설계
- 불필요한 컬럼 조회 제거

## 3. Writer 튜닝

- JDBC batch insert/update 사용
- flush 주기 조정
- upsert 정책에서 충돌 키 인덱스 최적화

## 4. chunk size와 메모리

- 큰 chunk: TPS 상승 가능, 메모리/롤백 비용 증가
- 작은 chunk: 안정성 높음, commit 비용 증가
- 보통 100~1000에서 시작해 p95 시간 기준 조정

## 5. 측정 지표

- rows/sec
- chunk 처리 시간 p50/p95
- DB CPU/IO, lock wait time
- GC pause time
- 실패율/재시도율

## 6. 실무 튜닝 사례 패턴

- `rows/sec` 낮고 DB CPU 높음: SQL/인덱스 우선
- DB 여유, 앱 CPU 높음: processor 비용 최적화
- lock wait 증가: batch size 줄이거나 분할 실행

## 7. 체크리스트

- 튜닝 전후 동일 데이터셋 비교를 했는가
- 기준 지표와 목표값(SLO)이 문서화됐는가
- 릴리즈 후 회귀 감시 알림이 있는가
