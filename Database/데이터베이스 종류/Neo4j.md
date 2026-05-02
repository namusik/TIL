# Neo4j (Graph Database)

> 최종 업데이트: 2026-04-30 | Neo4j 5.x / Cypher 25 / GQL ISO 표준 기준

## 개념

Neo4j는 **데이터를 표(테이블)가 아닌 그래프(노드 + 관계)로 저장하는 데이터베이스**다. NoSQL 계열 중에서도 "그래프 DB" 카테고리의 사실상 표준이며, "관계 자체를 일등 시민(first-class citizen)으로 다룬다"는 게 핵심.

> 비유: 일반 RDB가 "엑셀 표"라면, Neo4j는 "마인드맵"이나 "지하철 노선도". 점(노드)과 선(관계)으로 세상을 표현한다.

이름의 **"4j"는 "for Java"**의 줄임 — 자바로 개발됐기 때문.

## 배경/역사

- **2000년경** 스웨덴의 Emil Eifrem이 EU 미디어 메타데이터 프로젝트에서 RDB의 한계(JOIN 비용)를 절감하고 그래프 모델 구상
- **2007년** Neo Technology(현 Neo4j Inc.) 설립, Neo4j 1.0 출시 — 자바 임베디드 라이브러리로 시작
- **2010년** AGPL 오픈소스 공개, 첫 상용 버전
- **2011년** Cypher 쿼리 언어 발표 — SQL의 그래프 버전을 표방
- **2015년** Cypher를 오픈소스화 (openCypher) → 다른 DB도 채택
- **2024년** **GQL (Graph Query Language) ISO/IEC 39075 표준 확정** — Cypher가 모태. SQL의 그래프판 표준이 공식 등장
- **2025~** Neo4j 5.x LTS, AuraDB(클라우드 매니지드), GraphRAG·LLM 통합이 주력 마케팅

> Eifrem 어록: "관계는 데이터의 본질인데, RDB에서는 JOIN이라는 비용으로 처리된다. 그래프 DB에서는 관계가 데이터 그 자체다."

## 핵심 개념 — 4가지 구성 요소

```
(:Person {name:"nam", age:30}) -[:WORKS_AT {since:2023}]-> (:Company {name:"MZ"})
       │           │                  │           │                │      │
      Label    Property            Type      Property            Label  Property
       └─────── Node ──────┘                                  └─── Node ──┘
                              └─── Relationship ───┘
```

| 요소 | 설명 | RDB 비유 |
|---|---|---|
| **Node** | 개체 (사람, 회사, 상품 등) | Row |
| **Label** | 노드의 분류 (`:Person`) — 한 노드에 여러 라벨 가능 | Table 이름 |
| **Relationship** | 노드 간 연결 (`-[:WORKS_AT]->`) — 방향 + 타입 필수 | JOIN을 미리 저장한 것 |
| **Property** | 키-값 속성 (`{name:"nam"}`) — 노드/관계 모두 가질 수 있음 | Column |

## RDB vs Neo4j — 같은 데이터 다른 방식

**시나리오: "nam의 친구의 친구의 친구를 모두 찾기"**

### RDB (PostgreSQL)
```sql
SELECT f3.name FROM users u
JOIN friendships f1 ON u.id = f1.user_id
JOIN friendships f2 ON f1.friend_id = f2.user_id
JOIN friendships f3 ON f2.friend_id = f3.user_id
WHERE u.name = 'nam';
```
→ JOIN 3번. 데이터·깊이가 늘면 **기하급수적으로 느려짐** (인덱스 룩업 비용 누적).

### Neo4j (Cypher)
```cypher
MATCH (n:Person {name:'nam'})-[:FRIEND*3]->(friend)
RETURN friend.name
```
→ 그래프 순회 한 번. **인접 리스트가 포인터처럼 저장**되어 있어 데이터 양에 거의 영향 없음.

| 항목 | RDB | Neo4j |
|---|---|---|
| 데이터 모델 | 테이블 + 외래키 | 노드 + 관계 |
| 깊은 관계 쿼리 | 느림 (JOIN 누적) | 빠름 (포인터 순회) |
| 단순 CRUD/집계 | 빠름 | 상대적으로 느림 |
| 스키마 | 엄격 | 유연 (라벨/속성 자유) |
| 트랜잭션 | ACID | ACID |
| 쿼리 언어 | SQL | Cypher (→ GQL) |
| 확장 | 수직 우선, 샤딩 어려움 | Causal Clustering, Fabric |

