# AWS ElastiCache

> 최종 업데이트: 2026-06-11 | ElastiCache for Valkey/Redis OSS/Memcached, Serverless 기준

## 개념

**AWS ElastiCache**는 인메모리 캐시(Valkey·Redis·Memcached)를 **완전관리형(managed)** 으로 제공하는 서비스다. 직접 EC2에 Redis를 설치·운영하는 대신, AWS가 프로비저닝·패치·장애 복구·백업·모니터링을 대신 해준다. RDS가 관계형 DB의 관리형 버전이라면, ElastiCache는 인메모리 캐시의 관리형 버전이다.

> 비유: 직접 Redis 서버를 차려 운영하는 게 "자가용 직접 정비"라면, ElastiCache는 "리스 차량"이다. 엔진(Redis/Valkey)은 똑같지만 정비·고장 대응·교체를 업체가 맡는다. 운전(데이터 읽고 쓰기)에만 집중하면 된다.

캐시 자체의 개념·전략·장애 패턴은 [Cache-개념.md](../../Cache/Cache-개념.md), Redis 엔진의 자료구조·명령어는 [Redis 폴더](../../Redis/1\)-Redis-개념.md)를 참고한다. 이 문서는 **AWS에서 캐시를 운영하는 방식**에 집중한다.

## 배경/역사

| 시점 | 사건 |
|------|------|
| 2011.08 | ElastiCache 출시 (Memcached 엔진만 지원) |
| 2013.09 | **Redis 엔진** 지원 추가 |
| 2016 | Redis **Cluster Mode**(샤딩) 지원, 암호화(at-rest/in-transit) 도입 |
| 2021 | **MemoryDB for Redis** 별도 출시 (영속성 있는 Redis 호환 DB) |
| 2023.11 | **ElastiCache Serverless** 출시 (용량 자동 조절, 노드 설계 불필요) |
| 2024.03 | Redis Inc.가 라이선스를 SSPL/RSALv2로 변경 → 오픈소스 진영 이탈 |
| 2024.10 | **ElastiCache for Valkey** GA. Valkey는 Linux Foundation의 Redis 7.2 포크. AWS가 Redis보다 저렴하게(서버리스 ~33%↓) 제공 |

Redis 라이선스 변경 배경은 [14)-Redis-라이선스.md](../../Redis/14\)-Redis-라이선스.md) 참고. 신규 구축은 라이선스가 자유로운 **Valkey**가 기본 권장이다.

## 엔진 선택: Valkey/Redis vs Memcached

| 항목 | Valkey / Redis | Memcached |
|------|----------------|-----------|
| 자료구조 | String, List, Set, Hash, Sorted Set, Stream 등 풍부 | 단순 Key-Value(String)만 |
| 영속성/백업 | ✅ 스냅샷(S3) | ❌ 없음 (재시작 시 전부 소실) |
| 복제·고가용성 | ✅ Replica + 자동 failover | ❌ 복제 없음 |
| 샤딩 | ✅ Cluster Mode | 클라이언트 측 샤딩 |
| Pub/Sub, 트랜잭션, Lua | ✅ | ❌ |
| 멀티스레드 | Redis는 단일 스레드(코어), Valkey 8.0+ 멀티스레드 I/O | ✅ 멀티스레드 |
| 적합 | 세션·리더보드·랭킹·pub/sub·복잡한 캐시 | 단순 객체 캐시, 초고속 단순 조회 |

대부분의 백엔드 요구(세션 스토어, 랭킹, 복잡한 캐싱, 고가용성)에는 **Valkey/Redis**가 적합하다. Memcached는 구조가 단순하고 복제·영속성이 필요 없는 순수 캐시에만 고려한다.

## 구성 요소

Valkey/Redis(노드 기반) 기준 계층 구조다.

| 구성 | 의미 |
|------|------|
| **Node(노드)** | 캐시가 도는 최소 단위. 하나의 캐시 엔진 인스턴스 |
| **Shard(샤드, Node Group)** | 1개 Primary 노드 + 0~5개 Replica 노드의 묶음. 데이터의 일부를 담당 |
| **Replication Group(클러스터)** | 여러 샤드의 집합. 전체 데이터셋 |

