# JdbcTemplate

## 설명
- SQLMaper 데이터 접근 기술
- JDBC를 편리하게 사용할 수 있도록 도와주는 라이브러리 
- 개발자는 SQL만 작성하면 해당 SQL의 결과를 Java 객체로 매핑해준다.
- 템플릿 콜백 패턴을 사용해서 반복처리를 대신 처리해준다.

## 사용법
~~~groovy
implementation 'org.springframework.boot:spring-boot-starter-jdbc'
~~~
안에 같이 들어있음. 

## 자주 사용되는 클래스

1. JdbcTemplate
~~~java
private final JdbcTemplate template;

public SampleRepository(DataSource dataSource) {
    this.template = new JdbcTemplate(dataSource);
    //생성자를 만들 때, DataSource 필요
}
~~~
보통 datasource를 주입받은 repository의 생성자 안에서 JdbcTemplate을 생성한다. 

2. KeyHolder

데이터를 저장할 때, PK 값을 데이터베이스가 생성하는 경우, 서버는 INSERT가 완료되어야 PK 값을 알 수 있다. 이 때, Keyholder를 사용해서 생성된 PK 값을 가져온다. 

3. NamedParameterJdbcTemplate

sq 파라미터를 지정해서 값을 넣도록 해줌. 

4. BeanPropertyRowMapper

select 한 결과를 자바 객체에 자동으로 넣어줌.

~~~java
BeanPropertyRowMapper.newInstance(객체명.class)
~~~

5. SimpleJdbcInsert

INSERT SQL 대신 작성해줌.
