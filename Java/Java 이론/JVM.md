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
