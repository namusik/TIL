# Nginx

> 최종 업데이트: 2026-03-23 | 기준: Nginx 1.27 (mainline), Nginx Plus R33

## Nginx란?

고성능 웹 서버이자 리버스 프록시 서버. 이벤트 기반(Event-Driven) 비동기 구조로 대량의 동시 커넥션을 효율적으로 처리한다.

| 구분 | 역할 | 예시 |
|------|------|------|
| Web Server | 정적 파일 제공 (HTML, CSS, JS, 이미지) | Nginx, Apache |
| WAS | 동적 요청 처리 (비즈니스 로직) | Spring Boot (Tomcat), Node.js |

## 배경

- **Igor Sysoev**가 Apache의 C10K 문제를 해결하기 위해 개발
- **Nginx Inc.** 설립 후 상용 버전(Nginx Plus) 출시
- **2019년 F5 Networks가 Nginx Inc.를 인수**, 현재 F5에서 관리
- 오픈소스 버전(BSD 라이선스)은 계속 무료 제공

```
F5 Networks (인수)
├── Nginx (오픈소스, BSD 라이선스) — 무료
└── Nginx Plus (상용) — 유료, 추가 기능 (헬스 체크, 대시보드 등)
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
- **이벤트 기반 비동기 처리**: OS 커널의 멀티플렉싱(epoll/kqueue)을 통해 수천 개의 커넥션을 하나의 프로세스에서 처리
- 오래 걸리는 작업(디스크 I/O 등)은 Thread Pool로 위임

### Apache와의 차이

| 항목 | Apache (prefork) | Nginx |
|------|-------------------|-------|
| 처리 모델 | 요청당 프로세스/스레드 생성 | 이벤트 기반 비동기 |
| 동시 커넥션 | 커넥션 증가 시 메모리/CPU 급증 | 커넥션 증가해도 메모리 거의 일정 |
| 설정 변경 | 재시작 필요 | reload로 무중단 변경 |

## 주요 역할

### 1. 리버스 프록시

클라이언트와 백엔드 서버 사이에서 요청을 중계한다.

```
Client  →  Nginx (리버스 프록시)  →  WAS (Spring Boot 등)
```

- 백엔드 서버 정보를 클라이언트에게 숨김 (보안)
- 응답 데이터에서 민감 정보 제거 가능

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
| `hash` | 커스텀 키 기반 분배 |

### 3. SSL 터미네이션

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

## 전체 요청 흐름

```
Client
  ↓ (HTTPS)
Nginx
  ├── SSL 터미네이션 (HTTPS → HTTP)
  ├── gzip 압축/해제
  ├── 정적 파일 → 직접 응답
  ├── 캐시 히트 → 캐시에서 응답
  └── 동적 요청 → 로드 밸런싱 → WAS (Spring Boot)
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

### 주요 명령어

```bash
nginx -t                    # 설정 파일 문법 검사
nginx -s reload             # 무중단 설정 반영
nginx -s stop               # 즉시 종료
nginx -s quit               # 요청 처리 완료 후 종료
```