> **언제 Neo4j를 쓰나**: 관계가 데이터의 본질이고, "몇 단계 떨어진 관계 탐색"이 자주 일어날 때. 그렇지 않으면 RDB가 거의 항상 더 단순하고 빠르다.

## Cypher — 쿼리 언어

Neo4j 전용 쿼리 언어. **ASCII 아트로 그래프 패턴을 그리듯** 쓰는 게 특징. 2024년 ISO 표준 GQL의 모태.

### 노드/관계 생성

```cypher
CREATE (n:Person {name: 'nam', age: 30})

MATCH (a:Person {name:'nam'}), (b:Company {name:'MZ'})
CREATE (a)-[:WORKS_AT {since: 2023}]->(b)
```

### 단순 조회

```cypher
// nam이 다니는 회사
MATCH (p:Person {name:'nam'})-[:WORKS_AT]->(c:Company)
RETURN c.name
```

### 가변 길이 경로

```cypher
// 1~3단계 떨어진 친구
MATCH (me:Person {name:'nam'})-[:FRIEND*1..3]->(f)
RETURN DISTINCT f.name
```

`*1..3`이 "관계를 1~3번 따라가라"는 뜻. RDB로는 표현 자체가 까다로운 패턴.

### 추천 쿼리 예

```cypher
// "내 친구들이 좋아하는데 나는 안 본 영화" 추천
MATCH (me:Person {name:'nam'})-[:FRIEND]->(friend)-[:LIKES]->(movie:Movie)
WHERE NOT (me)-[:WATCHED]->(movie)
RETURN movie.title, count(*) AS score
ORDER BY score DESC
LIMIT 10
```

### 최단 경로

```cypher
// 두 사람 사이 최단 인맥 경로 (LinkedIn 스타일)
MATCH path = shortestPath(
  (a:Person {name:'nam'})-[:FRIEND*]-(b:Person {name:'kim'})
)
RETURN path
```

### 업데이트/삭제

```cypher
// 속성 추가
MATCH (p:Person {name:'nam'}) SET p.title = 'Senior'

// 노드 삭제 (관계까지 함께)
MATCH (p:Person {name:'nam'}) DETACH DELETE p
```

## 데이터 모델 설계 팁

| 결정 | 가이드라인 |
|---|---|
| 무엇을 노드로? | "조회의 출발점이 되는 개체" |
| 무엇을 속성으로? | "그 개체에 종속된 단순 값" |
| 무엇을 관계로? | "두 개체를 잇는 의미 있는 연결, 그리고 시간/가중치 등 메타데이터가 붙는 것" |
| 관계 vs 속성? | 자주 쿼리 출발점이 되면 관계, 단순 데이터면 속성 |

> 예: `address`가 단순 문자열이면 `Person.address` 속성. 그러나 "같은 주소에 사는 사람"을 자주 찾는다면 `(Person)-[:LIVES_AT]->(Address)` 노드+관계로 모델링.

## 사용 사례

| 분야 | 사례 |
|---|---|
| 소셜 네트워크 | LinkedIn 인맥 추천, Facebook 친구 추천 |
| 추천 엔진 | 넷플릭스·이커머스 "이 상품 본 사람이 본 상품" |
| 사기 탐지 | 카드사 — "동일 IP/디바이스로 N개 계정" 패턴 탐지 |
| 지식 그래프 | Google Knowledge Graph, Wikipedia 데이터 연결 |
| 권한/조직도 | "이 사용자가 접근 가능한 모든 리소스" 권한 계산 |
| 네트워크/IT 인프라 | 서버·네트워크 토폴로지, 의존성 분석 |
| 약물·논문 분석 | 단백질 상호작용, 인용 네트워크 |
| **GraphRAG (LLM)** | 문서 청크를 그래프로 연결, RAG 정확도 향상 — Neo4j가 2024~2025 강력 푸시 중 |

## 다른 그래프 DB와 비교

| DB | 특징 |
|---|---|
| **Neo4j** | 가장 성숙·표준. Cypher. 커뮤니티 무료 + 엔터프라이즈 유료 |
| Amazon Neptune | AWS 매니지드. Gremlin/SPARQL 지원 |
| ArangoDB | 멀티모델 (그래프 + 문서 + KV) |
| JanusGraph | 분산 처리, 빅데이터 친화 (HBase·Cassandra 백엔드) |
| TigerGraph | 대규모 성능 강점, MPP 아키텍처 |
| Memgraph | Cypher 호환, 인메모리 고성능 (실시간 분석) |
| Dgraph | GraphQL 네이티브 |

## Spring Boot 연동 — Spring Data Neo4j

JPA처럼 리포지토리 인터페이스 정의로 사용 가능.

