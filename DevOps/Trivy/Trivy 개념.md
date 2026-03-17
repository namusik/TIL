# Trivy

컨테이너·클라우드 네이티브 환경을 대상으로 한 종합 보안 스캐너
단일 CLI 도구로 취약점(Vulnerability), 설정 오류(Misconfiguration), 시크릿(Secrets), 라이선스 이슈까지 사전/사후 단계 전반에서 점검할 수 있도록 설계되어 있습니다. (초기 개발사는 Aqua Security)


## 개념

- Shift Left 보안: CI 단계에서 이미지/소스/IaC를 사전 점검
- 운영 환경 가시성: 실행 중인 컨테이너·Kubernetes 리소스 점검
- 표준화된 결과: SBOM, JSON, SARIF 등으로 파이프라인 연계 용이

## 핵심 기능

### 취약점 스캔 (Vulnerability)
- 대상: 컨테이너 이미지, 파일시스템, OS 패키지, 언어별 의존성
- 범위: Alpine, Debian, Ubuntu, RHEL 계열 + Java, Node.js, Python, Go 등
- 결과: CVE, 심각도(Critical~Low), 고정 버전(Fixed Version)

### 설정 오류 스캔 (Misconfiguration)
- 대상: Kubernetes 매니페스트, Helm, Terraform, CloudFormation
- 예시: runAsNonRoot 미설정, latest 태그 사용, 과도한 권한

### 시크릿 탐지 (Secrets)
- 대상: Git 저장소, 이미지 레이어, 파일시스템
- 예시: AWS Access Key, 토큰, 비밀 문자열

### 라이선스 점검 (License)
- 오픈소스 라이선스 정책 위반 여부 식별
- 기업 컴플라이언스 파이프라인에 활용

### SBOM 생성
- CycloneDX, SPDX 포맷 지원
- 감사·규제 대응 및 공급망 보안에 유리

## 두 가지 스캔 축

### Image 스캔 (trivy image)

개념
	•	컨테이너 이미지 자체를 대상으로 스캔
	•	레지스트리(ECR, Docker Hub 등) 또는 로컬 이미지 기준

내부 동작
	1.	이미지 레이어 추출
	2.	OS 패키지 분석 (apk, apt, rpm)
	3.	언어별 패키지 분석 (Java, Node, Python 등)
	4.	취약점 DB와 매칭

커버 범위
	•	OS 취약점
	•	애플리케이션 의존성 취약점
	•	(옵션) 시크릿, 라이선스

예시
```
trivy image myapp:1.0.0
```

실무 사용 시점
	•	Docker build 이후
	•	배포 직전 이미지 검증
	•	레지스트리 업로드 전 보안 게이트



### FS 스캔 (trivy fs)

개념
	•	파일시스템(디렉터리) 기준 스캔
	•	컨테이너가 아닌 소스 코드/리포지토리 대상

내부 동작
	•	OS 패키지 없음
	•	프로젝트 구조 분석
	•	언어별 manifest 탐지
(pom.xml, build.gradle, package.json, requirements.txt 등)

커버 범위
	•	애플리케이션 라이브러리 취약점
	•	시크릿 노출
	•	(옵션) 라이선스

예시

```
trivy fs .
```

실무 사용 시점
	•	코드 커밋 전
	•	PR 단계
	•	Dockerfile 작성 이전

  