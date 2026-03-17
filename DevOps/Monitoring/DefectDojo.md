# DefectDojo

다양한 보안 스캐닝 도구에서 생성된 결과를 중앙에서 수집·정규화·추적하기 위한 취약점 관리(Vulnerability Management) 플랫폼

## 개념
- 보안 스캔 결과 통합 관리: SAST, DAST, SCA, Infra Scan 결과 집계
- 취약점 라이프사이클 관리: 발견 → 검증 → 조치 → 재검증 → 종료
- 조직 단위 보안 가시성 확보: 제품/서비스/환경별 보안 상태 파악
- DevSecOps 정착: CI/CD 파이프라인과 연계한 보안 프로세스 자동화

## 주요 개념 정리

DefectDojo는 다음과 같은 관리 단위를 중심으로 동작합니다.

2.1 Product
	•	논리적 서비스 또는 시스템 단위
	•	예: mbp-api, payment-service, admin-web

2.2 Engagement
	•	특정 기간 또는 목적의 보안 활동
	•	예: “2026 Q1 정기 취약점 점검”, “릴리즈 전 보안 스캔”

2.3 Test
	•	실제 수행된 스캔/점검 단위
	•	예: SonarQube Scan, Trivy Scan, ZAP Scan

2.4 Finding
	•	개별 취약점 항목
	•	심각도(Critical/High/Medium/Low), 상태(Open, Mitigated, False Positive 등) 관리

⸻

## 연동 가능한 대표 도구

DefectDojo는 보안 도구 허브 역할을 수행합니다.
	•	SAST: SonarQube, Semgrep
	•	DAST: OWASP ZAP, Burp
	•	SCA: Dependency-Check, Snyk
	•	Container/Image: Trivy, Clair
	•	Infra/Cloud: Nessus, OpenVAS

→ 각 도구의 결과를 공통 포맷으로 변환 후 저장합니다.

⸻

## CI/CD에서의 활용 방식

일반적인 파이프라인 예시는 다음과 같습니다.
	1.	코드 커밋
	2.	CI에서 빌드 및 테스트 수행
	3.	보안 스캔 실행 (SonarQube, Trivy 등)
	4.	스캔 결과를 DefectDojo API로 업로드
	5.	DefectDojo에서 취약점 통합 관리
	6.	정책에 따라 배포 승인/차단 판단

중요 포인트:
	•	스캔은 CI가 수행
	•	취약점 관리와 추적은 DefectDojo가 담당
