# Abstract Class 추상클래스

[baeldung](https://www.baeldung.com/java-abstract-class)

## 개념 
- 구현의 일부를 나중에 완료되도록 연기하고 싶은 경우 추상클래스 사용.

## 특징
- class 키워드 앞에 abstract를 붙여서 추상클래스를 정의.
- 추상클래스에는 추상메서드와 구체적인 메서드 모두 선언 가능.
- 하나 이상의 추상메서드가 있으면 추상클래스로 정의해야 한다.
- 추상 메소드를 포함하고 있다는 점을 제외하면, 일반 클래스와 모든 점이 동일.
  - 생성자, 필드, 일반 메서드 모두 가질 수 있다.
- 추상메서드가 있기 때문에 바로 인스턴스를 생성할 수 없다. 자식클래스를 만들어서 인스턴스를 생성할 수 있다.

## 형식
```java
public abstract class BoardGame {

    //... 필드, 생성장

    // 추상 메서드
    public abstract void play();

    //... 구체적인 메서드들
}
```
- 추상 클래스

```java
public class Checkers extends BoardGame {

    public void play() {
        //... 추상메서드를 구현해야 한다.
    }
}
```
- 상속 클래스

## 언제 사용하는가
1. 여러 자식 클래스가 공통으로 사용하는 코드를 캡슐화 할 때.
2. 쉽게 확장하고 개설할 수 있는 API를 부분적으로 정의.

## 예시
```java
public abstract class BaseFileReader {
    
    protected Path filePath;
    
    protected BaseFileReader(Path filePath) {
        this.filePath = filePath;
    }
    
    public Path getFilePath() {
        return filePath;
    }
    
    public List<String> readFile() throws IOException {
        return Files.lines(filePath)
          .map(this::mapFileLine).collect(Collectors.toList());
    }
    
    protected abstract String mapFileLine(String line);
}
```
- 자식클래스가 사용할 수 있도록 `protected`를 사용

```java
public class LowercaseFileReader extends BaseFileReader {

    public LowercaseFileReader(Path filePath) {
        super(filePath);
    }

    @Override
    public String mapFileLine(String line) {
        return line.toLowerCase();
    }   
}
```

```java
public class UppercaseFileReader extends BaseFileReader {

    public UppercaseFileReader(Path filePath) {
        super(filePath);
    }

    @Override
    public String mapFileLine(String line) {
        return line.toUpperCase();
    }
}
```
- 자식 클래스는 mapFileLine 기능에만 집중할 수 있다.

```java
@Test
public void givenLowercaseFileReaderInstance_whenCalledreadFile_thenCorrect() throws Exception {
    URL location = getClass().getClassLoader().getResource("files/test.txt")
    Path path = Paths.get(location.toURI());
    BaseFileReader lowercaseFileReader = new LowercaseFileReader(path);
        
    assertThat(lowercaseFileReader.readFile()).isInstanceOf(List.class);
}
```
- 자식클래스는 부모클래스의 타입으로 받을 수 있다. 

## 추상클래스에서의 생성자
- 추상 클래스와 생성자는 어울리지 않아 보인다. 생성자는 클래스가 인스턴스화할 때 호출이 되는 메서드인데, 추상클래스는 인스턴스가 될 수 없기 때문이다.

### 기본 생성자
- 클래스가 생성자를 따로 만들지 않으면, 컴파일러는 기본 생성자를 만든다. 추상 클래스에도 역시 적용된다.
- 자식 클래스는 `super()`를 사용하여 추상클래스의 기본생성자를 호출할 수 있다. 

```java
public abstract class AbstractClass {
    // compiler creates a default constructor
}

public class ConcreteClass extends AbstractClass {

    public ConcreteClass() {
        super();
    }
}
```

### 인자가 없는 생성자
