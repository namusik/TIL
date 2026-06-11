# Redis Cluster

> 최종 업데이트: 2026-06-11 | Redis 7.x / Valkey 기준

## 개념

**Redis Cluster**는 여러 Redis 노드를 하나의 시스템처럼 묶어 **데이터를 분산 저장(샤딩)하고, 노드가 죽어도 자동으로 복구(failover)** 되게 하는 구성 방식이다. 단일 노드의 두 가지 한계 — 한 서버 메모리에 다 못 담는 용량 문제, 그 서버가 죽으면 끝나는 가용성 문제 — 를 동시에 푼다.

> 비유: 단일 Redis가 "큰 창고 하나"라면, Cluster는 "여러 창고를 번호 규칙으로 나눠 쓰고, 각 창고마다 백업 창고를 둔 물류망"이다. 물건(키)은 정해진 규칙으로 어느 창고에 갈지 결정되고, 한 창고가 불타도 백업 창고가 즉시 그 역할을 이어받는다.

이 문서는 **개념·원리**를 다룬다. CLI로 클러스터를 직접 만들고 failover를 재현하는 실습은 [Redis-Cluster-실습.md](Redis-Cluster-실습.md)를, AWS 관리형 버전은 [ElastiCache.md](../AWS/ElastiCache/ElastiCache.md)를 참고한다.

## 배경/역사

Redis는 본래 단일 인스턴스로 시작했고, 고가용성 수요가 커지며 단계적으로 진화했다.

| 단계 | 해결한 문제 | 한계 |
|------|------------|------|
| 단일 인스턴스 | — | 죽으면 끝, 용량은 한 서버 메모리 한도 |
| **Replication** (Master/Replica) | 읽기 분산, 데이터 이중화 | failover가 **수동**, 용량은 여전히 한 서버 한도 |
| **Sentinel** | Master 감시 + **자동 failover** | 샤딩 없음 (전체 데이터가 한 Master에) |
| **Cluster** (Redis 3.0, 2015) | 자동 failover + **샤딩(수평 확장)** | 멀티키 연산 제약, 클라이언트 클러스터 지원 필요 |

Cluster를 이해하려면 그 토대인 Replication부터 봐야 한다.

## 먼저: Replication (Master / Replica)

Read 분산과 데이터 이중화를 위한 Master/Replica 구조다.

- **Master 노드**: 쓰기·읽기 전부 수행
- **Replica 노드**: 읽기만 수행 (Master 데이터를 전부 복제해서 보유)

### 복제 작업 흐름

1. Replica 쪽에 `replicaof <master IP> <master PORT>` 설정 또는 `REPLICAOF` 명령으로 Master에 데이터 Sync 요청.
2. Master는 백그라운드에서 RDB 파일(현재 메모리 상태 스냅샷) 생성 프로세스를 시작.
3. Master가 `fork`로 메모리를 복사하고, fork된 프로세스가 메모리 상태를 디스크에 덤프.
4. 동시에 Master는 덤프 진행 중 들어오는 쓰기 명령을 **Buffer**에 모아둠.
5. 덤프 완료 시 Master가 RDB 파일을 Replica로 전달.
6. Replica는 디스크에 저장 후 메모리로 로드.
7. 4번에서 모아둔 쓰기 명령들을 Replica로 보내 최신 상태로 맞춤.

### Replication만으로 부족한 이유

- **fork 시 메모리 압박**: Master가 fork할 때 자신이 쓰는 메모리만큼 추가로 필요해져, 여유가 없으면 OOM 위험.
- **수동 failover**: Master가 죽으면 Replica는 주인을 잃고 Sync 에러 — 읽기만 되고 쓰기 불가. 사람이 Replica를 Master로 승격시켜야 한다.
- 이 **자동 failover**를 해결하는 것이 Sentinel과 Cluster다.

## Redis Cluster 구조

Cluster는 서로 다른 서버를 하나로 묶어 클라이언트에게 고가용성을 제공한다. 데이터가 여러 노드에 분산 저장되어 트래픽이 분산되고, 노드가 꺼져도 백업(Replica) 덕분에 유실 없이 서비스가 이어진다.

- 클러스터를 구성하는 각 노드는 **Master 노드**이며, 자신만의 **slot range**를 담당한다.
- 각 Master는 데이터 이중화를 위해 **Replica 노드**를 가질 수 있다.
- 구성: **하나의 클러스터 > 여러 개의 Master > 각 Master마다 여러 Replica**.

```
클러스터
├─ Master A (slot 0–5460)      ── Replica A
├─ Master B (slot 5461–10922)  ── Replica B
└─ Master C (slot 10923–16383) ── Replica C
```

## 해시 슬롯 (Hash Slot)

키가 **어느 노드에 저장될지** 정하는 규칙이다. Cluster는 키 공간을 고정된 **16,384개 슬롯**으로 나눈다.

```
슬롯 번호 = CRC16(key) mod 16384
```

