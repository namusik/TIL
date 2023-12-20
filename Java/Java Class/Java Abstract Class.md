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
- 자식클래스를 생성하면, 내부적으로 부모객체를 먼저 생성후, 자식 객체를 생성한다.

### 기본 생성자
- 클래스가 생성자를 따로 만들지 않으면, 컴파일러는 기본 생성자를 만든다. 추상 클래스에도 역시 적용된다.
- subclass는 `super()`를 사용하여 superclass의 기본생성자를 호출할 수 있다. 
  - 이때, super();는 생략 가능하다. 컴파일러가 역시 알아서 super();를 생성해준다.

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

```java
public abstract class AbstractClass {
    // 인자 없는 생성자
    public AbstractClass() {
        System.out.println("Initializing AbstractClass");
    }
}

public class ConcreteClassA extends AbstractClass {
}

public class ConcreteClassB extends AbstractClass {
    public ConcreteClassB() {
        System.out.println("Initializing ConcreteClassB");
    }
}
```
- parameter가 없는 생성자를 추상클래스에서 만들면, 기본 생성자를 덮어씌운다.
  - 자식 클래스 생성시, 생성자 체인에서 가장 먼저 호출된다.
- 추상클래스에 parameter가 없는 생성자만 존재한다면, subclass에서 `super()`를 생략할 수 있다.
- new ConcreteClassA()를 호출하면, 추상클래스의 생성자가 호출된다.
- new ConcreteClassB()를 호출하면, 추상클래스의 생성자가 먼저 호출되고, 그다음에 자식클래스의 생성자가 호출된다. 
  - Initializing AbstractClass가 먼저 출력되고, Initializing ConcreteClassB가 출력됨.

#### 안전한 초기화
- parameter가 없는 생성자를 선언하면, 안전한 초기화에 도움이 된다.

```java
public abstract class Counter {

    int value;

    public Counter() {
        this.value = 0;
    }

    abstract int increment();
}
```
- 추상 클래스 Counter에서 인자가 없는 생성자를 호출할 때, value의 기본값을 설정해주고 있다.

```java
public class SimpleCounter extends Counter {

    @Override
    int increment() {
        return ++value;
    }
}
```
- 상속받은 SimpleCounter 클래스에서는 따로 생성자를 선언하지 않았다.
- 이러면 부모클래스의 생성자를 그대로 사용하고, 안전하게 value의 초기값을 설정해줄 수 있다.

#### 접근 방지
- 위의 문제는 subclass에서 생성자를 재정의해서 value를 다른 값으로 초기화해버릴 수 있다는 문제가 있다.
- 이때는 생성자를 비공개로 설정해서 subclass가 추상클래스의 생성자를 재정의하지 못하게 할 수 있다.

```java
private Counter() {
    this.value = 0;
    System.out.println("Counter No-Arguments constructor");
}
public Counter(int value) {
    this.value = value;
    System.out.println("Parametrized Counter constructor");
}
```
- parameter가 없는 생성자를 public이 아니라 private으로 제한했다.
- 그리고 parameter기 있는 생성자를 public으로 두어서 강제로 override하도록 하였다.

### parameter가 있는 생성자
- 추상클래스에서 생성자를 사용하는 가장 일반적인 용도는 중복을 피하기 위해서다.
- 추상클래스에 parameter가 있는 생성자만 있다면, subclass에서는 반드시 생성자 내부에 super(param);를 호출해야 한다.
  - 만약 추상클래스에 기본 생성자와 parameter가 있는 생성자 둘다 있다면, super()를 호출안했을 때는 기본생성자가 호출되고. super(param)을 호출하면 parameter가 있는 생성자가 호출된다.

```java
public abstract class Car {

  private int distance;

  private Car(int distance) {
      this.distance = distance;
  }

  public Car() {
      this(0);
      System.out.println("Car default constructor");
  }

  abstract String getInformation();

  protected void display() {
      String info = new StringBuilder(getInformation())
        .append("\nDistance: " + getDistance())
        .toString();
      System.out.println(info);
  }

    // getters
}
```
```java
public class ElectricCar extends Car {
    int chargingTime;

    public ElectricCar(int chargingTime) {
        this.chargingTime = chargingTime;
    }

    @Override
    String getInformation() {
        return new StringBuilder("Electric Car")
          .append("\nCharging Time: " + chargingTime)
          .toString();
    }
}
```
- 필드와 parameter 생성자를 private으로 만들어줌으로써 subclass에서 override하지 못하도록 하였다. 
  - subclass는 추상클래스의 기본생성자를 호출함으로써 distance 초기화를 위임한다. 
- 추상클래스의 기본생성자는 super()를 생략하면 컴파일러가 자동으로 super()를 subclass의 생성자에서 호출해주기 때문에
  - ElectricCar(chargingTime)을 호출하면 추상클래스의 super()가 호출된다.

## 추상클래스에서 @Autowired의 용례

### setter 주입
```java
@Service
public abstract class BallService {

    private LogRepository logRepository;

    @Autowired
    public final void setLogRepository(LogRepository logRepository) {
        this.logRepository = logRepository;
    }
}
```
- @Autowired를 사용해서 종속성이 주입되는 setter에 final을 붙여서 subClass에서 override 하지 못하게 해야한다.
- 하지만 일반적인 케이스에서 쓰지는 않는다.
  - 종속성 주입이 특정 메서드에만 제한되지 않기 위해 final을 쓰지 않는다
- 아래의 생성자 주입을 쓰자.

### 생성자 주입
```java
public abstract class BallService {

    private RuleRepository ruleRepository;

    public BallService(RuleRepository ruleRepository) {
        this.ruleRepository = ruleRepository;
    }
}

@Component
public class BasketballService extends BallService {

    @Autowired
    public BasketballService(RuleRepository ruleRepository) {
        super(ruleRepository);
    }
}
```
- 추상클래스의 생성자에는 @Autowired를 사용할 수 없다.
- 대신 subClass에서 @Autowired를 사용해서 의존성을 주입받아야 한다.

## 출처
https://www.baeldung.com/java-abstract-classes-constructors
https://chanhuiseok.github.io/posts/java-1/