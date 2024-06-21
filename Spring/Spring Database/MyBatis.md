# MyBatis

https://mybatis.org/mybatis-3/ko/index.html


## 특징
- JdbcTemplate 보다 더 많은 기능을 제공하는 SQL Mapper
- SQL을 XML에 편리하게 작성 가능
- 동적 쿼리를 편히하게 작성 가능

## 설정법
~~~groovy
implementation 'org.mybatis.spring.boot:mybatis-spring-boot-starter:2.2.0'
~~~

## properties 추가
~~~properties
mybatis.type-aliases-package=hello.example.domain
~~~
- 해당 패키지와 하위 패키지 내의 모든 클래스에 alias를 자동으로 생성해줌
- mapper XML파일의 resultType, parameterType 부분에 패키지 정보를 생략하고 클래스명만 적어줄 수 있음.

```properties
mybatis.configuration.map-underscore-to-camel-case=true
// DB의 언더바를 카멜로 자동 변경

logging.level.hello.itemservice.repository.mybatis=trace
// MyBatis 쿼리 로그 확인.
```

## @Mapper
- 매핑 XML을 호출해주는 매퍼 인터페이스
- @Mapper 애노테이션을 붙여야 함

### 동작원리
![mybatis](../../images/DB/mybatismapper.png)
- mapper interface의 함수를 호출하면 xml 파일의 SQL을 실행

역시 동적 프록시 기술이 사용됨.
@Transactional과 비슷.

## XML 파일
- src/main/resources 아래 @Mapper와 같은 패키지 아래 있어야 자동으로 인식됨

~~~xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN" "http://mybatis.org/dtd/mybatis-3-mapper.dtd">
<mapper namespace="매퍼 인터페이스의 패키지 경로(java 이후부터)">
~~~


```properties
mybatis.mapper-locations=classpath:mappers/*.xml
```
- 만약 XML 파일을 다른 경로에 두고싶다면 해당 설정을 추가해주자
- MyBatis에게 XML 파일을 위의 경로에서 찾도록 지정해주는 설정