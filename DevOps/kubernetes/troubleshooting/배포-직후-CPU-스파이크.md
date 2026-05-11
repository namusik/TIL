# 배포 직후 CPU 스파이크

## 원인
- ‘배포 직후 짧은 CPU 급등 → 안정화’ 패턴은 Java 기반 서비스에서 매우 흔한 현상
- JVM 부트스트랩
  - SpringBoot 애플리케이션은 클래스 로딩, Bean 초기화, JIT 컴파일 과정에서 짧게 CPU를 많이 사용함
- 에이전트/라이브러리 초기화
  - rollout.yml에 Java Agent(OpenTelemetry)는 Agent 스캐닝과 byte-code instrumentation도 부트 타임 CPU를 높임.

## 해결방법
- resources.limits.cpu 수치를 높이자