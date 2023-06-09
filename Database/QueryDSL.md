# QueryDSL

## 의존성추가
~~~gradle
implementation 'com.querydsl:querydsl-jpa'
annotationProcessor "com.querydsl:querydsl-apt:${dependencyManagement.importedProperties['querydsl.version']}:jpa"
annotationProcessor "jakarta.annotation:jakarta.annotation-api"
annotationProcessor "jakarta.persistence:jakarta.persistence-api"
~~~

clean 코드 추가
~~~gradle
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