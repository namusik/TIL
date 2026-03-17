# Spring Batch 심화 08: Chunk 처리원리

## 1. 핵심 요약
Spring Batch의 Chunk 모델은 단순히 Reader -> Writer가 아니라,
`Reader -> Processor(선택) -> Writer` 구조로 동작한다.

핵심 목적은 다음 3가지다.
- 관심사 분리: 개발자는 1건 처리 로직에 집중
- 장애 복구 용이성: skip/retry/rollback 제어
- 트랜잭션 단위 최적화: commit interval 기반 처리량 확보

## 2. 왜 1건씩 읽고 처리하는가

### 2-1. 프레임워크 역할 분담
- `ItemReader.read()`는 1건(`T`)을 반환
- 프레임워크가 읽은 아이템을 모아 chunk 버퍼를 구성
- chunk가 가득 차면 `ItemWriter.write(Chunk<? extends T>)` 호출

즉, 개발자는 반복문/버퍼링/배치 경계 제어를 직접 작성하지 않고,
각 컴포넌트의 본질적인 책임(읽기/가공/쓰기)에 집중할 수 있다.

### 2-2. Reader가 List를 한 번에 반환하면 생기는 문제
Spring Batch 표준 인터페이스(`ItemReader<T>`)는 List 반환이 아니라 단건 반환 계약이다.
만약 뭉텅이 처리로 가면 다음이 복잡해진다.
- Processor에서 리스트 순회/부분 실패 처리 로직을 직접 구현
- 어떤 아이템에서 실패했는지 추적이 어려움
- 세밀한 skip/retry 적용이 어려워짐

## 3. commit interval과 트랜잭션

`chunk(1000, transactionManager)`는
"1000건을 한 트랜잭션으로 묶어 커밋"한다는 뜻이다.

동작:
1. read/process를 반복하며 아이템 누적
2. 1000건 도달 시 write 호출
3. write 성공 시 commit
4. 다음 chunk 반복
5. 마지막 남은 건수(예: 237건)도 write 후 commit

## 4. 에러 처리와 재시도(Fault Tolerance)

대용량 배치에서는 데이터 오류/일시 장애가 흔하다.
Chunk 모델은 아이템 단위 제어가 가능해서 복구 전략을 세밀하게 적용할 수 있다.

예:
- 특정 데이터 예외는 skip
- 데드락/일시 네트워크 오류는 retry
- 임계치 초과 시 Step 실패

핵심 포인트:
- 예외가 발생하면 현재 chunk 트랜잭션이 롤백
- 설정에 따라 해당 아이템만 건너뛰고 나머지 진행 가능
- JobRepository/ExecutionContext 기반 재시작 지원

## 5. 스트리밍 처리에 유리한 이유

Spring Batch는 DB뿐 아니라 파일/큐 등 다양한 소스를 지원한다.
특히 큰 파일(GB 단위)은 한 번에 메모리 적재보다
스트림으로 1건씩 읽는 방식이 안정적이다.

`ItemReader<T>`의 단건 반환 계약은
데이터 소스가 달라도 일관된 처리 모델을 유지하게 해준다.

## 6. 성능 관점에서의 오해 정리

- 오해: 1건씩 처리하면 무조건 느리다
- 실제: 배치 성능은 대체로 DB I/O, 네트워크, SQL, 락 경합이 더 큰 병목이다
- 프레임워크의 아이템 단위 orchestration 오버헤드는 보통 지배적 병목이 아니다

즉, 1건 처리 계약 + chunk 커밋은
안정성과 성능의 균형을 맞추기 위한 설계다.

## 7. 실무 예시 코드

```java
@Bean
Step reservationMessageSendStep(JobRepository jobRepository,
                                PlatformTransactionManager tx,
                                ReservationMessageReader reader,
                                ReservationMessageProcessor processor,
                                ReservationMessageWriter writer,
                                StepListener stepListener) {

    return new StepBuilder("reservationMessageSendStep", jobRepository)
            .<Message, Message>chunk(1000, tx)
            .reader(reader)
            .processor(processor) // 필요 없으면 생략 가능
            .writer(writer)
            .listener(stepListener)
            .faultTolerant()
            .skip(IllegalArgumentException.class)
            .skipLimit(100)
            .retry(DeadlockLoserDataAccessException.class)
            .retryLimit(3)
            .build();
}
```

문법 설명:
- `.chunk(1000, tx)`: 1000건 commit interval
- `.faultTolerant()`: skip/retry 정책 활성화
- `.skip(...)/.skipLimit(...)`: 건너뛸 예외와 허용 건수
- `.retry(...)/.retryLimit(...)`: 재시도 예외와 횟수

## 8. 결론

Reader가 내부적으로 페이지/캐시를 사용하더라도,
외부 계약은 "1건씩 반환"을 유지하는 것이 Spring Batch의 핵심 설계다.
이 구조 덕분에 복잡한 반복/버퍼링/장애 복구를 프레임워크가 담당하고,
개발자는 비즈니스 처리 로직에 집중할 수 있다.