```java
@Node("Person")
public class Person {
    @Id @GeneratedValue private Long id;
    private String name;

    @Relationship(type = "FRIEND")
    private Set<Person> friends;

    @Relationship(type = "WORKS_AT", direction = OUTGOING)
    private Company company;
}
```

```java
public interface PersonRepository extends Neo4jRepository<Person, Long> {

    Optional<Person> findByName(String name);

    @Query("""
        MATCH (p:Person {name:$name})-[:FRIEND*1..3]->(f)
        RETURN DISTINCT f
    """)
    List<Person> findFriendsWithinDepth(String name);
}
```

```yaml
# application.yml
spring:
  neo4j:
    uri: bolt://localhost:7687
    authentication:
      username: neo4j
      password: ${NEO4J_PASSWORD}
```

> 통신 프로토콜은 **Bolt**(Neo4j 자체 프로토콜, 7687 포트). HTTP API도 있지만 성능상 Bolt가 권장.

## 아키텍처 / 운영

```
[애플리케이션]
    │ Bolt (7687)
    ▼
[Neo4j 인스턴스]
    │
    ├─ Native Graph Storage (인접 리스트, 포인터 기반)
    ├─ Page Cache (메모리)
    ├─ Transaction Log
    └─ Index (B-Tree, Range, Text, Point, Vector)
```

- **Native Graph Storage**: 노드와 관계를 고정 크기 레코드로 저장하고 서로 포인터로 연결 → "관계 한 단계 따라가기"가 O(1)
- **Causal Clustering** (Enterprise): 분산 클러스터로 HA·읽기 확장
- **Vector Index** (5.x): 임베딩 저장·유사도 검색 지원 → GraphRAG 수요 대응

## 단점 / 주의사항

| 단점 | 설명 |
|---|---|
| 표 형태 데이터에 부적합 | 단순 CRUD·리포팅·집계는 RDB가 빠르고 단순 |
| 운영 노하우 부족 | 백업·HA·튜닝 사례가 RDB 대비 적음 |
| 라이선스 | 커뮤니티는 단일 노드만, 클러스터링은 엔터프라이즈(유료) |
| 메모리 사용량 | 그래프 전체를 메모리에 올리려는 경향 — 페이지 캐시 충분히 잡아야 |
| 학습 곡선 | Cypher와 그래프 사고방식 진입 장벽 |
| Bolt 라이브러리 의존 | 클라이언트마다 Neo4j 드라이버 필요 |

## 흔한 함정

### 1. 무차별 가변 깊이 쿼리

```cypher
MATCH (a)-[:FRIEND*]-(b) RETURN b   ← 깊이 무제한, 폭주 가능
```

→ 항상 상한 지정: `[:FRIEND*1..5]`. 안 그러면 그래프 폭발로 메모리 터짐.

### 2. 인덱스 없이 시작 노드 검색

```cypher
MATCH (p:Person {name:'nam'})...
```

`name`에 인덱스 없으면 라벨 전체 스캔.

```cypher
CREATE INDEX person_name FOR (p:Person) ON (p.name);
```

### 3. 양방향 관계 중복 저장

`A → B`와 `B → A`를 둘 다 저장하면 데이터가 두 배. **방향은 한쪽만 저장**하고 쿼리에서 무방향(`-[:FRIEND]-`)으로 매칭하는 게 일반적.

### 4. RDB 사고로 정규화

RDB는 정규화가 미덕이지만, 그래프 DB는 **자주 같이 조회되는 속성은 노드 안에 두는** 게 더 나음. 너무 잘게 쪼개면 관계 탐색만 늘어남.

## 보안

- **기본 포트(7687) 외부 노출 금지** — VPC 내부에서만 접근
- 기본 계정 `neo4j/neo4j` 즉시 변경
- Cypher Injection: 사용자 입력은 **반드시 파라미터 바인딩** (`$name`), 문자열 연결 금지
- Enterprise: Role-Based Access Control(RBAC)로 라벨/속성 단위 권한 가능

## 관련 문서
- [[Vector Database]] — 임베딩 검색 DB. Neo4j 5.x도 벡터 인덱스 지원해 일부 영역에서 경쟁
- [[../데이터베이스 이론/database basic]] — DB 일반 개념

## 참조
- 공식: https://neo4j.com/
- Cypher Manual: https://neo4j.com/docs/cypher-manual/
- GQL ISO 표준: https://www.iso.org/standard/76120.html
- Spring Data Neo4j: https://spring.io/projects/spring-data-neo4j
- 그래프 모델링 가이드: https://neo4j.com/developer/data-modeling/
