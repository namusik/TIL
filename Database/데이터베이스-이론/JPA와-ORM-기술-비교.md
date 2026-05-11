# JPA, Hibernate, Spring Data JPA, QueryDSL, jOOQ, MyBatis 비교

## 한눈에 보는 관계도

```
Spring Data JPA  (추상화/편의 계층)
    ↓ 내부적으로 사용
JPA              (표준 인터페이스/스펙)          MyBatis (SQL Mapper)
    ↓ 실제 구현                                    ↓
Hibernate        (구현체)                        SQL 직접 작성
    ↓                                              ↓
JDBC ──────────────────────────────────────────── JDBC
    ↓
Database

QueryDSL → JPA 위에서 동작하는 쿼리 빌더 (JPA 필요)
jOOQ     → JDBC 위에서 독립 동작하는 쿼리 빌더 (JPA 불필요)
```

---

## 핵심 차이점

### JPA vs Hibernate

- **JPA**는 스펙(인터페이스), **Hibernate**는 그 구현체
- JPA만으로는 동작하지 않음 — Hibernate, EclipseLink 등 구현체가 필요
- Hibernate는 JPA 표준 외 추가 기능 제공 (`@Formula`, `@Where`, `@BatchSize`, 2차 캐시 등)
- Spring Boot에서 JPA를 쓰면 기본 구현체가 Hibernate

### Spring Data JPA vs JPA

- **JPA**는 `EntityManager`를 직접 다루는 표준 API
- **Spring Data JPA**는 `JpaRepository` 상속만으로 CRUD를 자동 생성해주는 **Spring의 추상화 계층**
- 메서드 이름 기반 쿼리, 페이징, Auditing(`@CreatedDate` 등) 같은 편의 기능 제공
- 내부적으로 JPA(→ Hibernate)를 사용하므로 별도 기술이 아니라 **같은 스택의 상위 계층**

### QueryDSL vs jOOQ

둘 다 **타입 안전한 쿼리 빌더**지만 접근 방식이 다르다.

| | QueryDSL | jOOQ |
|---|----------|------|
| **기반** | JPA/JPQL 위에서 동작 | JDBC 위에서 독립 동작 |
| **코드 생성 소스** | JPA `@Entity` → Q클래스 | DB 스키마 → 자바 코드 |
| **쿼리 범위** | JPQL로 표현 가능한 범위 | SQL 전체 (윈도우 함수, CTE, UNION 등) |
| **영속성 컨텍스트** | JPA 영속성 컨텍스트 활용 | 없음 (ResultSet 매핑) |
| **라이선스** | 무료 | 오픈소스 DB 무료, **상용 DB(Oracle 등) 유료** |
| **유지보수** | 업데이트 느림 (Jakarta 전환 지연) | 활발한 유지보수 |

### JPA(ORM) vs MyBatis(SQL Mapper)

가장 근본적인 차이 — **객체 중심 vs SQL 중심**

| | JPA (ORM) | MyBatis (SQL Mapper) |
|---|-----------|---------------------|
| **철학** | 객체를 저장하면 SQL은 프레임워크가 생성 | 개발자가 SQL을 직접 작성, 결과를 객체에 매핑 |
| **영속성 컨텍스트** | O (1차 캐시, 변경감지, 지연로딩) | X |
| **변경 감지** | 엔티티 수정 시 자동 UPDATE | 직접 UPDATE SQL 작성 필요 |
| **복잡한 SQL** | 제한적 (JPQL 범위) | 제약 없음 (SQL 직접 작성) |
| **학습 곡선** | 높음 (영속성 컨텍스트 이해 필수) | 낮음 (SQL만 알면 됨) |
| **주 사용처** | 도메인 중심 서비스, CRUD 위주 | 금융/공공, 레거시 DB, DBA 협업 환경 |

---

## 비교표

| 구분 | JPA | Hibernate | Spring Data JPA | QueryDSL | jOOQ | MyBatis |
|------|-----|-----------|-----------------|----------|------|---------|
| **성격** | 표준 스펙 | JPA 구현체 | Spring 추상화 | 쿼리 빌더 | SQL 쿼리 빌더 | SQL Mapper |
| **ORM 여부** | O (스펙) | O (구현) | O (래핑) | X (보조) | X | X |
| **쿼리 방식** | JPQL, Criteria | JPQL, HQL | 메서드 이름, @Query | Q클래스 DSL | SQL DSL | SQL 직접 작성 |
| **동적 쿼리** | Criteria (복잡) | Criteria (복잡) | Specification (제한적) | **강력** | **강력** | XML 태그 (`<if>` 등) |
| **복잡한 SQL** | 제한적 | 제한적 | 제한적 | 제한적 | **매우 강력** | **매우 강력** |
| **영속성 컨텍스트** | O | O | O | - | X | X |
| **독립 사용** | - | 가능 | Hibernate 필요 | JPA 필요 | 독립 가능 | 독립 가능 |

---

## 실무 조합 패턴

```
간단한 CRUD      →  Spring Data JPA (JpaRepository)
동적 검색/조회    →  QueryDSL 또는 jOOQ
복잡한 통계/리포트 →  jOOQ 또는 Native SQL
SQL 중심 프로젝트  →  MyBatis 단독
```

- **Spring Data JPA + QueryDSL** — 한국 실무에서 가장 보편적인 조합
- **jOOQ** — ORM 없이 SQL 자체가 복잡한 프로젝트 (통계, DW)
- **MyBatis** — 금융/공공, 레거시 DB, 전자정부 프레임워크 기반 프로젝트
