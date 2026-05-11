# Exception 다루기

---

## 1. 예외 전파 - throws

```java
public int getPlayerScore(String playerFile)
  throws FileNotFoundException {

    Scanner contents = new Scanner(new File(playerFile));
    return Integer.parseInt(contents.nextLine());
}
```
- checked exception을 호출한 곳에 던져버리는 것이다.
- 가장 간단한 방법이지만, 호출한 곳에서 또다시 exception을 handle 해야된다.

---

## 2. 예외 처리 - try-catch

```java
public int getPlayerScore(String playerFile) {
    try {
        Scanner contents = new Scanner(new File(playerFile));
        return Integer.parseInt(contents.nextLine());
    } catch (FileNotFoundException noFile) {
        throw new IllegalArgumentException("File not found");
    }
}

public int getPlayerScore(String playerFile) {
    try {
        Scanner contents = new Scanner(new File(playerFile));
        return Integer.parseInt(contents.nextLine());
    } catch ( FileNotFoundException noFile ) {
        logger.warn("File not found, resetting score.");
        return 0;
    }
}
```
- 직접 exception을 처리하고자 할 때, try-catch block을 사용한다.
- 위처럼 catch 해서 다시 새로운 exception을 throw 할 수 도 있고
- 아래처럼 catch 해서 복구 로직을 수행할 수 있다.
- catch로 잡는 예외는 자식예외까지 포함한다.

### Multiple catch Blocks

```java
public int getPlayerScore(String playerFile) {
    try (Scanner contents = new Scanner(new File(playerFile)) ) {
        return Integer.parseInt(contents.nextLine());
    } catch (FileNotFoundException e) {
        logger.warn("Player file not found!", e);
        return 0;
    } catch (IOException e) {
        logger.warn("Player file wouldn't load!", e);
        return 0;
    } catch (NumberFormatException e) {
        logger.warn("Player file was corrupted!", e);
        return 0;
    }
}
```
- 각 예외마다 다른 처리를 할 수 있다.
- 자식 예외를 직접 catch하고 싶다면 부모예외보다 먼저 catch 해줘야 한다.

### Union catch Blocks (Java 7+)

```java
public int getPlayerScore(String playerFile) {
    try (Scanner contents = new Scanner(new File(playerFile))) {
        return Integer.parseInt(contents.nextLine());
    } catch (IOException | NumberFormatException e) {
        logger.warn("Failed to load score!", e);
        return 0;
    }
}
```
- 서로 다른 예외지만 처리 로직이 같다면 `|`로 함께 catch 할 수 있다.
- 단, 상속 관계에 있는 예외끼리는 사용할 수 없다.

---

## 3. 리소스 정리 - finally

- 예외 발생 여부와 관계없이 마지막에 실행해야 하는 코드가 있을 때 사용한다.

```java
public int getPlayerScore(String playerFile)
  throws FileNotFoundException {
    Scanner contents = null;
    try {
        contents = new Scanner(new File(playerFile));
        return Integer.parseInt(contents.nextLine());
    } finally {
        if (contents != null) {
            contents.close();
        }
    }
}
```
- 예외를 직접 처리하지 않고 throws로 던지되, 리소스 정리만 finally에서 수행하는 방식이다.

```java
public int getPlayerScore(String playerFile) {
    Scanner contents;
    try {
        contents = new Scanner(new File(playerFile));
        return Integer.parseInt(contents.nextLine());
    } catch (FileNotFoundException noFile ) {
        logger.warn("File not found, resetting score.");
        return 0;
    } finally {
        try {
            if (contents != null) {
                contents.close();
            }
        } catch (IOException io) {
            logger.error("Couldn't close the reader!", io);
        }
    }
}
```
- catch와 finally를 함께 사용하는 방식이다.
- `close()` 자체도 IOException을 던질 수 있으므로 finally 안에서 다시 try-catch가 필요하다.
- 이런 번거로움 때문에 try-with-resources가 도입되었다.

---

## 4. 리소스 자동 정리 - try-with-resources (Java 7+)

```java
public int getPlayerScore(String playerFile) {
    try (
        Scanner contents = new Scanner(new File(playerFile));
        PrintWriter writer = new PrintWriter(new File("testWrite.txt"))
        ) {
      return Integer.parseInt(contents.nextLine());
    } catch (FileNotFoundException e ) {
      logger.warn("File not found, resetting score.");
      return 0;
    }
}
```
- `AutoCloseable`을 구현한 클래스는 try 블록 종료 시 자동으로 `close()`가 호출된다.
- `;`으로 구분하여 여러 리소스를 선언할 수 있으며, close 순서는 선언의 역순이다.
- finally 블록도 함께 사용할 수 있다.

```java
// Java 9+: effectively final 변수를 직접 사용 가능
Scanner contents = new Scanner(new File(playerFile));
try (contents) {
    return Integer.parseInt(contents.nextLine());
}
```

### Suppressed Exception
- try-with-resources에서 try 블록과 `close()` 모두 예외가 발생하면, try 블록의 예외가 우선 throw된다.
- `close()`에서 발생한 예외는 **suppressed exception**으로 추가되며, `getSuppressed()`로 확인할 수 있다.

```java
try (MyResource res = new MyResource()) {
    throw new RuntimeException("try 블록 예외");
    // close()에서도 예외 발생 시 → suppressed로 붙음
} catch (RuntimeException e) {
    Throwable[] suppressed = e.getSuppressed(); // close() 예외 확인
}
```

---

## 5. 예외 던지기 - throw

- 예외를 직접 생성하여 던질 때 사용한다.

### Checked Exception

```java
public List<Player> loadAllPlayers(String playersFile) throws TimeoutException {
    while ( !tooLong ) {
        // ... potentially long operation
    }
    throw new TimeoutException("This operation took too long");
}
```
- checked exception은 호출자가 처리하도록 `throws`를 선언해야 한다.

### Unchecked Exception

```java
public List<Player> loadAllPlayers(String playersFile) {
    if(!isFilenameValid(playersFile)) {
        throw new IllegalArgumentException("Filename isn't valid!");
    }
    // ...
}
```
- unchecked exception이므로 `throws`를 명시하지 않아도 된다.
- Javadoc의 `@throws`로 어떤 예외가 발생할 수 있는지 문서화하기도 한다.

### Wrapping and Rethrowing

```java
public List<Player> loadAllPlayers(String playersFile)
  throws PlayerLoadException {
    try {
        // ...
    } catch (IOException io) {
        throw new PlayerLoadException(io);
    }
}
```
- 예외를 catch 후 더 구체적인 예외로 감싸서 다시 던질 수 있다.
- 원본 예외를 생성자에 넘겨 **cause chain**을 유지하는 것이 중요하다.

### Rethrowing Throwable or Exception

```java
public List<Player> loadAllPlayers(String playersFile) {
    try {
        throw new NullPointerException();
    } catch (Throwable t) {
        throw t;
    }
}
```
- try 블록에서 unchecked exception만 발생한다면, Throwable로 catch해도 throws 선언 없이 rethrow할 수 있다.
- 컴파일러가 실제 throw되는 예외 타입을 추론하기 때문이다. (Java 7+)
- 모든 예외를 투명하게 전파해야 하는 프록시 클래스 등에서 유용하다.
- 단, 호출자에게 어떤 예외가 발생하는지 정보를 주지 않으므로 일반적인 코드에서는 지양한다.

---

## 출처
- https://www.baeldung.com/java-exceptions
- https://www.baeldung.com/java-try-with-resources