```
Replication Group (클러스터)
├─ Shard 1: Primary ── Replica ── Replica   (키 공간의 1/3)
├─ Shard 2: Primary ── Replica ── Replica   (키 공간의 1/3)
└─ Shard 3: Primary ── Replica ── Replica   (키 공간의 1/3)
```

Primary는 쓰기, Replica는 읽기를 담당(비동기 복제). Primary 장애 시 Replica가 승격된다.

### Redis ↔ ElastiCache 용어 매핑

여기서 Node·샤딩·복제는 **ElastiCache가 만든 개념이 아니라 원래 Redis(Redis Cluster)의 개념**이다. ElastiCache는 그 위에 자기 이름표와 관리형 자동화를 씌웠을 뿐이다. 엔진 동작 원리는 [Redis-Cluster.md](../../Redis/Redis-Cluster.md)와 동일하다.

| 일반 개념 | Redis OSS 용어 | ElastiCache 용어 |
|----------|---------------|-----------------|
| 캐시 인스턴스(프로세스) | **Node** (redis-server) | Node |
| 데이터 분할 | **Hash Slot**(16,384개)로 샤딩 | **Shard** (= Node Group) |
| 복제 | **Master + Replica** | Primary + Replica |
| 전체 클러스터 | **Redis Cluster** | Replication Group |

- **Node·샤딩·Master/Replica**는 Redis 본체 기능이다.
- **Shard / Node Group / Replication Group / Cluster Mode Enabled·Disabled / 엔드포인트**는 ElastiCache가 붙인 관리형 명칭이다. 특히 엔드포인트(Primary/Reader/Configuration)는 순수 AWS 전용 개념이다.
- "Shard"는 Redis만의 단어도 아니다 — DB·MongoDB 등에서 쓰는 "수평 분할된 조각"이라는 분산 시스템 일반 용어다.

## 배포 형태

### Cluster Mode Disabled (단일 샤드)

- 샤드 1개. Primary 1 + Replica 최대 5.
- 전체 데이터가 한 노드에 들어가야 함(수직 확장만).
- 구성이 단순. 데이터셋이 한 노드 메모리에 충분히 들어갈 때 적합.

### Cluster Mode Enabled (다중 샤드)

- 샤드 최대 500개. 키 공간을 16,384개 슬롯으로 나눠 샤드에 분산.
- 수평 확장 가능(샤드 추가로 메모리·처리량 증가).
- 클라이언트가 클러스터 프로토콜을 지원해야 함(슬롯 기반 라우팅).

Redis 클러스터 자체 동작은 [Redis-Cluster.md](../../Redis/Redis-Cluster.md) 참고.

### ElastiCache Serverless

- 노드 타입·샤드 수를 설계할 필요 없음. **트래픽에 따라 용량 자동 조절**.
- 사용한 만큼 과금(저장 GB-시간 + 처리 ECPU).
- 트래픽이 들쭉날쭉하거나 용량 산정이 어려울 때, 운영 부담을 최소화하고 싶을 때 적합.
- 세밀한 노드 튜닝이 필요하거나 비용을 빡빡하게 최적화해야 하면 노드 기반(self-designed)이 유리.

## 엔드포인트

애플리케이션이 어디로 접속하느냐가 배포 형태에 따라 다르다.

| 엔드포인트 | 용도 | 형태 |
|-----------|------|------|
| **Primary Endpoint** | 쓰기 (Cluster Mode Disabled) | 항상 현재 Primary를 가리킴(failover 시 자동 갱신) |
| **Reader Endpoint** | 읽기 분산 (Cluster Mode Disabled) | Replica들에 부하 분산 |
| **Configuration Endpoint** | Cluster Mode Enabled | 클라이언트가 전체 샤드를 자동 발견 |

**failover 시 핵심**: Primary Endpoint는 DNS로 항상 현재 Primary를 가리키므로, 애플리케이션은 엔드포인트만 바라보면 Primary가 바뀌어도 재설정이 필요 없다.

