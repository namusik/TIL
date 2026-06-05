# Nginx 로드 밸런싱과 헬스 체크

> 최종 업데이트: 2026-05-24 | 기준: Nginx stable 1.30.x (오픈소스), Nginx Plus(상용)

## 개념

**로드 밸런싱(Load Balancing)은 들어온 요청을 여러 백엔드(WAS) 인스턴스에 나눠 보내는 것**이다. 한 대에 부하가 몰리지 않게 분산해 처리량과 가용성을 높인다.

> **비유**: 놀이공원에서 여러 매표소가 있을 때, 안내원이 줄이 가장 짧은 곳으로 손님을 보내는 것과 같다.

Nginx에서는 `upstream` 블록으로 백엔드 그룹을 정의하고, `proxy_pass`로 그 그룹에 요청을 넘긴다.

```nginx
upstream backend {
    least_conn;                       # 분산 알고리즘
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

> `upstream` 블록의 위치와 설정 파일 구조는 [Nginx 설정](./Nginx-설정.md) 참고.

## 분산 알고리즘

| 알고리즘 | 설명 |
|----------|------|
| `round-robin` | 순차 분배 (기본값, 별도 지시어 없이 동작) |
| `least_conn` | 커넥션이 가장 적은 서버에 분배 |
| `ip_hash` | 클라이언트 IP 기반 고정 분배 (세션 유지에 유리) |
| `hash` | 커스텀 키 기반 분배 (`hash $request_uri consistent;` 등) |
| `random` | 랜덤 분배, `random two least_conn`으로 2개 중 적은 쪽 선택 |

서버별 가중치(`weight`)도 줄 수 있다. 성능 좋은 서버에 더 많은 요청을 보낼 때 쓴다.

```nginx
upstream backend {
    server 192.168.1.10:8080 weight=3;   # 3배 더 받음
    server 192.168.1.11:8080;            # weight=1 (기본)
}
```

## 헬스 체크 (Health Check)

로드 밸런싱 시 백엔드 서버의 상태를 확인해 **장애 서버로의 요청을 막는다.** 살아있는 서버에만 요청이 가도록 거르는 장치다.

> **비유**: 택배 기사가 배송 전에 수령인이 집에 있는지 미리 확인하는 것과 같다. 부재 중(장애)이면 다른 주소(서버)로 배송한다.

### Passive Health Check (오픈소스)

실제 요청의 응답을 보고 서버 상태를 판단한다. 별도의 헬스 체크 요청을 보내지 않는다 — "요청을 보내봤더니 실패하더라"로 판단하는 방식.

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

Nginx Plus는 주기적으로 백엔드에 헬스 체크 요청을 **능동적으로** 보낸다. 실제 트래픽과 무관하게 미리 죽은 서버를 골라낸다.

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

오픈소스 Nginx에서 Active Health Check가 필요하면 서드파티 모듈 `nginx_upstream_check_module`을 쓰거나, 외부 스크립트로 주기적으로 백엔드 상태를 확인한 뒤 Nginx 설정을 reload하는 방식을 쓴다.

## 관련 문서

- [Nginx 개념](./Nginx-개념.md) — Nginx 전반 개요
- [Nginx 설정](./Nginx-설정.md) — `upstream`·`server`·`location` 블록 구조
- [Nginx timeout](./Nginx-timeout.md) — 백엔드 통신 타임아웃 튜닝

---

**참고 자료**

- [nginx 공식 문서 — Load Balancing](https://nginx.org/en/docs/http/load_balancing.html)
