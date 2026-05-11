# Sonarqube

## 개념
- **소스 코드의 정적 분석(Static Code Analysis)** 을 통해 코드 품질과 보안을 체계적으로 관리하기 위한 코드 품질 관리 플랫폼
  - SAST (Static Application Security Testing)
    - 코드를 실제로 돌려보기 전에, 설계도(소스 코드)만 보고 위험한 부분을 미리 체크하는 것
- 비유: 국어 시험에서 맞춤법 검사기 돌리는 것

## 주요 분석 항목

SonarQube는 코드 분석 결과를 다음과 같은 범주로 분류

### Bugs
- 실제 런타임 오류로 이어질 가능성이 높은 코드 문제
- 예: NullPointerException 가능성, 잘못된 조건문

### Vulnerabilities
- 보안 공격에 악용될 수 있는 취약점
- 예: 하드코딩된 패스워드, 안전하지 않은 암호화 방식

### Code Smells
- 즉각적인 오류는 아니지만 유지보수를 어렵게 만드는 구조적 문제
- 예: 과도하게 긴 메서드, 중복 코드

### Coverage
- 단위 테스트 커버리지 비율
- 테스트되지 않은 코드 영역을 명확히 식별

### Duplications
- 코드 중복률 분석
- 리팩토링 대상 영역 도출


## Quality Gate (품질 게이트)

Quality Gate는 배포 가능 여부를 판단하는 기준선

일반적인 기준 예:
	•	신규 코드의 Bug = 0
	•	신규 코드의 Vulnerability = 0
	•	신규 코드 Coverage ≥ 80%
	•	신규 코드 Code Smell 허용 범위 이내

- CI 파이프라인(Jenkins, GitHub Actions 등)과 연계 시, 게이트 실패 시 빌드 실패 처리가 가능

## CI/CD 및 개발 프로세스 연계

1.	개발자가 코드 커밋
2.	CI 파이프라인에서 빌드 수행
3.	SonarScanner 실행
4.	SonarQube 서버에서 분석 결과 저장
5.	Quality Gate 평가
6.	결과에 따라 배포 진행 또는 차단