# Spring Batch 심화 01: 실행모델과 재시작

## 1. 실행 모델을 정확히 구분하기

- `Job`: 배치 정의 자체
- `JobParameters`: 실행 입력값(불변)
- `JobInstance`: `Job + JobParameters` 조합
- `JobExecution`: 특정 `JobInstance`의 실행 1회 기록
- `StepExecution`: Step 실행 1회 기록
- `ExecutionContext`: 재시작을 위한 상태 저장소

핵심: **재시작은 JobExecution이 아니라 JobInstance 기준으로 이어진다.**

## 2. 라이프사이클 흐름

```mermaid
flowchart TD
    A[JobLauncher.run(job, params)] --> B{같은 Job + Params JobInstance 존재?}
    B -- 아니오 --> C[새 JobInstance 생성]
    B -- 예 --> D[기존 JobInstance 사용]
    C --> E[JobExecution 생성]
    D --> E
    E --> F[StepExecution 생성/실행]
    F --> G{실패?}
    G -- 아니오 --> H[COMPLETED]
    G -- 예 --> I[FAILED]
    I --> J[ExecutionContext 저장]
    J --> K[같은 params로 재실행 시 실패 지점부터 복구]
```

## 3. 재시작 가능 설계의 핵심

- Reader가 처리 위치를 `ExecutionContext`에 저장해야 함
- Writer는 멱등하게 설계해야 함
- 외부 API 호출 결과는 중복 반영 방지 키를 사용해야 함
- 실패 시 재실행 파라미터 정책을 사전에 정해야 함

## 4. JobParameters 설계 원칙

- 비즈니스 식별 파라미터: `targetDate`, `tenantId`, `region`
- 기술 파라미터: `requestedBy`, `traceId`
- 무작정 `run.id`를 추가하면 재시작이 아니라 신규 실행이 됨

권장 규칙:
- 재시작 의도: 동일 파라미터 유지
- 신규 처리 의도: 비즈니스 파라미터를 변경

## 5. 흔한 장애 시나리오와 처리

- DB deadlock: retry 정책으로 재시도, 한도 초과 시 실패
- 데이터 무결성 오류: skip 또는 격리 테이블로 이동
- 외부 API 타임아웃: circuit breaker + retry + timeout

## 6. 실무 체크리스트

- 같은 파라미터 재실행 시 재시작으로 동작하는가
- Step 중간 실패 후 Reader 위치 복구가 되는가
- Writer가 중복 반영 없이 재수행 가능한가
- 장애 원인 로그에 `jobInstanceId`, `jobExecutionId`, `stepExecutionId`가 남는가

## 7. 최소 코드 예시

```java
@Bean
public Job importJob(JobRepository jobRepository, Step importStep) {
    return new JobBuilder("importJob", jobRepository)
            .start(importStep)
            .build();
}
```
