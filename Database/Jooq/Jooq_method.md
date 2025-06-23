# Jooq method

## .onDuplicateKeyIgnore()
중복 키 충돌이 발생했을 때 무시하도록 설정합니다. 이는 중복 키 엔트리를 추가하지 않고 무시하라는 의미입니다.

## .returning()
삽입 또는 업데이트 작업이 실행된 후 결과를 반환하도록 설정

## .fetchOne()
returning()의 결과는 .fetchOne() 메서드를 통해 가져옴.

## select 
```java
Record record = create.select()
                      .from(BOOK)
                      .join(AUTHOR).on(BOOK.AUTHOR_ID.eq(AUTHOR.ID))
                      .where(BOOK.ID.eq(1))
                      .fetchOne();

BookRecord book = record.into(BOOK);
```
- select()를 하면 Record 타입으로 반환이 됨.
- 자바 객체로 전환하려면 into()를 사용

### fetch() 종류 
```java
// 최대 1개 혹은 0개 반환한다고 예측할 때 사용. 
// 조회 결과가 최대 한 건일 것으로 예상되는 쿼리에 사용
// 0개 검색되면 NULL 반환.
// 1개 이상의 record를 반환하면, TooManyRowsException 발생
R fetchOne();

// 무조건 한개 반환하는 것을 알 때 사용. 
// 0개 혹은 1개 이상이 검색되면 NoDataFoundException/TooManyRowsException 발생
// fetchOne() 보다 더 엄격한 조건이다.
R fetchSingle();
```
•	fetchOne()
	•	0건 → null
	•	1건 → 레코드
	•	2건 이상 → TooManyRowsException
•	fetchOptional()
	•	0건 → Optional.empty()
	•	1건 → Optional.of(...)
	•	2건 이상 → TooManyRowsException
•	fetchSingle() (jOOQ 3.16부터 다양한 오버로드 제공)
	•	0건 → NoDataFoundException
	•	1건 → 레코드 반환 (절대 null 아님)
	•	2건 이상 → TooManyRowsException
- fetch()
  - List<> 반환
  - 0건 -> 빈 리스트
  - 1건 -> 크기 1 리스트
  - N건 -> 크기 N 리스트
  - 절대 null 반환하지 않음.

## fetchGroups()
```java
fetchGroups(
  테이블.컬럼명,  // key  
  테이블.컬럼명   // value
)
```
- 내부적으로 2단계로 동작함
  - 먼저 JDBC를 통해 쿼리를 실행하고 모든 결과를 Result<Record> 형태로 읽어옴.
  - fetchGroups(Field<K> key, Field<V> value) 호출 시 내부적으로 Result<Record>의 intoGroups(key, value) 메서드를 호출하여, Java 컬렉션을 사용해 레코드들을 그룹핑
  - Java 레벨에서 모든 레코드를 메모리에 올려 반복 처리하기 때문에, 대량 데이터 처리 시 메모리 및 성능에 유의해야함.