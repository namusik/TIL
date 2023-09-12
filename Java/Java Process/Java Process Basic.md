# Java Process

## Runtime class

자바 런타임 환경을 캡슐화
new로 생성할 수 없기 때문에 static 메소드 사용해서 현재 실행중인 프로그램의 Runtime 클래스에 대한 참조를 얻음.

```java
Runtime.getRuntime()
```

## Process class

Process 인스턴스를 참조하는 방법에는 2가지가 있다.

```java
Process process = runtime.exec("명령 명령파라미터"); //하나의 스트링 안에 같이
```

exec() 메서드를 통해 Process를 참조

```java
ProcessBuilder pb1 = new ProcessBuilder("명령", "명령 파라미터"); // 따로 적어줌
Process process = pb1.start()
```

프로그램을 실행시키고 Process를 참조할 수 있다.

이 방식을 더 선호한다.

## ProcessBuilder

Process 클래스의 보조 클래스.

**start()** 메서드를 통해 새 Process를 만들 수 있다.

동기화된 클래스가 아니기 때문에 멀티쓰레드로부터 안전하지는 않음.

## 출처

https://www.youtube.com/watch?v=6Hx7OTwWFwI&list=PLxU-iZCqT52BVt5HycCd6CULukiARAl6S&index=20

https://www.baeldung.com/java-process-api
