# MySQL Procedure 조회

## 프로시저 목록 조회

```sql
SHOW PROCEDURE STATUS WHERE Db = '데이터베이스명';
```

## 특정 프로시저 내용(코드) 확인

```sql
SHOW CREATE PROCEDURE 프로시저명;
```

## 이름으로 검색

```sql
SHOW PROCEDURE STATUS WHERE Name LIKE '%키워드%';
```
