# build.gradle

## 구조 

## buildscript

~~~groovy
buildscript{
    dependencies{
        classpath "org."
    }
}
~~~

    gradle로 task를 수행할 때 사용되는 설정. 

    !!!소스 컴파일과는 무관!!!

    소스코드 Compile과 같은 빌드 작업을 시작하기 전에 빌드 시스템 준비 단계에서 제일 먼저 실행. 

    gradle 자체를 위한 것이므로, gradle이 빌드를 수행하는 방법에 대한 변경을 명시함. 


plugins 방식으로 변경됨.


## plugins

~~~
plugins {
    id 'java'
}
~~~

Plugin이란 Gradle Task의 집합이다. 

    특정 작업(어플리케이션 개발 등)을 하기 위해서 모우둔 Task들의 묶음.



## 참고 

https://cbwstar.tistory.com/entry/buildgradle-plugins-%EC%99%80-apply-plugin-%EC%B0%A8%EC%9D%B4