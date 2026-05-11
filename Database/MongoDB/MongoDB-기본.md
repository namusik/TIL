# MongoDB 기본

> 최종 업데이트: 2026-04-23 | 기준: MongoDB 7.x

## 개념

**MongoDB**는 **JSON 형태의 문서(Document)** 를 저장하는 **NoSQL Document Database**. 관계형 DB(MySQL/PostgreSQL)가 "표(table) + 행(row)"을 쓴다면, MongoDB는 **"컬렉션(collection) + 문서(document)"** 구조를 쓴다. 스키마가 유연해서 개발 속도가 빠르고, 수평 확장(샤딩)에 유리하다.

> 비유하자면 관계형 DB가 **엑셀 시트(행·열 정해진)** 라면, MongoDB는 **JSON 파일들을 모아놓은 폴더**. 한 문서에 원하는 필드를 자유롭게 넣을 수 있고, 문서마다 구조가 달라도 된다.

## 배경/역사

- **2007** — **10gen** 이라는 회사가 PaaS용 DB로 개발 시작 (DoubleClick 출신 엔지니어들)
- **2009** — MongoDB 1.0 오픈소스 공개. 이름은 "humongous(거대한)"에서 유래
- **2013** — 회사명을 **MongoDB Inc.** 로 변경
- **2017** — 뉴욕 증시 상장 (NASDAQ: MDB)
- **2018** — **트랜잭션 지원**(4.0), 단일 문서 한계 극복
- **2018** — 라이선스를 AGPL → **SSPL** (Server Side Public License)로 변경, AWS와의 긴장
- **현재** — **MongoDB Atlas** 라는 완전관리형 클라우드 서비스가 주력

## 왜 쓰는가 (NoSQL vs SQL)

| 상황 | MongoDB 유리 | RDB 유리 |
|------|-------------|---------|
| 스키마 변화 잦음 | **O** | X (DDL 필요) |
| 중첩 JSON 자연스러움 | **O** | X (조인·정규화 필요) |
| 수평 확장 (샤딩) | **O** (기본 기능) | 수동 구현 |
| 복잡한 조인 | X | **O** |
| 엄격한 ACID | 부분 지원 | **O** |
| 다중 테이블 트랜잭션 | 제한적 | **O** |
| 리포트/분석 쿼리 | 약함 | **O** |

> 실무 원칙: **"정해진 스키마 + 정합성 중요"면 RDB, "빠른 반복 개발 + 스키마 유연성"이 우선이면 MongoDB**.

## 데이터 구조

관계형 DB의 용어와 1:1 대응.

| 관계형 DB | MongoDB |
|----------|---------|
| Database | Database |
| Table | **Collection** |
| Row | **Document** |
| Column | **Field** |
| Primary Key | **`_id`** (자동 생성, ObjectId) |
| Join | `$lookup` (제한적) |
| Foreign Key | 관례상 `_id` 참조 (제약은 강제 안 됨) |

### 예시 문서

```json
{
  "_id": ObjectId("6541a8b3e4a7..."),
  "name": "wsnam",
  "email": "wsnam@mz.co.kr",
  "profile": {
    "title": "백엔드 개발자",
    "skills": ["Java", "Spring", "AWS"]
  },
  "createdAt": ISODate("2026-04-23T10:00:00Z")
}
```

- 한 문서 안에 **중첩 객체·배열** 자유롭게 포함 가능
- 같은 컬렉션의 다른 문서가 **다른 필드를 가져도 됨**

## BSON — 내부 저장 포맷

MongoDB는 JSON이 아니라 **BSON(Binary JSON)** 으로 저장한다.

| 항목 | JSON | BSON |
|------|------|------|
| 형식 | 텍스트 | **바이너리** |
| 타입 | 문자열/숫자/bool/null/객체/배열 | + `ObjectId`, `Date`, `Binary`, `Decimal128` 등 |
| 크기 효율 | 보통 | 더 효율적 |
| 파싱 속도 | 느림 | 빠름 |

> JSON을 입출력 시엔 사람이 보기 편한 형식으로 변환. 내부 저장은 바이너리라 빠름.

## CRUD 기본

### `mongosh` (MongoDB Shell)

```javascript
// 삽입
db.users.insertOne({ name: "wsnam", age: 30 });
db.users.insertMany([{ name: "alice" }, { name: "bob" }]);

// 조회
db.users.find();                                  // 전체
db.users.find({ age: { $gte: 20 } });             // age >= 20
db.users.findOne({ name: "wsnam" });

// 수정
db.users.updateOne({ name: "wsnam" }, { $set: { age: 31 } });
db.users.updateMany({ age: { $lt: 20 } }, { $set: { minor: true } });

// 삭제
db.users.deleteOne({ name: "wsnam" });
db.users.deleteMany({ age: { $lt: 10 } });
```

