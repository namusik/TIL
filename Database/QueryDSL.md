# QueryDSL

## 의존성추가
~~~groovy
implementation 'com.querydsl:querydsl-jpa'
annotationProcessor "com.querydsl:querydsl-apt:${dependencyManagement.importedProperties['querydsl.version']}:jpa"
annotationProcessor "jakarta.annotation:jakarta.annotation-api"
annotationProcessor "jakarta.persistence:jakarta.persistence-api"
~~~

스프링부트 3.0버전에선
~~~groovy
// Querydsl 추가
implementation 'com.querydsl:querydsl-jpa:5.0.0:jakarta'
annotationProcessor "com.querydsl:querydsl-apt:${dependencyManagement.importedProperties['querydsl.version']}:jakarta"
annotationProcessor "jakarta.annotation:jakarta.annotation-api"
annotationProcessor "jakarta.persistence:jakarta.persistence-api"
~~~

clean 코드 추가
~~~groovy
delete file('src/main/generated')
~~~

## Gradle 빌드 시
~~~sh
./gradlew clean compileJava
~~~

## JpaQueryFactory
QueryDSL을 만들기 위해 필요.
그리고 JPQL로 변환해주기 때문에, EntityManager 필요.

## BooleanExpression

QueryDSL에서 사용하는 동적쿼리 클래스