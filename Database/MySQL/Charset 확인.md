# MySQL Charset 확인

## 서버 전체 기본 설정

```sql
SHOW VARIABLES LIKE 'character_set_%';
```

- `character_set_server` : 서버 기본 캐릭터셋
- `character_set_database` : 현재 접속한 DB의 캐릭터셋
- `character_set_client` : 클라이언트 인코딩
- `character_set_connection` : 연결 인코딩

## 특정 데이터베이스 확인

```sql
SELECT default_character_set_name 
FROM information_schema.SCHEMATA 
WHERE schema_name = '데이터베이스명';
```

## 특정 테이블 확인

```sql
SHOW CREATE TABLE 테이블명;
```

```sql
SELECT table_name, table_collation 
FROM information_schema.TABLES 
WHERE table_schema = '데이터베이스명';
```

## 특정 컬럼 확인

```sql
SELECT column_name, character_set_name, collation_name
FROM information_schema.COLUMNS
WHERE table_schema = '데이터베이스명' AND table_name = '테이블명';
```

## 참고

- MySQL은 **서버 > DB > 테이블 > 컬럼** 순으로 캐릭터셋을 개별 지정할 수 있다.
- DB는 `utf8`인데 특정 테이블이나 컬럼만 `euckr`일 수도 있다.
- ODBC 등 외부 연결 시 Charset 설정은 실제 데이터 저장 인코딩에 맞춰야 한글 깨짐이 없다.