```yaml
# Spring Boot — Lettuce로 ElastiCache 접속 (Cluster Mode Disabled)
spring:
  data:
    redis:
      host: my-cache.xxxx.ng.0001.apn2.cache.amazonaws.com  # Primary Endpoint
      port: 6379
      ssl:
        enabled: true   # in-transit 암호화 사용 시
```

## 고가용성 (Multi-AZ & 자동 Failover)

- **Multi-AZ**: Replica를 Primary와 다른 가용영역(AZ)에 배치. AZ 장애에도 생존.
- **자동 Failover**: Primary 장애 감지 시 Replica를 자동 승격하고 Primary Endpoint를 새 노드로 전환. 보통 수십 초 내 복구.
- Replica가 없으면 자동 failover가 불가능하므로, 운영 환경은 **최소 1개 Replica + Multi-AZ**가 기본이다.

비동기 복제이므로 failover 시 **마지막 일부 쓰기는 유실될 수 있다**. 캐시 용도라면 허용되지만, 절대 유실되면 안 되는 데이터라면 [MemoryDB](#elasticache-vs-memorydb-vs-자체-관리-redis)를 고려한다.

## 확장 (Scaling)

| 방식 | 동작 | 비고 |
|------|------|------|
| **Scale Up/Down (수직)** | 노드 타입을 더 큰/작은 것으로 변경 | 메모리·CPU 증감 |
| **Scale Out/In (수평)** | 샤드 추가/제거 (Cluster Mode) | **온라인 리샤딩** 지원(무중단) |
| **Replica 증감** | 읽기 처리량 조절 | 읽기 부하 분산 |

Cluster Mode Enabled에서는 운영 중 무중단으로 샤드를 추가·제거하며 슬롯을 재분배할 수 있다.

## 보안

| 계층 | 수단 |
|------|------|
| 네트워크 | VPC 내 배치 + Subnet Group + Security Group으로 접근 IP/포트 제한 |
| 저장 데이터 | **at-rest 암호화** (KMS) |
| 전송 데이터 | **in-transit 암호화** (TLS) |
| 인증 | Redis AUTH 토큰, **RBAC/ACL**(Redis 6+/Valkey) 사용자별 권한 |

ElastiCache는 보통 **퍼블릭 인터넷에 노출하지 않고** VPC 내부에서만 접근하도록 둔다. 보안 그룹으로 애플리케이션 서버(EC2/ECS)에서 오는 6379 포트만 허용하는 것이 일반적이다.

## 백업과 스냅샷

- Valkey/Redis는 **스냅샷**을 S3에 저장(수동 또는 자동 일일 백업, 보존 기간 설정).
- 스냅샷으로 새 클러스터 복원·복제 가능.
- **Memcached는 백업 불가**(영속성 없음).

백업 시점에 노드 부하가 늘 수 있으므로, Replica에서 백업을 뜨도록 하는 것이 안전하다(자체 Redis 운영 시 주의점과 동일 — [11)-Redis-운영시-주의할-점.md](../../Redis/11\)-Redis-운영시-주의할-점.md)).

## 모니터링 (CloudWatch 주요 지표)

| 지표 | 의미 | 주의점 |
|------|------|--------|
| `EngineCPUUtilization` | **Redis 엔진 코어** CPU 사용률 | Redis는 단일 스레드라 **이 지표가 핵심**. 호스트 전체 `CPUUtilization`은 낮아도 엔진 코어가 100%일 수 있음 |
| `CPUUtilization` | 노드 호스트 전체 CPU | 멀티코어 평균이라 단독 판단 위험 |
| `DatabaseMemoryUsagePercentage` | 메모리 사용률 | 100% 근접 시 Eviction 발생 |
| `Evictions` | maxmemory 초과로 쫓겨난 키 수 | 급증 = 메모리 부족 신호 |
| `CacheHits` / `CacheMisses` | 적중/실패 | Hit rate로 캐시 효율 판단 |
| `CurrConnections` | 현재 연결 수 | 커넥션 누수·풀 설정 점검 |
| `ReplicationLag` | Primary-Replica 복제 지연 | 크면 failover 시 유실 위험 |
| `SwapUsage` | 스왑 사용량 | 0이 정상. 증가 시 메모리 압박 |

