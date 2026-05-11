# Nginx

> 최종 업데이트: 2026-04-08 | 기준: Nginx 1.27 (mainline), Nginx Plus R33

## 개념

고성능 웹 서버이자 리버스 프록시 서버. 이벤트 기반(Event-Driven) 비동기 구조로 대량의 동시 커넥션을 효율적으로 처리한다.

> **비유**: 식당의 안내 데스크와 같다. 손님(클라이언트)이 오면 직접 요리하지 않고, 적절한 주방(백엔드 서버)으로 안내하거나, 이미 준비된 음식(캐시/정적 파일)은 바로 제공한다. 안내 데스크 직원 한 명(Worker Process)이 여러 손님을 동시에 응대할 수 있는 구조다.

| 구분 | 역할 | 예시 |
|------|------|------|
| Web Server | 정적 파일 제공 (HTML, CSS, JS, 이미지) | Nginx, Apache |
| WAS | 동적 요청 처리 (비즈니스 로직) | Spring Boot (Tomcat), Node.js |

백엔드 개발자 관점에서 Nginx는 WAS 앞단에 위치하여 **리버스 프록시, 로드 밸런싱, SSL 터미네이션, 정적 파일 서빙, 캐싱, 요청 제한** 등을 담당하는 인프라 계층이다.

## 배경

- **Igor Sysoev**가 Apache의 C10K 문제를 해결하기 위해 2004년 공개
- **Nginx Inc.** 설립 후 상용 버전(Nginx Plus) 출시
- **2019년 F5 Networks가 Nginx Inc.를 인수**, 현재 F5에서 관리
- 오픈소스 버전(BSD-like 2-clause 라이선스)은 계속 무료 제공

```
F5 Networks (인수)
├── Nginx (오픈소스, BSD-like 라이선스) — 무료
└── Nginx Plus (상용) — 유료, 추가 기능 (Active 헬스 체크, 대시보드, JWT 인증 등)
```

## 아키텍처

```
              ┌─── Worker Process 1 ───┐
              │  event loop (비동기)     │
Master  ──────├─── Worker Process 2 ───┤──→ Thread Pool (오래 걸리는 작업)
Process       │  event loop (비동기)     │
(설정 관리)     ├─── Worker Process N ───┤
              │  event loop (비동기)     │
              └────────────────────────┘
              (보통 CPU 코어 수만큼 생성)
```

### Master Process
- 설정 파일 읽기, Worker Process 생성/관리
- 설정 변경(reload) 시 새로운 Worker를 생성하고, 기존 Worker는 요청 처리 완료 후 종료 → **무중단 설정 변경 가능**

### Worker Process
- 실제 요청을 처리하는 프로세스
- **이벤트 기반 비동기 처리**: OS 커널의 I/O 멀티플렉싱(Linux `epoll`, macOS `kqueue`)을 통해 수천 개의 커넥션을 하나의 프로세스에서 처리
- 오래 걸리는 작업(디스크 I/O 등)은 Thread Pool로 위임 (1.7.11+)

### Apache와의 차이

| 항목 | Apache (prefork) | Nginx |
|------|-------------------|-------|
| 처리 모델 | 요청당 프로세스/스레드 생성 | 이벤트 기반 비동기 |
| 동시 커넥션 | 커넥션 증가 시 메모리/CPU 급증 | 커넥션 증가해도 메모리 거의 일정 |
| 설정 변경 | 재시작 필요 | reload로 무중단 변경 |
| .htaccess | 디렉토리별 설정 가능 | 미지원 (중앙 설정만) |

## 주요 역할

### 1. 리버스 프록시

클라이언트와 백엔드 서버 사이에서 요청을 중계한다.

> **비유**: 콜센터 교환원처럼 외부 전화(요청)를 받아 내부 담당자(WAS)에게 연결해준다. 외부에서는 담당자의 내선번호(서버 IP)를 알 수 없다.

```
Client  →  Nginx (리버스 프록시)  →  WAS (Spring Boot 등)
```

- 백엔드 서버 정보를 클라이언트에게 숨김 (보안)
- 응답 헤더에서 민감 정보 제거 가능

```nginx
server {
    listen 80;
    server_name example.com;

    location / {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 2. 로드 밸런싱

여러 WAS에 요청을 분산한다.

> **비유**: 놀이공원에서 여러 매표소가 있을 때, 안내원이 줄이 가장 짧은 곳으로 손님을 보내는 것과 같다.

```nginx
upstream backend {
    least_conn;                    # 최소 커넥션 방식
    server 192.168.1.10:8080;
    server 192.168.1.11:8080;
    server 192.168.1.12:8080 backup;  # 다른 서버 장애 시에만 사용
}

