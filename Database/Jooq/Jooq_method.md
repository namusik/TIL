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
// 0개 검색되면 NULL 반환.
// 1개 이상의 record를 반환하면, TooManyRowsException 발생
R fetchOne();

// 무조건 한개 반환하는 것을 알 때 사용. 
// 0개 혹은 1개 이상이 검색되면 NoDataFoundException/TooManyRowsException 발생
// fetchOne() 보다 더 엄격한 조건이다.
R fetchSingle();
```
