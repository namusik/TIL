# AWS Lambda

> 최종 업데이트: 2026-04-17 | 기준 정보: AWS Lambda (2026년 4월)

## 개념

AWS Lambda는 **서버를 직접 띄우거나 관리하지 않고도 코드를 실행할 수 있는 서버리스(Serverless) 컴퓨팅 서비스**다. 쉽게 말해 "함수 하나만 등록하면, 필요할 때 AWS가 알아서 실행해주는 자판기" 같은 개념이다.

- 요청이 들어올 때마다 AWS가 컨테이너를 띄워 코드를 실행하고, 끝나면 자동으로 내린다
- **실행된 시간과 횟수만큼만 비용**을 지불 (호출이 없으면 비용 0원)
- 서버 프로비저닝, OS 패치, 스케일링 같은 운영 이슈를 AWS가 전담

## 배경/역사

- **2014년 AWS re:Invent에서 발표** — 업계 최초의 상용 FaaS(Function as a Service)
- 이후 Google Cloud Functions, Azure Functions 등 경쟁 서비스 등장 → "서버리스"라는 패러다임을 대중화시킨 원조 서비스
- 2020년부터 **컨테이너 이미지(최대 10GB) 배포** 지원, ARM 기반 **Graviton2 런타임** 추가로 비용 절감 옵션 확대
- 2023~2025년에는 **SnapStart**(Java/Python/.NET Cold Start 단축), **응답 스트리밍** 등이 추가되어 웹 API 용도로도 실용성이 크게 향상

## 핵심 구성 요소

| 구성 요소 | 설명 | 비유 |
|----------|------|------|
| **Function** | 실행할 코드 단위 | 자판기의 버튼 하나 |
| **Trigger (Event Source)** | 함수를 호출하는 이벤트 원천 | 버튼을 누르는 손 |
| **Runtime** | 코드를 실행하는 언어 환경 | 자판기 내부 기계 |
| **Handler** | 이벤트를 받아 처리하는 진입 함수 | 버튼을 눌렀을 때 실행되는 동작 |
| **Layer** | 여러 함수가 공유하는 라이브러리/파일 묶음 | 공용 부품 상자 |

## 지원 런타임 (2026년 기준)

- **Node.js**: 20.x, 22.x
- **Python**: 3.11, 3.12, 3.13
- **Java**: 17, 21 (Corretto)
- **.NET**: 8
- **Go**: `provided.al2023` 기반 커스텀 런타임
- **Ruby**: 3.3
- **커스텀 런타임**: `provided.al2023` — Rust, C++ 등 자유롭게 구성 가능

## 주요 트리거 (Event Source)

- **API Gateway** — HTTP 요청으로 Lambda 실행 (가장 흔한 웹 API 구성)
- **S3** — 파일 업로드/삭제 이벤트
- **DynamoDB Streams** — 테이블 변경 이벤트
- **SQS / SNS** — 메시지 큐/알림 이벤트
- **EventBridge** — 스케줄(cron) 또는 커스텀 이벤트
- **CloudWatch Logs** — 로그 필터 매칭 시 실행
- **Kinesis** — 실시간 스트리밍 데이터

## Handler 코드 예시

### Node.js
```javascript
exports.handler = async (event) => {
    return {
        statusCode: 200,
        body: JSON.stringify({ message: "Hello Lambda" })
    };
};
```

### Python
```python
def lambda_handler(event, context):
    return {
        "statusCode": 200,
        "body": "Hello Lambda"
    }
```

### Java
```java
public class Handler implements RequestHandler<Map<String, Object>, String> {
    public String handleRequest(Map<String, Object> event, Context context) {
        return "Hello Lambda";
    }
}
```

## 실행 모델: Cold Start vs Warm Start

- **Cold Start**: 오랫동안 호출되지 않아 컨테이너를 새로 띄워야 할 때 → 수백 ms ~ 수 초 지연
- **Warm Start**: 직전 실행에서 남아있던 컨테이너 재사용 → 빠른 응답
- 완화 방법:
  - **Provisioned Concurrency** — 미리 웜 인스턴스 확보 (비용 발생)
  - **SnapStart** — Java/Python/.NET에서 초기화 상태 스냅샷으로 Cold Start 최소화
  - 함수 크기 축소, 외부 의존성 최소화

## 주요 제한 (2026년 기준)

| 항목 | 제한 |
|------|------|
| 최대 실행 시간 | 15분 (900초) |
| 메모리 | 128MB ~ 10,240MB (10GB) |
| 임시 저장소(`/tmp`) | 512MB ~ 10,240MB |
| 배포 패키지 (ZIP, 압축) | 50MB |
| 배포 패키지 (ZIP, 압축 해제) | 250MB |
| 배포 패키지 (컨테이너 이미지) | 10GB |
| 동시 실행 (기본) | 리전당 1,000 (증설 요청 가능) |
| 환경변수 총 크기 | 4KB |

## 요금 체계

- **요청 횟수 + 실행 시간(GB-second)** 기준 과금
- 월 **100만 요청 + 400,000 GB-초**까지 **프리티어 (영구 무료)**
- ARM(Graviton2) 런타임 선택 시 약 **20% 저렴**

## 동작 흐름

```
[Client] → [Trigger (API GW, S3, SQS…)] → [Lambda Service]
                                              ↓
                                     [컨테이너 생성/재사용]
                                              ↓
                                     [Handler 함수 실행]
                                              ↓
                                        [결과 반환]
                                              ↓
                                   [CloudWatch Logs 기록]
```

## 사용 사례

- **웹/모바일 백엔드 API** (API-Gateway + Lambda)
- **파일 업로드 후처리** (S3 업로드 → 썸네일 생성, 바이러스 스캔)
- **스케줄 배치 작업** (EventBridge cron → 일일 리포트 생성)
- **스트리밍 데이터 처리** (Kinesis → 실시간 분석/변환)
- **알림/메시징 파이프라인** (SNS/SQS → 처리 후 저장)

## 장단점

### 장점
- 서버 관리 불필요, 자동 스케일링
- 호출량 기반 과금 → 사용량 적을 때 매우 저렴
- 다양한 AWS 서비스와 네이티브 통합

### 단점
- **15분 실행 제한** — 장시간 작업 부적합
- **Cold Start** 지연 발생 가능
- 로컬 디버깅이 상대적으로 번거로움 (SAM/LocalStack 활용)
- **상태 저장 불가** (Stateless) — 외부 저장소(DynamoDB, S3 등) 필요
- 장기 연결(WebSocket 등)은 별도 서비스 조합 필요

## 관련 서비스/도구

- **AWS SAM (Serverless Application Model)** — 로컬 개발/배포 프레임워크
- **Serverless Framework** — 멀티 클라우드 지원 오픈소스 프레임워크
- **AWS CDK** — 코드로 Lambda 인프라 정의
- **LocalStack** — 로컬에서 Lambda 에뮬레이션
