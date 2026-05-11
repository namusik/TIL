# JDBC 옵션 

## rewriteBatchedStatements=true

```gradle
jdbc:mysql://host:3306/db?rewriteBatchedStatements=true
```

- JDBC 드라이버(= MySQL Connector/J)가 클라이언트 쪽에서 “배치에 쌓인 여러 개의 INSERT 문”을 하나의 multi-row INSERT SQL로 “문자열 수준에서 다시 조합해서” 서버로 보내게 만드는 옵션
- JDBC 드라이버 내부에서 일어나기 때문에, DB 서버(MySQL/Aurora)는 이 내부 동작을 전혀 모른다.


### 동작 상세

#### 옵션이 없을 때: batch = “INSERT N개 붙여서 보내기”일 뿐

```java
String sql = "INSERT INTO user (id, name) VALUES (?, ?)";
PreparedStatement ps = conn.prepareStatement(sql);

for (User u : users) {
    ps.setInt(1, u.getId());
    ps.setString(2, u.getName());
    ps.addBatch();     // 배치에 1건 추가
}

ps.executeBatch();     // 배치 실행
``` 
1. ps.addBatch() 호출할 때마다
   1. 드라이버 내부 배열/list에 파라미터 세트(?, ?) 값이 한 건씩 쌓임
   2. SQL 템플릿은 동일: INSERT INTO user (id, name) VALUES (?, ?)
2. ps.executeBatch() 호출 시
   1. 드라이버는 이 파라미터 세트를 하나씩 꺼내면서 서버에 보낼 실제 SQL/패킷을 N번 만듦.
   2. 프로토콜 관점에서 보면: 패킷 내용은 대략
      1. “PreparedStatement #X 실행, 파라미터는 (1, ‘A’)”
      2. “PreparedStatement #X 실행, 파라미터는 (2, ‘B’)”
      3. 	… 이런 식으로 N번
   3. **MySQL/Aurora 입장에서는 INSERT 문을 N번 받은 것과 동일한 상태**
      1. 내부 처리는 완전히 “INSERT 1건씩” 처리.

즉, 이 때의 “batch”는 네트워크 패킷을 어느 정도 묶어서 보내는 최적화는 있을 수 있지만, SQL 레벨로 보면 여전히 single-row INSERT N번


#### 옵션을 켰을 때: 드라이버가 “문장 재작성(rewrite)”을 수행

1. executeBatch에서 “문자열 조합 + 프로토콜 조합”이 달라짐
2. ps.executeBatch()가 호출되는 시점에:
   1. 드라이버는 내부적으로 이런 판단을 함.
   2. 이 PreparedStatement가 INSERT, UPDATE, DELETE 등 “**rewrite 대상이 되는 문장 타입인지**”를 먼저 체크
      1. (SELECT 같은 건 rewrite 대상 아님)
   3. INSERT 배치라고 판단되면, 기존처럼 “N개의 실행 요청을 개별 패킷으로 만들지” 않고, 하나의 큰 SQL로 합치는 전략을 사용
3. 그 결과, MySQL 서버로 가는 실제 쿼리는 이런 형태가 된다.
   1. INSERT INTO user (id, name) VALUES (1, 'A'), (2, 'B'), (3, 'C')
   2. 드라이버 안에서 문자열을 붙여 만든 결과입니다.

### 실무 사용 tip

- JPA/Hibernate + MySQL에서 batch insert 쓸 때 hibernate.jdbc.batch_size로 batch 세트 만들고 JDBC URL에 rewriteBatchedStatements=true 넣으면 “코드 상 persist 반복 → 내부에서 batch → 드라이버가 multi-row INSERT로 rewrite” 흐름이 구성됨.


