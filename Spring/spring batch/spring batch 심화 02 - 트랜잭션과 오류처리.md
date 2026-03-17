# Spring Batch 심화 02: 트랜잭션과 오류처리

## 1. 트랜잭션 경계 이해

Chunk 기반 Step에서 트랜잭션은 보통 chunk 단위다.

- `read` 100건 -> `process` -> `write` -> commit
- write 도중 예외 발생 시 해당 chunk 롤백
- 다음 chunk는 이전 chunk commit 이후에만 진행

## 2. chunk size 결정 기준

- 너무 작음: commit 오버헤드 증가
- 너무 큼: 롤백 비용/메모리 사용 증가
- 시작점 예시: 100~1000, 측정 후 조정

## 3. 오류처리 3축

- `skip`: 비정상 데이터는 건너뛰고 진행
- `retry`: 일시적 오류는 재시도
- `noRollback`: 특정 예외는 롤백 제외

핵심: 데이터 오류와 시스템 오류를 분리해야 한다.

## 4. 실무 권장 정책

- 데이터 포맷 오류: `skip`
- deadlock/lock timeout: `retry`
- 네트워크 일시 장애: `retry + backoff`
- 비즈니스 무결성 위반: 즉시 실패

## 5. 예시 코드

```java
@Bean
public Step paymentStep(JobRepository jobRepository,
                        PlatformTransactionManager tx,
                        ItemReader<PaymentRaw> reader,
                        ItemProcessor<PaymentRaw, Payment> processor,
                        ItemWriter<Payment> writer) {
    return new StepBuilder("paymentStep", jobRepository)
            .<PaymentRaw, Payment>chunk(500, tx)
            .reader(reader)
            .processor(processor)
            .writer(writer)
            .faultTolerant()
            .skip(ValidationException.class)
            .skipLimit(100)
            .retry(DeadlockLoserDataAccessException.class)
            .retryLimit(3)
            .build();
}
```

## 6. 운영에서 꼭 볼 지표

- skip count
- retry count
- rollback count
- chunk 처리 시간 p95

## 7. 체크리스트

- skip 임계치 초과 시 실패로 전환되는가
- retry 무한 루프가 발생하지 않는가
- 롤백 후 재시작 시 중복 반영이 없는가
- 예외 유형별 알림 라우팅이 분리되어 있는가