### 주요 쿼리 연산자

| 연산자 | 의미 |
|-------|------|
| `$eq`, `$ne` | 같다 / 다르다 |
| `$gt`, `$gte`, `$lt`, `$lte` | 비교 |
| `$in`, `$nin` | 포함 / 미포함 |
| `$and`, `$or`, `$not` | 논리 |
| `$exists` | 필드 존재 여부 |
| `$regex` | 정규식 |
| `$elemMatch` | 배열 원소 조건 |

## 인덱스

RDB와 개념 동일. 자주 조회하는 필드에 인덱스 생성.

```javascript
db.users.createIndex({ email: 1 }, { unique: true });    // 단일, 고유
db.users.createIndex({ createdAt: -1 });                   // 내림차순
db.users.createIndex({ name: 1, age: -1 });                // 복합
db.users.createIndex({ "profile.skills": 1 });             // 중첩 필드
db.users.createIndex({ content: "text" });                 // 풀텍스트
db.users.createIndex({ location: "2dsphere" });            // 지리 공간
```

| 인덱스 종류 | 용도 |
|-----------|------|
| Single Field | 단일 필드 |
| Compound | 여러 필드 조합 |
| Multikey | 배열 필드 |
| Text | 전문 검색 |
| **2dsphere** | 지리 좌표 |
| **TTL** | 시간 지나면 자동 삭제 (세션·로그 등) |
| Partial | 조건 만족하는 문서만 |

## 스키마 유연성

같은 컬렉션에서 **문서마다 다른 필드**를 가져도 된다.

```json
{ "_id": 1, "name": "A", "tags": ["java"] }
{ "_id": 2, "name": "B", "price": 100 }
{ "_id": 3, "name": "C", "profile": { "city": "Seoul" } }
```

### 대신 검증은 직접

- **Schema Validation** (4.0+) — JSON Schema로 선택적 강제 가능
- **애플리케이션 레벨** 검증이 기본 — Spring Data MongoDB의 DTO, Mongoose 스키마 등
- 유연성의 비용 = **쓰기 시 스키마를 지키는 규율**이 필요

## Aggregation Framework

복잡한 집계·변환은 **파이프라인** 으로. SQL의 `GROUP BY`·`JOIN`을 대체.

```javascript
db.orders.aggregate([
  { $match: { status: "paid" } },                  // WHERE
  { $group: { _id: "$userId", total: { $sum: "$amount" } } }, // GROUP BY
  { $sort: { total: -1 } },                        // ORDER BY
  { $limit: 10 }                                    // LIMIT
]);
```

| 스테이지 | 역할 |
|---------|------|
| `$match` | 필터링 (WHERE) |
| `$group` | 그룹화 (GROUP BY) |
| `$sort` | 정렬 |
| `$limit` / `$skip` | 페이지네이션 |
| `$project` | 필드 선택/변환 (SELECT) |
| `$lookup` | **조인** (다른 컬렉션과) |
| `$unwind` | 배열을 개별 문서로 펼침 |
| `$addFields` | 계산 필드 추가 |

## 트랜잭션

| 버전 | 지원 범위 |
|------|---------|
| ~3.x | **단일 문서 원자성**만 |
| 4.0+ | **복제셋 다중 문서 트랜잭션** |
| 4.2+ | **샤딩 클러스터 트랜잭션** |

```javascript
const session = db.getMongo().startSession();
session.startTransaction();
try {
    db.accounts.updateOne({ _id: 1 }, { $inc: { balance: -100 } }, { session });
    db.accounts.updateOne({ _id: 2 }, { $inc: { balance: +100 } }, { session });
    session.commitTransaction();
} catch (e) {
    session.abortTransaction();
}
```

> MongoDB 설계 철학은 "**한 문서로 원자성을 해결**하라" — 트랜잭션은 있지만 성능 비용이 있으므로, 스키마 설계 시 **연관 데이터를 한 문서에 임베드**하는 걸 선호.

## 복제 (Replica Set) & 샤딩 (Sharding)

MongoDB의 두 축.

### Replica Set (고가용성)

```
  ┌─────────┐     복제     ┌──────────┐
  │ Primary │ ───────────► │ Secondary│
  │ (쓰기)   │              │ (읽기)    │
  └─────────┘              └──────────┘
       │                        
       │    장애 시 자동 승격 (Failover)
       ▼
  ┌──────────┐
  │ Secondary│ ← 새 Primary
  └──────────┘
```

