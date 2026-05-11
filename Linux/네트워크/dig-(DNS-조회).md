# dig (DNS 조회 명령어)

> 최종 업데이트: 2026-04-17 | 기준 정보: BIND 9 기준 dig 유틸리티

## 개념

`dig`(Domain Information Groper)는 **도메인 이름이 어떤 IP 주소/레코드로 매핑되어 있는지 DNS 서버에 직접 질의해 결과를 보여주는 명령어**다. 전화번호부를 직접 열어보는 것에 비유할 수 있다 — "이 이름의 번호가 뭐야?"를 DNS 서버에 물어보고 원본 응답을 그대로 출력한다.

- `dig bms-gw.megabird.com` → `bms-gw.megabird.com`의 A 레코드(IPv4 주소)를 조회
- DNS 문제 디버깅 시 가장 기본이 되는 도구 (nslookup의 상위 호환 격)
- 응답을 **가공 없이 상세하게** 보여줘서 TTL, 권한 서버, 응답 시간까지 확인 가능

## 배경/역사

- **BIND(Berkeley Internet Name Domain) 프로젝트의 일부**로 배포 — ISC(Internet Systems Consortium)가 유지보수
- 원래 `nslookup`이 표준이었으나, **nslookup은 deprecated** 상태로 문서화되어 있고 BIND 9 이후로 `dig`가 권장됨
- macOS/대부분의 Linux 배포판에 기본 포함되거나 `bind-utils` / `dnsutils` 패키지로 설치 가능

## 기본 사용법

```sh
dig bms-gw.megabird.com
```

기본적으로 **A 레코드(IPv4 주소)** 를 조회한다.

## 출력 읽는 법

```
; <<>> DiG 9.10.6 <<>> bms-gw.megabird.com
;; global options: +cmd
;; Got answer:
;; ->>HEADER<<- opcode: QUERY, status: NOERROR, id: 12345
;; flags: qr rd ra; QUERY: 1, ANSWER: 1, AUTHORITY: 0, ADDITIONAL: 1

;; QUESTION SECTION:
;bms-gw.megabird.com.          IN  A

;; ANSWER SECTION:
bms-gw.megabird.com.   300     IN  A   10.0.0.5

;; Query time: 23 msec
;; SERVER: 168.126.63.1#53(168.126.63.1)
;; WHEN: Fri Apr 17 10:00:00 KST 2026
;; MSG SIZE  rcvd: 64
```

| 섹션 | 의미 |
|------|------|
| HEADER | 응답 상태(`NOERROR`, `NXDOMAIN` 등), 플래그 |
| QUESTION | 내가 질의한 내용 |
| **ANSWER** | DNS 서버가 반환한 실제 레코드 |
| AUTHORITY | 해당 도메인의 권한 있는 네임서버 |
| ADDITIONAL | 부가 정보 (NS의 A 레코드 등) |
| Query time | 응답까지 걸린 시간 |
| SERVER | 질의한 DNS 서버 주소 |

### 주요 status 코드
- **NOERROR** — 정상 응답
- **NXDOMAIN** — 해당 도메인 존재하지 않음
- **SERVFAIL** — DNS 서버 에러 (DNSSEC 실패 등)
- **REFUSED** — 서버가 응답 거부

## 자주 쓰는 옵션/레코드 타입

### 레코드 타입 지정
```sh
dig example.com A        # IPv4 주소
dig example.com AAAA     # IPv6 주소
dig example.com MX       # 메일 서버
dig example.com NS       # 네임서버
dig example.com TXT      # TXT (SPF, DKIM, 도메인 소유 검증 등)
dig example.com CNAME    # 별칭
dig example.com SOA      # 권한 시작(Start of Authority)
dig example.com ANY      # 모든 레코드 (차단하는 서버도 많음)
```

### 간단하게 결과만 보기
```sh
dig +short example.com
# → 10.0.0.5
```

### 특정 DNS 서버로 질의
```sh
dig @8.8.8.8 example.com          # Google DNS
dig @1.1.1.1 example.com          # Cloudflare DNS
dig @168.126.63.1 example.com     # KT DNS
```

### 역방향 조회 (IP → 도메인)
```sh
dig -x 8.8.8.8
```

### 추적(trace) — 루트 네임서버부터 차례로 질의
```sh
dig +trace example.com
```

### 추가 디버깅 옵션
```sh
dig +noall +answer example.com    # ANSWER 섹션만 출력
dig +tcp example.com              # TCP로 질의 (기본은 UDP)
dig +dnssec example.com           # DNSSEC 서명 포함
```

## 실무 사용 사례

| 상황 | 명령 |
|------|------|
| 도메인이 실제로 어디 IP로 연결되는지 확인 | `dig +short example.com` |
| 메일 서버 설정 검증 | `dig example.com MX` |
| SPF/DKIM 레코드 확인 | `dig example.com TXT` |
| 소유권 인증용 TXT 등록 후 전파 확인 | `dig _acme-challenge.example.com TXT` |
| DNS 전파 확인 (여러 서버에 질의) | `dig @8.8.8.8 example.com`, `dig @1.1.1.1 example.com` |
| 로컬 `/etc/hosts` 무시하고 순수 DNS 확인 | `dig` (항상 DNS만 질의 — `hosts` 파일 영향 없음) |

## 유사 명령어 비교

| 명령 | 특징 | 상태 |
|------|------|------|
| **dig** | 상세 출력, 스크립팅 친화적, 모든 레코드 타입 지원 | **권장** |
| nslookup | 간단한 출력, 대화형 모드 지원 | Deprecated (but 여전히 많이 사용됨) |
| host | 출력이 가장 간결 | 간단 확인용 |
| getent hosts | `/etc/hosts` + DNS 통합 조회 (Linux glibc) | 시스템 레벨 확인용 |

## 설치

### macOS
```sh
# 기본 포함됨. 없을 시:
brew install bind
```

### Ubuntu/Debian
```sh
sudo apt install dnsutils
```

### RHEL/CentOS/Amazon Linux
```sh
sudo yum install bind-utils
```

## 주의사항

- `dig`는 DNS만 질의하므로 `/etc/hosts`에 등록된 내용은 **무시**된다. 실제 애플리케이션이 사용하는 이름 해석과 다를 수 있음 → 앱 동작 확인은 `getent hosts` 또는 `curl -v` 병행
- 응답의 **TTL**을 보면 캐시가 얼마나 남았는지 알 수 있음 → DNS 변경 후 전파 대기 시간 예측에 유용
- 사내 DNS(예: `bms-gw.megabird.com` 같은 내부 도메인)는 외부 DNS(`@8.8.8.8`)로 질의하면 `NXDOMAIN`이 나올 수 있으니, 기본 시스템 DNS로 질의해야 한다
