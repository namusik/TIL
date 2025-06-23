# Java 동작 원리

## Java 기본 실행 순서


![javaCompile](../../Images/Java/javacompile.png)

## Java source code
Java 소스 코드는 --.java 형식의 파일에 작성된다.

Java의 모든 코드는 class 안에 존재해야 한다.

~~~java
class Java{
    ------
}
~~~

여러 Class 들이 모여서 Java Application을 이루는데, 이 중 하나의 Class에는 필수로 **main** Method가 존재해야 한다.

## javac

- Compile 컴파일
- 개발자가 작성한 **자바 소스 코드(.java 파일)** 가 **javac 컴파일러**에 의해 자바 바이트코드(.class 파일)로 변환되는 시점
- 주요 작업:
  - 문법 오류 검사 (Syntax Check)
  - 타입 검사 (Type Check)
  - 소스 코드를 바이트코드로 변환
  - 최적화 (일부 간단한 최적화, 예를 들어 static final 상수 인라이닝)
- public static final int MAX_VALUE = 100; 처럼 값이 코드에 직접 명시된 변수는 클래스 로딩 시점이 아닌 컴파일 시점에 결정된다.
  - 컴파일러가 바이트코드를 생성할 때, 해당 상수가 사용된 모든 곳에 그 상수의 실제 값을 직접 삽입해 버림.

## JVM
[JVM 설명](./JVM.md)

## JIT

바이트코드를 하드웨어의 기계어로 바로 변환해주는 컴파일러

## Hotspot


## 출처
https://techvidvan.com/tutorials/java-virtual-machine/