- 최소 3개 노드 권장 (Primary 1 + Secondary 2, 또는 Primary 1 + Secondary 1 + Arbiter 1)
- **자동 페일오버** — Primary 장애 시 Secondary 중 하나가 승격
- Read Preference로 읽기를 Secondary로 분산 가능

### Sharding (수평 확장)

```
  Shard Key 기준으로 데이터 분산

  shard1 [users_id 1~10000]
  shard2 [users_id 10001~20000]
  shard3 [users_id 20001~30000]
        │
  라우팅: mongos (쿼리 라우터)
        │
     애플리케이션
```

- **샤드 키** 선택이 성능에 결정적 — 핫스팟 피하기
- 각 샤드가 다시 Replica Set이 되어 HA 보장

## MongoDB Atlas

MongoDB Inc.의 **완전관리형 클라우드 서비스**. 요즘 실무 운영은 거의 Atlas.

- AWS/GCP/Azure 위에서 MongoDB를 자동 운영
- 백업·모니터링·샤딩·보안 자동
- 무료 티어(M0) 512MB 존재
- 경쟁 관계: **AWS DocumentDB** (MongoDB API 호환 서비스지만 내부는 다름)

## Spring Data MongoDB

```groovy
// build.gradle
implementation 'org.springframework.boot:spring-boot-starter-data-mongodb'
```

```java
@Document(collection = "users")
public class User {
    @Id
    private String id;
    private String name;
    private int age;
    // ...
}

public interface UserRepository extends MongoRepository<User, String> {
    List<User> findByNameContaining(String keyword);
    List<User> findByAgeGreaterThan(int age);
}
```

```properties
spring.data.mongodb.uri=mongodb://localhost:27017/mydb
spring.data.mongodb.auto-index-creation=true
```

## 다른 NoSQL/DB와 비교

| 항목 | **MongoDB** | DynamoDB | PostgreSQL | Redis |
|------|-------------|----------|------------|-------|
| 타입 | Document | Key-Value/Document | Relational | In-memory |
| 쿼리 | 풍부 | 제한적 (기본 키 중심) | SQL (최강) | 제한적 |
| 스키마 | 유연 | 유연 | 엄격 | 스키마리스 |
| 트랜잭션 | 부분 지원 | 부분 지원 | **완전 지원** | 제한적 |
| 조인 | `$lookup` | 불가 | **완전 지원** | 불가 |
| JSON 저장 | **네이티브** | O | JSONB 컬럼 | O |
| 관리형 서비스 | Atlas | **AWS 네이티브** | RDS 등 | ElastiCache 등 |

## 언제 MongoDB를 선택하나

### 잘 맞는 경우

- **빠른 프로토타이핑** — 스키마가 계속 바뀌는 초기 개발
- **콘텐츠 관리** — 게시글마다 구조가 다른 CMS
- **IoT / 로그** — 대량 시계열, 다양한 센서 데이터
- **카탈로그** — 상품마다 속성이 다른 쇼핑몰
- **캐시/세션** — TTL 인덱스로 자동 만료
- **지리 공간 앱** — 2dsphere 인덱스

### 안 맞는 경우

- **복잡한 다중 테이블 트랜잭션** — RDB가 훨씬 나음
- **엄격한 관계·정합성** — 외래 키 제약이 중요한 재무/회계
- **복잡한 분석 쿼리** — 데이터 웨어하우스(BigQuery, Snowflake)
- **강력한 리포팅** — SQL 생태계가 유리

## 백엔드 개발자 실무 포인트

- **`_id`는 자동** — 직접 지정도 가능하지만, 기본 `ObjectId`는 **시간 정보 포함** → 정렬 시 시간순 정렬 효과
- **중첩 vs 참조** — 같이 자주 읽는 데이터는 **중첩(embed)**, 자주 바뀌거나 크기 큰 데이터는 **참조(reference)**
- **인덱스 설계가 성능의 80%** — `explain()` 으로 쿼리 플랜 확인
- **Cursor Pagination** — `skip/limit`은 큰 offset에서 느림 → `_id` 기반 cursor 권장
- **Connection Pool** — Spring Data MongoDB 기본값 괜찮지만 트래픽 많으면 `minPoolSize`/`maxPoolSize` 튜닝
- **트랜잭션은 최소로** — MongoDB 철학은 "한 문서 안에서 원자성 해결"
- **Atlas 무료 티어** — 개인 프로젝트·프로토타입에 충분

## 관련 문서

- [../데이터베이스-이론/](../데이터베이스-이론/)
- [../데이터베이스-종류/](../데이터베이스-종류/)
- [../MySQL/](../MySQL/)
