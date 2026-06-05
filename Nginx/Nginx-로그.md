# Nginx 로그

> 최종 업데이트: 2026-05-24 | 기준: Nginx stable 1.30.x

## 개념

Nginx는 **Access 로그**(누가 무엇을 요청했나)와 **Error 로그**(무엇이 잘못됐나) 두 종류를 남긴다. 디버깅, 모니터링, 보안 감사의 1차 자료다.

> **비유**: 건물 출입 기록부와 같다. Access 로그는 "누가 언제 어느 방에 들어갔는지"를, Error 로그는 "문이 안 열렸다, 정전됐다" 같은 사고를 적는다.

## Access 로그

모든 클라이언트 요청을 기록한다. 기본 경로: `/var/log/nginx/access.log`

```
# 기본 로그 포맷 (combined)
192.168.1.1 - - [08/Apr/2026:10:30:00 +0900] "GET /api/users HTTP/1.1" 200 1234 "https://example.com" "Mozilla/5.0..."
# 형식: IP - 사용자 [시간] "메서드 URI 프로토콜" 상태코드 응답크기 "Referer" "User-Agent"
```

커스텀 포맷을 정의해 필요한 필드만 남길 수 있다.

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

> `$request_time`과 `$upstream_response_time`을 함께 찍으면 "Nginx가 느린지, 백엔드가 느린지" 구분할 수 있어 성능 분석에 유용하다.

## Error 로그

서버 오류, 설정 오류, upstream 장애 등을 기록한다. 기본 경로: `/var/log/nginx/error.log`

```nginx
error_log /var/log/nginx/error.log warn;   # warn 이상 레벨만 기록
```

레벨은 아래로 갈수록 심각하며, 설정한 레벨 **이상**만 기록된다.

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

운영 환경에서는 보통 `warn` 또는 `error`로 두고, 문제 추적 시 일시적으로 `debug`로 올린다(`debug`는 로그량이 많아 상시 사용은 지양).

## 관련 문서

- [Nginx 개념](./Nginx-개념.md) — Nginx 전반 개요
- [Nginx 설정](./Nginx-설정.md) — 설정 파일 구조와 디렉티브
- [Nginx timeout](./Nginx-timeout.md) — 타임아웃 관련 오류 분석

---

**참고 자료**

- [nginx 공식 문서 — Logging](https://nginx.org/en/docs/http/ngx_http_log_module.html)
