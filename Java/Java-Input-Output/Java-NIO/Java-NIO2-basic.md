
# Java NIO2

## 개념
- Java 1.7에 업데이트됨.
- 향상된 파일 작업과, AsynchronousSocketChannel이 도입

## Path

- 파일 및 디렉토리 경로를 나타내는 인터페이스
- 경로 문자열을 조작하는 방법을 제공해준다.

```java
Path path = Paths.get("file.txt");
```
- 경로 문자열 또는 URI를 `Path` 인스턴스로 변환시켜줌


## File
- 일반적인 파일 및 디렉토리 작업을 위한 정적 메서드를 제공

```java
  List<String> lines = null;
  try {
      lines = Files.readAllLines(path);
  } catch (IOException e) {
      throw new RuntimeException(e);
  }

  log.info(String.join("\n", lines));
```
- 해당 Path 인스턴스 파일의 모든 line을 읽음

## FileVisitor
- 재귀적인 파일 트리 탐색하는데 사용하는 인터페이스

```java

```
## 출처
https://www.baeldung.com/java-nio-2-file-api
https://www.baeldung.com/java-nio2-async-socket-channel