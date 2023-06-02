# JdbcTemplate

## 설명
JDBC를 편리하게 사용할 수 있도록 도와주는 라이브러리 

## 사용법
~~~gradle
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

