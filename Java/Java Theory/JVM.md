# JVM
Java Virtual Machine

[공식문서](https://docs.oracle.com/javase/specs/jvms/se20/html/index.html)

cornerstone(초석) of the Java platform

`JVM` is an abstract computing machine.

Java로 작성된 애플리케이션은 모두 이 JVM에서만 실행가능하다.

**JVM은 Java programming language를 전혀 알지 못한다.**

binary format만 알 뿐이다.


Compile된 자바 코드는 하드웨어 및 운영체제에 독립적인 binary format이며 `class` file format에 저장된다. 

`class` file에는 JVM 명령어와 symbol table, 등등이 포함되어 있다.

Java 언어(compile된 class file)는 운영체제, 하드웨어에 종속적이지 않지만 

JVM은 각 운영체제에 맞는 버전이 존재한다. 

## JVM Architecture
![jvm](../../Images/Java/jvm.png)

## Runtime Data Area

### 모든 thread가 공유해서 사용하는 메모리(Garbage Collector 대상)

#### Method Area
`.class`, 클래스 파일을 읽어서 클래스 데이터를 저장하는 메모리.
이때, `클래스 변수`(static이 붙은 클래스 영역 내의 변수)도 이 곳에 저장된다.

#### Heap Area
new 키워드로 생성되는 인스턴스가 생성되는 공간.
프로그램 실행 중 생성되는 인스턴스는 모두 이곳에 생성된다.
`인스턴스 변수`(static이 붙지 않은 클래스 영역 내의 변수)도 이 곳에 있다.

### Thread 마다 하나씩 생성되는 메모리

#### Stack

#### PC Register

#### Native Method Stack