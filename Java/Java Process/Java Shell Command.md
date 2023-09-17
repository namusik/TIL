# Java Shell Command

자바에서 shell command를 실행시키는 여러가지 방법

## 특징

shell command는 OS 종속적이기 때문에, OS마다 동작이 다르다.

따라서, JVM이 실행중인 운영 체제가 무엇인지를 먼저 알아야 한다.

window에서는 cmd.exe

linux/macOS에서는 /bin/sh

```java
boolean isWindows = System.getProperty("os.name")
  .toLowerCase().startsWith("windows");
```

이런 방식으로 window 인지, linux/mac 인지 먼저 확인을 해야 한다.

## Input and Output

## Runtime.exec()

## ProcessBuilder

더 선호되는 방식.

customize가 가능하다

## 참고

https://www.baeldung.com/run-shell-command-in-java
