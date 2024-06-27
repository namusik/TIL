# Facotry Method Pattern

## 개념
![factorymethod](../../images/architecture/factorymethod.png)

- 구현체를 생성하는 코드와 해당 구현체를 사용하는 코드를 분리해서 결합 코드를 느슨하게 하는 것이 목표
- 새로운 구현체를 도입하더라도 기존 코드의 수정없이 할 수 있음.
- SRP, OCP를 따르기 위해
- 각 공장이 있고 각 공장에서 만드는 물건이 다름. 그런데 물건들은 같은 interface를 공유한다.

## 사용법
```java
public interface MotorVehicle {
    void build();
}
```
- 기본 인터페이스를 만든다. 

```java
public class Motorcycle implements MotorVehicle {
    @Override
    public void build() {
        System.out.println("Build Motorcycle");
    }
}
public class Car implements MotorVehicle {
    @Override
    public void build() {
        System.out.println("Build Car");
    }
}
```
- 인터페이스를 구현하는 구체적인 클래스들을 구현해준다. 구현체에 따라 메서드 구현내용이 다르다.

- 부모 클래스에서 객체들을 생성할 수 있는 인터페이스 제공
- 자식 클래스들이 생성될 객체들의 유형을 변경할 수 있도록 하는 생성 패턴

```java
public abstract class MotorVehicleFactory {
    public MotorVehicle create() {
        MotorVehicle vehicle = createMotorVehicle();
        vehicle.build();
        return vehicle;
    }
    protected abstract MotorVehicle createMotorVehicle();
}
```
- 새로운 인스턴스를 생성하는 역할을 하는 추상클래스.
- 상속받은 특정 factory에서 특정 인스턴스를 만들게 하기 위해 추상클래스로 만든다.

```java
public class MotorcycleFactory extends MotorVehicleFactory {
    @Override
    protected MotorVehicle createMotorVehicle() {
        return new Motorcycle();
    }
}
```
- 이 팩토리에서는 위에서 만든 구현체 motorcycle을 생성한다.

## 결론
- 상속을 디자인 도구로 사용