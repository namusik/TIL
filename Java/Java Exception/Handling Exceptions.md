# Exception 다루기

## throws

```java
public int getPlayerScore(String playerFile)
  throws FileNotFoundException {
 
    Scanner contents = new Scanner(new File(playerFile));
    return Integer.parseInt(contents.nextLine());
}
```
- checked exception을 호출한 곳에 던져버리는 것이다.
- 가장 간단한 방법이다. 
- 하지만, 이 메서드를 호출한 곳에서 또다시 exception을 handle 해야된다.

## try-catch
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

## finally

- 예외 발생 여부와 관계없이 마지막에 실행해야 하는 코드가 있을 때

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
- 먼저 게으른 방식
- 파일을 닫는 코드를 finally에 추가해주었다.

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
- close 메서드도 IOException을 throw하기 때문에 처리해주는 방식

## try-with-resources

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
- Java 7 부터는 AutoCloseable을 구현한 클래스를 사용할 때는 자동 닫기 기능을 제공하기 때문에 간소화 할 수 있다. 
- try 블록에서 사용할 리소스를 선언하고 해당 블록 실행 후 리소스가 닫히도록 보장해준다.
- finally 구문을 대체해서 코드를 간소화할 수 있다.
- 또한 try 구문 안에 ;을 사용하면 여러개의 리소스를 선언할 수 도 있다.
  - 이때 close()되는 순서는 역순이다.
- try-with-resources도 finally 블록을 사용할 수 있다.

## Multiple catch Blocks
```java
public int getPlayerScore(String playerFile) {
    try (Scanner contents = new Scanner(new File(playerFile))) {
        return Integer.parseInt(contents.nextLine());
    } catch (IOException e) {
        logger.warn("Player file wouldn't load!", e);
        return 0;
    } catch (NumberFormatException e) {
        logger.warn("Player file was corrupted!", e);
        return 0;
    }
}
```
- 2개 이상의 예외를 발생 시킬 때 사용
- 각 예외마다 다른 처리를 할 수 있다.

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
- 만약 자식 예외를 직접 catch하고 싶다면 부모예외 보다 먼저 catch 해줘야 한다.

## Union catch Blocks
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
- 만약 서로 다른 예외지만 처리로직이 같다면 같이 catch 할 수 있다. from Java7

## Throwing Exception
- 예외를 직접 처리하고 싶지 않거나 다른 곳에서 처리할 수 있도록 예외를 생성하고 싶을 때 사용

```java
public class TimeoutException extends Exception {
    public TimeoutException(String message) {
        super(message);
    }
}
```

### throwing checked exception

```java
public List<Player> loadAllPlayers(String playersFile) throws TimeoutException {
    while ( !tooLong ) {
        // ... potentially long operation
    }
    throw new TimeoutException("This operation took too long");
}
```
- 메서드 내에서 어디서든지 예외를 throw new 할 수 있다.
- checked exception일 때는 호출자가 예외를 처리하도록 throws 해야 한다.

### Throwing an Unchecked Exception
```java
public List<Player> loadAllPlayers(String playersFile) throws TimeoutException {
    if(!isFilenameValid(playersFile)) {
        throw new IllegalArgumentException("Filename isn't valid!");
    }
   
    // ...
}
```
- 유효성 검사와 같은 로직을 수행할 때, unchecked exception을 throw할 수 있다.
- 이때는 따로 throws하지 않아도 됨.
- 종종 문서의 형식으로 예외발생을 표시하기도 한다.

### Wrapping and Rethrowing
```java
public List<Player> loadAllPlayers(String playersFile) 
  throws IOException {
    try { 
        // ...
    } catch (IOException io) { 		
        throw io;
    }
}
```
- 예외를 catch로 잡은 후, 다시 예외를 던질 수 도 있다.

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
- 혹은 상세한 예외로 감싸서 throw 할 수 있다.
- 서로 다른 예외들을 하나의 예외로 합쳐서 던질 때 유용하다.

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
- unchecked exception만 발생하고 있다면, 이를 Throwalbe로 catch해서 checked exception인 Throwable 이나 Exception으로 다시 throw 하는 방법이다. 
- unchecked exception만 발생하고 있기 때문에, thorws를 명시하지 않아도 된다.
- Throwable로 catch하기 때문에 모든 예외가 catch된다. 이렇게 모든 예외를 catch해버리면 호출자에게 어떤 예외가 발생할지에 대한 정보를 주지않게 된다.
- proxy 클래스나 특별한 상황에 유용하게 사용될 수 있다.
  - 프록시 클래스는 대상 객체의 메서드를 호출하기 전이나 후에 어떤 작업을 수행하고 싶을 때 사용된다. 대상 객체의 메서드가 던지는 예외를 명시적으로 선언하지 않고, 모든 예외를 잡아서 다시 던지는 방식을 사용할 수 있다.
http://4comprehension.com/sneakily-throwing-exceptions-in-lambda-expressions-in-java/

## 출처
https://www.baeldung.com/java-exceptions

https://www.baeldung.com/java-try-with-resources