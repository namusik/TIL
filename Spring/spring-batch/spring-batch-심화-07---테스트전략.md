# Spring Batch 심화 07: 테스트전략

## 1. 왜 배치 테스트가 어려운가

배치는 성공 경로보다 실패/재시작 경로에서 결함이 자주 발생한다.
따라서 단순 정상 케이스 테스트만으로는 운영 안정성이 확보되지 않는다.

## 2. 테스트 계층

- 단위 테스트: Processor, Validator, Mapper
- Step 테스트: reader-processor-writer 연결
- Job 테스트: 흐름 분기, 종료 상태
- 통합 테스트: 실제 DB/외부 연동 포함
- 장애 테스트: 실패 후 재시작, 중복 방지

## 3. spring-batch-test 활용

```java
@SpringBatchTest
@SpringBootTest
class BillingJobTest {

    @Autowired
    private JobLauncherTestUtils jobLauncherTestUtils;

    @Test
    void jobCompletes() throws Exception {
        JobParameters params = new JobParametersBuilder()
                .addString("targetDate", "2026-02-24")
                .toJobParameters();

        JobExecution execution = jobLauncherTestUtils.launchJob(params);
        assertThat(execution.getStatus()).isEqualTo(BatchStatus.COMPLETED);
    }
}
```

## 4. 필수 시나리오

- 동일 파라미터 중복 실행
- 중간 실패 후 재실행
- skip/retry limit 초과
- 외부 API 타임아웃
- 대량 데이터 성능 회귀

## 5. 테스트 데이터 전략

- 소량 샘플 + 경계값 데이터 + 오염 데이터 분리
- 재현 가능한 fixture 고정
- 운영 장애 케이스를 회귀 테스트에 편입

## 6. 배포 게이트 기준

- 필수 Job 회귀 테스트 통과
- 재시작 시나리오 테스트 통과
- 처리량 기준치 이하로 하락 시 배포 차단
