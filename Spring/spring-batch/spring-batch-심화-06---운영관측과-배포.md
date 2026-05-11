# Spring Batch 심화 06: 운영관측과 배포

## 1. 운영 관측(Observability) 기본

- 로그: `jobExecutionId`, `stepExecutionId`, `traceId` 포함
- 메트릭: 성공/실패 건수, 소요시간, 처리량
- 알림: 연속 실패, SLA 초과, 처리량 급감

## 2. 대시보드 최소 항목

- Job 성공률(일/주)
- 평균/최대 실행시간
- Step별 병목 지점
- skip/retry/rollback 추이

## 3. 스케줄러와 배치 책임 분리

- Scheduler: 언제 실행할지
- Batch: 어떻게 처리/복구할지

적용 예:
- Kubernetes CronJob으로 트리거
- Spring Batch는 상태 기록과 재시작 전략 담당

## 4. 배포 전략 체크

- 동일 Job 중복 실행 방지(lock/uniqueness)
- 롤링 배포 시 구버전/신버전 동시 실행 안전성
- 스키마 변경 시 backward compatibility 확보

## 5. 장애 대응 런북 템플릿

1. 실패 JobExecution 식별
2. 실패 Step 원인 확인
3. 데이터 영향 범위 산정
4. 재실행/보정 실행 선택
5. 사후 회고 및 재발 방지 액션 등록

## 6. 체크리스트

- 배치 실패 알림이 담당 팀에 즉시 전달되는가
- 재실행 판단 기준이 문서화되어 있는가
- 야간 배치 SLA 위반 시 자동 에스컬레이션 되는가
