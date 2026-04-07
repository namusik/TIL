# AuroraEstimatedSharedMemoryBytes

> 최종 업데이트: 2026-04-04

## 개념

Aurora MySQL 인스턴스에서 **공유 메모리(Shared Memory) 영역의 추정 사용량**을 바이트 단위로 나타내는 CloudWatch 지표.

- 식당에 비유하면: 주방(인스턴스)에서 여러 요리사(커넥션/스레드)가 **함께 사용하는 공용 조리대 공간**이 얼마나 차 있는지를 보여주는 것. 조리대가 꽉 차면 요리 속도가 느려지듯, 공유 메모리가 부족하면 DB 성능이 떨어진다.
- "Estimated(추정)"인 이유는 Aurora 내부 휴리스틱으로 산출한 **근사치**이기 때문

## 공유 메모리란

Aurora MySQL 인스턴스 내에서 **모든 커넥션/스레드가 공동으로 사용하는 메모리 영역**을 말한다.

대표적으로 포함되는 것들:

| 영역 | 역할 |
|------|------|
| **InnoDB Buffer Pool** | 테이블·인덱스 데이터를 캐싱하여 디스크 I/O를 줄임 |
| **Query Cache** | 동일 쿼리 결과를 캐싱 (MySQL 5.7 한정) |
| **Table Open Cache** | 열린 테이블 핸들을 캐싱 |
| **Adaptive Hash Index** | 자주 접근하는 인덱스 페이지를 해시로 캐싱 |
| **Log Buffer** | redo log 기록 전 임시 저장 |

반대로, 커넥션마다 독립적으로 할당되는 메모리(sort_buffer, join_buffer 등)는 **세션 메모리**라고 하며 이 지표에 포함되지 않는다.

## 왜 모니터링해야 하는가

1. **메모리 압박 감지**: 이 값이 인스턴스 총 메모리 대비 지나치게 높으면, `FreeableMemory`가 줄어들고 OOM(Out of Memory) 위험이 커진다.
2. **Buffer Pool 효율 판단**: 공유 메모리 대부분은 Buffer Pool이 차지한다. 이 지표가 높은데 `BufferCacheHitRatio`가 낮다면, Buffer Pool 크기 대비 워킹셋이 너무 큰 것.
3. **인스턴스 사이징 근거**: 스케일업/다운 결정 시 이 지표를 참고하여 적절한 인스턴스 클래스를 선택할 수 있다.

## 함께 봐야 할 지표

| 지표 | 설명 | 조합 해석 |
|------|------|-----------|
| `FreeableMemory` | 사용 가능한 남은 RAM | SharedMemory↑ + Freeable↓ = 메모리 부족 징후 |
| `BufferCacheHitRatio` | Buffer Pool 캐시 적중률 | SharedMemory↑ + HitRatio↓ = 워킹셋 > Buffer Pool |
| `DatabaseConnections` | 활성 커넥션 수 | 커넥션 증가 → 세션 메모리 증가 → Freeable 감소 |
| `SwapUsage` | 스왑 사용량 | 0이 아니면 물리 메모리 부족 확정 |

## 확인 방법

### CloudWatch 콘솔

1. CloudWatch → Metrics → RDS → Per-Database Metrics
2. `AuroraEstimatedSharedMemoryBytes` 검색
3. 대상 인스턴스 선택 후 그래프 확인

### AWS CLI

```bash
aws cloudwatch get-metric-statistics \
  --namespace AWS/RDS \
  --metric-name AuroraEstimatedSharedMemoryBytes \
  --dimensions Name=DBInstanceIdentifier,Value=<인스턴스명> \
  --start-time 2026-04-03T00:00:00Z \
  --end-time 2026-04-04T00:00:00Z \
  --period 300 \
  --statistics Average
```

## 대응 가이드

| 상황 | 조치 |
|------|------|
| SharedMemory 지속 증가 + FreeableMemory 감소 | 인스턴스 클래스 스케일업 검토 |
| SharedMemory 높음 + BufferCacheHitRatio 낮음 | `innodb_buffer_pool_size` 파라미터 조정 또는 스케일업 |
| SharedMemory 안정 + FreeableMemory 감소 | 세션 메모리 과다 사용 의심 → 커넥션 수, sort/join buffer 크기 점검 |
| SwapUsage > 0 | 즉시 스케일업 필요 (스왑 발생 시 성능 급격히 저하) |
