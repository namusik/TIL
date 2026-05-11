# Custom Exception

## 필요한 이유
- 사실 대부분의 예외는 자바의 예외로 대응이 가능하다. 
- 특정 비즈니스 로직에 맞춤을 위한 커스텀 예외를 만들면 정확하게 대응이 가능하다.

## Custom checked exception
```java
try (Scanner file = new Scanner(new File(fileName))) {
    if (file.hasNextLine()) return file.nextLine();
} catch(FileNotFoundException e) {
    // Logging, etc 
}
```
- FileNotFoundException을 사용해도 좋지만, 정확히 파일이 없어서 예외가 터진건지, fileName이 틀려서 예외가 터진건지 알 수 가 없다.

```java
public class IncorrectFileNameException extends Exception { 
  public IncorrectFileNameException(String errorMessage, Throwable err) {
      super(errorMessage, err);
  }
}
```
- checked exception을 만드려면 Exception 클래스를 상속하면 된다.
- 그리고 사용할 생성자를 쓰면 된다. 단순히 예외메시지만 인자로 들어가는 생성자보다는 예외근본 원인이 같이 들어가는 생성자가 더 낫다.

## Custom Unchecked Exception
- Runtime 중에 사용자의 실수로 발생하는 예외에 사용

```java
public class IncorrectFileExtensionException extends RuntimeException {
    public IncorrectFileExtensionException(String errorMessage, Throwable err) {
        super(errorMessage, err);
    }
}
```
- Unchecked Exception은 RuntimeException을 상속한다.


## 결론
```java
try (Scanner file = new Scanner(new File(fileName))) {
    if (file.hasNextLine()) {
        return file.nextLine();
    } else {
        throw new IllegalArgumentException("Non readable file");
    }
} catch (FileNotFoundException err) {
    if (!isCorrectFileName(fileName)) {
        throw new IncorrectFileNameException(
          "Incorrect filename : " + fileName , err);
    }
    
    //...
} catch(IllegalArgumentException err) {
    if(!containsExtension(fileName)) {
        throw new IncorrectFileExtensionException(
          "Filename does not contain extension : " + fileName, err);
    }
    
    //...
}
```
- 결론적으로 각각의 상황에 맞게 특별한 예외 처리를 할 수 있게 된다.