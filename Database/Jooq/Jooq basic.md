# Jooq

## 특징
미리 DBMS에 접속하여 DB Object를 분석하여 Java Code를 생성해두고 실제 Query를 실행할 때 Query를 생성하여 DBMS에 질의를 보낸다.

## gradle 설정 

gradle plugin을 사용하길 추천.

[공식문서](https://github.com/etiennestuder/gradle-jooq-plugin)

Applying the plugin
~~~groovy
plugins {
    id 'nu.studer.jooq' version '8.2'
}
~~~

Adding the database driver
~~~groovy
dependencies {
    jooqGenerator 'mysql:mysql-connector-java'
}
~~~
사용할 데이터베이스의 드라이버를 jooqGenerator 구성에 추가해줌.

jOOQ version 특정
~~~groovy
jooq {
  version = '3.18.4'
  edition = nu.studer.gradle.jooq.JooqEdition.OSS
}
~~~

특정 버전의 jOOQ 구성 XML 스키마를 적용
~~~groovy
buildscript {
    configurations['classpath'].resolutionStrategy.eachDependency {
        if (requested.group == 'org.jooq') {
            useVersion '3.17.3'
        }
    }
}
~~~

jOOQ 생성 도구 구성

~~~groovy

~~~
jooq 확장을 통해 jOOQ 생성 도구를 구성