- 키를 CRC16으로 해시한 뒤 16384로 나눈 나머지가 그 키의 슬롯 번호.
- n개의 Master가 16,384개 슬롯을 나눠 가진다 (예: 3 Master면 약 5,461개씩).
- 슬롯이 노드에 배정되므로, 노드를 추가/제거하면 **슬롯 단위로 재분배**(리샤딩)된다.

### 멀티키 연산 제약과 Hash Tag

서로 다른 슬롯의 키를 한 명령으로 묶을 수 없다(`MSET`, `SUNION` 등). 관련 키를 같은 슬롯에 모으려면 **hash tag**를 쓴다 — 키에서 `{...}` 안의 부분만 해싱한다.

```
{user1000}.profile  ┐
{user1000}.cart     ├─ 모두 "user1000"만 해싱 → 같은 슬롯 → 멀티키 연산 가능
{user1000}.orders   ┘
```

## 자동 Failover

각 노드는 **gossip 프로토콜**로 서로의 상태를 주고받으며 장애를 감지한다.

1. Master가 `cluster-node-timeout` 동안 응답이 없으면 다른 노드들이 의심(PFAIL) → 다수가 동의하면 FAIL로 확정.
2. 죽은 Master의 Replica들이 **승격 선거(election)**를 시작.
3. 과반수 Master의 표를 얻은 Replica가 새 Master로 승격하고, 죽은 Master의 슬롯을 인계받는다.
4. 죽었던 노드가 되살아나면 새 Master의 **Replica로 합류**한다.

과반 투표가 필요하므로 **Master는 홀수(최소 3대)** 구성이 권장된다. 그래야 한쪽이 죽어도 과반이 유지되어 split-brain을 피한다. 그래서 운영 표준은 흔히 **3 Master + 3 Replica = 6노드**다.

### failover 관련 주요 설정

| 설정 | 의미 |
|------|------|
| `cluster-node-timeout` | 노드를 비정상으로 판단하는 기준 시간 |
| `cluster-replica-validity-factor` | `node-timeout × factor` 이상 Master와 단절된 Replica는 승격 대상에서 제외 (오래된 데이터 방지) |
| `cluster-migration-barrier` | Master가 유지해야 하는 최소 Replica 수 (replica migration 관련) |
| `cluster-require-full-coverage` | 일부 슬롯이 커버되지 않을 때 전체 쓰기를 막을지 (기본 yes) |

## 클라이언트 동작 — MOVED 리다이렉트

클라이언트가 엉뚱한 노드에 키를 요청하면, 그 노드는 데이터를 주지 않고 **올바른 노드를 알려준다**.

```
127.0.0.1:7000> set aaa dd
(error) MOVED 10439 127.0.0.1:7001   ← "그 키는 슬롯 10439, 7001로 가라"
```

- **클러스터 인식(cluster-aware) 클라이언트**는 이 MOVED를 받아 슬롯↔노드 맵을 캐시하고, 다음부터 바로 올바른 노드로 보낸다.
- Replica는 기본적으로 읽기도 거부하며, `READONLY` 명령을 보내야 읽기를 허용한다.

그래서 Cluster를 쓰려면 클라이언트 라이브러리가 클러스터 모드를 지원해야 한다(Lettuce, redis-py 등 대부분 지원).

## Cluster vs Sentinel vs 단일

| | 단일 / Replication | Sentinel | Cluster |
|---|---|---|---|
| 샤딩(수평 확장) | ❌ | ❌ | ✅ |
| 자동 failover | ❌ (수동) | ✅ | ✅ |
| 데이터 용량 | 한 서버 메모리 | 한 서버 메모리 | 노드 수만큼 확장 |
| 멀티키 연산 | 자유 | 자유 | 같은 슬롯만 (hash tag 필요) |
| 클라이언트 | 단순 | 단순 | 클러스터 인식 필요 |
| 적합 | 소규모·캐시 | HA만 필요, 데이터가 한 서버에 충분 | 대용량 + HA |

데이터가 한 서버에 충분히 들어가고 가용성만 필요하면 **Sentinel**, 용량까지 늘려야 하면 **Cluster**다.

## 관련 문서

- [Redis-Cluster-실습.md](Redis-Cluster-실습.md) — CLI로 클러스터 생성·failover 재현·노드 추가/제거 실습
- [1)-Redis-개념.md](1\)-Redis-개념.md) — Redis 엔진 기본
- [11)-Redis-운영시-주의할-점.md](11\)-Redis-운영시-주의할-점.md) — fork·메모리 등 운영 함정
- [ElastiCache.md](../AWS/ElastiCache/ElastiCache.md) — AWS 관리형 Redis/Valkey (Shard = 슬롯 묶음)

## 출처

- [Redis Cluster Specification](https://redis.io/docs/latest/operate/oss_and_stack/reference/cluster-spec/)
- [Redis Cluster Tutorial](https://redis.io/docs/latest/operate/oss_and_stack/management/scaling/)
