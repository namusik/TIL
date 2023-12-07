# Interface

[baeldung](https://www.baeldung.com/java-interfaces)

## 개념
- 메서드와 상수변수를 포함하는 추상 클래스
- 추상화, 다형성 및 다중 상속을 달성하는데 필수 개념

인터페이스도 빌드가 되면 .class가 된다.

## 코드
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
}

public class Computer implements Electronic {

    @Override
    public int getElectricityUse() {
        return 1000;
    }
}
```

## abstract class와의 차이

https://www.baeldung.com/java-interface-vs-abstract-class