server {
    listen 80;

    location / {
        proxy_pass http://backend;
    }
}
```

| 알고리즘 | 설명 |
|----------|------|
| `round-robin` | 순차 분배 (기본값) |
| `least_conn` | 커넥션이 가장 적은 서버에 분배 |
| `ip_hash` | 클라이언트 IP 기반 고정 분배 (세션 유지) |
| `hash` | 커스텀 키 기반 분배 (`hash $request_uri consistent;` 등) |
| `random` | 랜덤 분배, `two least_conn` 옵션으로 2개 중 적은 쪽 선택 |

### 3. SSL/TLS 터미네이션

클라이언트와는 HTTPS, 백엔드와는 HTTP로 통신하여 WAS의 암복호화 부하를 줄인다.

```
Client ──HTTPS──→ Nginx ──HTTP──→ WAS
```

```nginx
server {
    listen 443 ssl;
    server_name example.com;

    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;
    ssl_protocols TLSv1.2 TLSv1.3;

    location / {
        proxy_pass http://localhost:8080;
    }
}

# HTTP → HTTPS 리다이렉트
server {
    listen 80;
    server_name example.com;
    return 301 https://$host$request_uri;
}
```

### 4. 정적 파일 서빙

WAS 대신 정적 파일을 직접 제공하여 WAS 부하를 줄인다.

```nginx
server {
    listen 80;

    # 정적 파일은 Nginx가 직접 처리
    location /static/ {
        root /var/www;
        expires 30d;           # 브라우저 캐시 30일
    }

    # 나머지는 WAS로 전달
    location / {
        proxy_pass http://localhost:8080;
    }
}
```

### 5. 캐싱

백엔드 응답을 캐싱하여 동일 요청 시 WAS를 거치지 않는다.

> **비유**: 자주 묻는 질문(FAQ)을 미리 준비해두면 매번 담당자에게 확인하지 않아도 바로 답변할 수 있는 것과 같다.

```nginx
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=my_cache:10m max_size=1g;

server {
    location / {
        proxy_cache my_cache;
        proxy_cache_valid 200 10m;   # 200 응답 10분 캐시
        proxy_pass http://localhost:8080;
    }
}
```

### 6. gzip 압축

텍스트 기반 응답을 압축하여 전송 크기를 줄인다.

```nginx
gzip on;
gzip_types text/plain application/json application/javascript text/css;
gzip_min_length 1000;    # 1KB 미만은 압축 안 함
```

### 7. Rate Limiting (요청 제한)

특정 클라이언트의 과도한 요청을 제한하여 서버를 보호한다. DDoS 방어, API 남용 방지 등에 활용한다.

> **비유**: 놀이기구 탑승 제한처럼, 한 사람이 일정 시간 내에 탈 수 있는 횟수를 정해두는 것과 같다.

```nginx
# 요청 제한 영역 정의: 클라이언트 IP 기준, 초당 10개 요청 허용
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;

server {
    location /api/ {
        limit_req zone=api_limit burst=20 nodelay;
        # burst=20: 순간 최대 20개까지 허용
        # nodelay: burst 범위 내 요청은 지연 없이 즉시 처리
        proxy_pass http://localhost:8080;
    }
}
```

| 디렉티브 | 설명 |
|----------|------|
| `limit_req_zone` | 제한 영역 정의 (공유 메모리 크기, 기준 키, 허용 속도) |
| `limit_req` | 특정 location에 제한 적용 |
| `burst` | 순간 초과 요청을 큐에 대기시킬 수 있는 개수 |
| `nodelay` | burst 범위 내 요청을 즉시 처리 (큐 대기 없음) |

동시 접속 수 제한도 가능하다:

```nginx
limit_conn_zone $binary_remote_addr zone=conn_limit:10m;

