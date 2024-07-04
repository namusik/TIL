# Interface

[baeldung](https://www.baeldung.com/java-interfaces)

## 개념
- 메서드와 상수변수를 포함하는 추상 클래스
- 추상화, 다형성 및 다중 상속을 달성하는데 필수 개념
- 행동으로 타입을 지정해준다. 일종의 면허?

인터페이스도 빌드가 되면 .class가 된다.

## interface 구조
```java
public interface Electronic {

  // Constant variable
  String LED = "LED";

  // Abstract method
  int getElectricityUse();

  // Static method
  static boolean isEnergyEfficient(String electtronicType) {
      if (electtronicType.equals(LED)) {
          return true;
      }
      return false;
  }

  //Default method
  default void printDescription() {
      System.out.println("Electronic Description");
  }

  //Private method
  default void bar() {
    System.out.print("Hello");
    baz();
    staticBaz()
    }

  private void baz() {
    System.out.println(" world!");
  }

  static void buzz() {
    System.out.print("Hello");
    staticBaz();
    // baz()
  }

  private static void staticBaz() {
    System.out.println(" static world!");
  }  
}

public class Computer implements Electronic {

    @Override
    public int getElectricityUse() {
        return 1000;
    }
}
```
- **상수 field**
  - interface의 field는 상수로 취급된다. 초기값이 있어야 한다.
  - interface의 field는 자동으로 `public`, `static`, `final이` 붙는다. 
- **추상 메서드**
  - `abstract` 와 `public` 키워드는 **생략 가능**하다. 컴파일러가 자동으로 메서드에 붙여줌.
- **static 메서드**
  - Java8 부터 가능.
  - 인터페이스 자체에 속해있기 때문에, 인터페이스 이름을 사용해서 호출해야 한다. Electronic.isEnergyEfficient()
  - 구현클래스에서 override 불가
  - 객체를 만들지 않고도 관련 메서드를 한곳에 모아서 디자인의 응집력을 높일 수 있는 간단한 메커니즘 제공
- **default 메서드**
  - Java 8 부터 가능
  - `public` 키워드는 생략되어 있다.
  - `default` 키워드를 붙이면 됨.
  - 구현클래스에서 재정의할 수 있다.
  - 인터페이스에 새로운 메서드를 추가해도 구현체의 코드는 바꾸지 않기 때문에 도입되었다. 구현체에서 구현할 필요 없이 가져다 쓸 수 있음.
- **private 메서드**
  - Java 9 부터 가능
  - static 혹은 non-static으로 만들 수 있음.
  - private method는 interface 내부의 static method에서 사용 불가하다. private static method만 사용가능.
  - 구현 세부정보를 숨길 수 있는 장점이 있음. 코드의 중복을 막을 수 있음.
- `implements` 키워드를 사용해서 인터페이스를 구현한다.

## interface 특징
- 인터페이스는 인스턴스화 할 수 없다.
- 메서드나 변수가 없이 비어있을 수 있다.
- 인터페이스 내부 필드나 메서드에는 `final` 키워드를 쓸 수 없음. 컴파일러 오류가 발생한다.
  - 추상클래스에는 사용가능. subclass가 override 막는 용도.
  - https://www.baeldung.com/java-interface-private-methods

## interface 장점
### 관련없는 클래스에서 사용할 수 있는 특정 동작 기능 추가
- Comparator, Comparable interface
https://www.baeldung.com/java-comparator-comparable

### 다중 상속
#### dafault method 주의사항
```java
public interface Vehicle {
    default String turnAlarmOn() {
        return "Turning the vehicle alarm on.";
    }
}
public interface Alarm {
    default String turnAlarmOn() {
        return "Turning the alarm on.";
    }
}
public class Car implements Vehicle, Alarm {
    @Override
    public String turnAlarmOn() {
        return Vehicle.super.turnAlarmOn();
    }
}
```
- 이렇게 default 메서드 명이 동일한 복수의 interface를 구현하려하면 컴파일 오류가 발생한다.
  - Diamond Problem
- 해결을 위해선 해당 default mehtod를 @Override로 새롭게 구현해야 한다.
- 혹은 특정 interface의 default method를 선택해도 된다.

### 다형성
```java
List<Shape> shapes = new ArrayList<>();
Shape circleShape = new Circle();
Shape squareShape = new Square();

shapes.add(circleShape);
shapes.add(squareShape);

for (Shape shape : shapes) {
    System.out.println(shape.name());
}
```
- 각기 다른 구현체를 하나의 interface 타입으로 받아서 처리가 가능하다.

## interface 상속 규칙
### 다른 interface 상속받기
```java
public interface HasColor {
    String getColor();
}

public interface Box extends HasColor {
    int getHeight()
}
```
- 해당 interface의 모든 추상메서드를 상속한다.
- 구현체는 2개 모두 구현해야 함.

### interface를 구현한 추상 클래스
```java
public interface Transform {
    
    void transform();
    default void printSpecs(){
        System.out.println("Transform Specification");
    }
}

public abstract class Vehicle implements Transform {}
```
- 인터페이스의 추상메서드와 기본 메서드를 상속한다.

## 인터페이스 naming conversation
https://www.baeldung.com/java-interface-naming-conventions

- 구현체에 Impl 붙이지 말자

## 출처
https://www.baeldung.com/java-static-default-methods

https://www.baeldung.com/java-interface-vs-abstract-class
