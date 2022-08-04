# gradle

## 빌드란?

    소프트웨어 빌드는 소스 코드 파일을 컴퓨터, 휴대폰에서 실행할 수 있는 독립 소프트웨어 가공물로 변환하는 과정을 말하거나 그 결과물을 말함. 

## 자바 빌드과정

    1. .Java(소스코드)를 컴파일해서 .Class 파일 생성
    2. 코딩 규칙 체크
    3. Test
    4. javadoc과 같은 문서 작성
    5. .Class 파일과 리소스를 패키징해서 압축파일 생성 (.jar 혹은 .war)
   
## 빌드와 컴파일의 차이 

    컴파일 

    특정 프로그래밍 언어를 다른 프로그래밍 언어로 옮기는 것. 

    빌드 > 컴파일. 더 큰 개념이다. 

## Gralde이란?

    거의 모든 유형의 소프트웨어를 빌드 할 수 있을 정도로 유연하게 설계된 
    오픈소스 빌드 자동화 도구.

## Gradle Wrapper

    선언된 버전의 Gradle을 호출하여 필요한 경우 다운로드하는 스크립트.

        Temp 파일 형식으로 Gradle의 바이너리 파일을 다운.

    이미 존재하는 프로젝트를 새로운 환경에서 바로 빌드할 수 있게 해줌. 

    Gradle을 따로 설치하지 않아도 이미 만든 프로젝트를 새로운 환경에서도 빌드 가능.

    !!Gradle Wrapper사용을 적극 권장함!!

## 명령어

    gradle build - 로컬에 설치된 gradle 사용

    ./gradlew build - wrapper 사용



## 참고 

https://yeh35.github.io/blog.github.io/documents/infra/gradle/gradle-start1/