server {
    location /download/ {
        limit_conn conn_limit 5;   # IP당 동시 5개 커넥션
    }
}
```

## Health Check (헬스 체크)

로드 밸런싱 시 백엔드 서버의 상태를 확인하여 장애 서버로의 요청을 방지한다.

> **비유**: 택배 기사가 배송 전에 수령인이 집에 있는지 미리 확인하는 것과 같다. 부재 중(장애)이면 다른 주소(서버)로 배송한다.

### Passive Health Check (오픈소스)

실제 요청의 응답을 기반으로 서버 상태를 판단한다. 별도의 헬스 체크 요청을 보내지 않는다.

```nginx
upstream backend {
    server 192.168.1.10:8080 max_fails=3 fail_timeout=30s;
    server 192.168.1.11:8080 max_fails=3 fail_timeout=30s;
}
```

| 파라미터 | 설명 |
|----------|------|
| `max_fails` | 이 횟수만큼 연속 실패하면 서버를 비활성화 (기본값 1) |
| `fail_timeout` | 비활성화 유지 시간 + 실패 횟수 카운트 윈도우 (기본값 10s) |

### Active Health Check (Nginx Plus)

Nginx Plus는 주기적으로 백엔드에 헬스 체크 요청을 능동적으로 보낸다.

```nginx
# Nginx Plus 전용
upstream backend {
    zone backend_zone 64k;
    server 192.168.1.10:8080;
    server 192.168.1.11:8080;
}

server {
    location / {
        proxy_pass http://backend;
        health_check interval=5s fails=3 passes=2 uri=/health;
    }
}
```

### 오픈소스 Workaround

오픈소스 Nginx에서 Active Health Check가 필요하면 서드파티 모듈 `nginx_upstream_check_module`을 사용하거나, 외부 스크립트로 주기적으로 백엔드 상태를 확인한 뒤 Nginx 설정을 reload하는 방식을 쓴다.

## 로그

Nginx는 두 종류의 로그를 제공한다. 디버깅, 모니터링, 보안 감사에 필수적이다.

### Access 로그

모든 클라이언트 요청을 기록한다. 기본 경로: `/var/log/nginx/access.log`

```
# 기본 로그 포맷 (combined)
192.168.1.1 - - [08/Apr/2026:10:30:00 +0900] "GET /api/users HTTP/1.1" 200 1234 "https://example.com" "Mozilla/5.0..."
```

```
IP - 사용자 [시간] "메서드 URI 프로토콜" 상태코드 응답크기 "Referer" "User-Agent"
```

커스텀 로그 포맷 정의:

```nginx
log_format custom '$remote_addr - $request_time $status "$request"';
access_log /var/log/nginx/access.log custom;
```

| 주요 변수 | 설명 |
|-----------|------|
| `$remote_addr` | 클라이언트 IP |
| `$request_time` | 요청 처리 시간 (초 단위, 소수점 포함) |
| `$upstream_response_time` | 백엔드 응답 시간 |
| `$status` | HTTP 응답 상태 코드 |
| `$body_bytes_sent` | 응답 본문 크기 |

### Error 로그

서버 오류, 설정 오류, upstream 장애 등을 기록한다. 기본 경로: `/var/log/nginx/error.log`

```nginx
error_log /var/log/nginx/error.log warn;
```

| 로그 레벨 | 설명 |
|-----------|------|
| `debug` | 가장 상세 (디버깅 시 사용) |
| `info` | 일반 정보 |
| `notice` | 주의할 만한 이벤트 |
| `warn` | 경고 |
| `error` | 요청 처리 중 오류 (가장 자주 확인) |
| `crit` | 치명적 오류 |
| `alert` | 즉시 조치 필요 |
| `emerg` | 시스템 사용 불가 |

## 전체 요청 흐름

```
Client
  ↓ (HTTPS)
Nginx
  ├── Rate Limiting (요청 제한 검사)
  ├── SSL 터미네이션 (HTTPS → HTTP)
  ├── Access 로그 기록
  ├── gzip 압축/해제
  ├── 정적 파일 → 직접 응답
  ├── 캐시 히트 → 캐시에서 응답
  └── 동적 요청 → Health Check 기반 로드 밸런싱 → WAS (Spring Boot)
                                                    ↓
                                                  응답
                                                    ↓
                                              Nginx (캐싱, 압축)
                                                    ↓
                                                  Client
```

## 설정 파일 구조

```
/etc/nginx/
├── nginx.conf              # 메인 설정
├── conf.d/                 # 추가 설정 (*.conf 자동 로드)
│   └── default.conf
├── sites-available/        # 가용 사이트 설정 (Debian 계열)
├── sites-enabled/          # 활성화된 사이트 (심볼릭 링크)
└── mime.types              # MIME 타입 매핑
```

> 설정 파일 문법, 디렉티브 상세, 블록 구조 등은 [Nginx 설정](./Nginx-설정.md) 문서 참고

### 주요 명령어

```bash
nginx -t                    # 설정 파일 문법 검사
nginx -s reload             # 무중단 설정 반영
nginx -s stop               # 즉시 종료
nginx -s quit               # 요청 처리 완료 후 종료
nginx -V                    # 빌드 옵션 및 모듈 확인
```