가장 흔한 함정은 `CPUUtilization`만 보고 "여유 있네" 판단하는 것이다. Redis 엔진은 단일 코어에서 도므로 **`EngineCPUUtilization`**을 봐야 한다.

## 노드 타입과 비용

| 계열 | 예시 | 특징 |
|------|------|------|
| Burstable | `cache.t4g.micro` | 저렴, 가변 부하·개발용 |
| 범용 | `cache.m7g.large` | CPU·메모리 균형 |
| 메모리 최적화 | `cache.r7g.xlarge` | 메모리 多, 대용량 캐시 |

- `g` 접미사는 **Graviton(ARM)** 인스턴스 — 가격 대비 성능이 좋아 기본 권장.
- 1년 이상 안정적으로 쓸 노드는 **Reserved Node**로 예약해 비용 절감.
- 비용에 민감하면 Valkey가 Redis보다 저렴하다.

## ElastiCache vs MemoryDB vs 자체 관리 Redis

| | ElastiCache | MemoryDB | EC2 직접 운영 |
|---|---|---|---|
| 성격 | 인메모리 **캐시** | 영속성 있는 **주 DB** | 자유롭지만 직접 관리 |
| 데이터 내구성 | failover 시 일부 유실 가능 | **Multi-AZ 트랜잭션 로그로 무손실** | 설정하기 나름 |
| 쓰기 지연 | 빠름 | 내구성 보장으로 약간 느림 | 빠름 |
| 운영 부담 | 낮음 (관리형) | 낮음 (관리형) | **높음** (패치·백업·HA 직접) |
| 비용 | 중 | 높음 | 인스턴스 비용 + 인건비 |
| 용도 | 캐시·세션·랭킹 | 캐시 겸 주 데이터 저장 | 특수 커스터마이징 필요 시 |

핵심 구분: **ElastiCache는 "잃어도 되는 캐시"**, **MemoryDB는 "잃으면 안 되는 인메모리 DB"**다. 단순 캐싱이면 ElastiCache, 인메모리 속도를 내면서 데이터 자체를 신뢰성 있게 저장해야 하면 MemoryDB다.

## 사용 사례

- **캐싱**: DB 앞단 read-through/cache-aside로 부하·지연 감소
- **세션 스토어**: 무상태 서버 간 세션 공유 ([Redis-Session.md](../../Redis/Redis-Session.md))
- **리더보드·랭킹**: Sorted Set으로 실시간 순위
- **Rate Limiting**: 카운터로 API 호출 제한
- **Pub/Sub·큐**: 실시간 메시징 ([Redis-PubSub.md](../../Redis/Redis-PubSub.md))

## 관련 문서

- [Cache-개념.md](../../Cache/Cache-개념.md) — 캐시 전략·장애 패턴(Stampede, Penetration 등) 일반론
- [1)-Redis-개념.md](../../Redis/1\)-Redis-개념.md) — Redis 엔진 자체
- [Redis-Cluster.md](../../Redis/Redis-Cluster.md) — 클러스터(샤딩) 동작 원리
- [14)-Redis-라이선스.md](../../Redis/14\)-Redis-라이선스.md) — Redis→Valkey 라이선스 배경
- [11)-Redis-운영시-주의할-점.md](../../Redis/11\)-Redis-운영시-주의할-점.md) — 운영 함정
- [RDS-기본.md](../RDS/RDS-기본.md) — 같은 관리형 패턴의 관계형 DB 버전

## 출처

- [Amazon ElastiCache Documentation](https://docs.aws.amazon.com/elasticache/)
- [ElastiCache for Valkey](https://aws.amazon.com/elasticache/valkey/)
- [Amazon MemoryDB](https://aws.amazon.com/memorydb/)
