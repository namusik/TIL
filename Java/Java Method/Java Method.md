# Java Method
## private Method

## Abstract Method
추상 메서드는 2가지의 경우가 있다고 볼 수 있다.
### Abstract Class 내부 abstract method

### interface 내부 method

## Java 8 추가
기존에 interface는 public abstract method만 가질 수 있었다.

interface에 새로운 method를 추가하려면, 모든 구현체에도 새로운 method를 구현해줘야 했다.

Java 8부터는 interface에 선언되었지만, 동작이 정의된 method를 가질 수 있게 되었다.

## Static Method 
~~~java
public interface Vehicle{
    static String producer() {
        return "N&F Vehicles";
    }
}
~~~
위처럼 interface에 동작이 정의된 static method를 쓸 수 있다.

static method는 오직 interface 내부에서는 호출이 가능하다.
하지만, 구현 클래스에서 override 할 수 없다.

~~~java
String producer = Vehicle.producer();
~~~
외부에서 static method 호출을 위해서는 interface를 통해서만 쓸 수 있다.

따로 instance의 생성없이 바로 호출이 가능하다.

## Default Method
~~~java
public interface Vehicle{
    default String getOverview() {
        return "ATV made by " + producer();
    }
}
~~~
default method는 구현 클래스에서 override 할 수 있고, 접근도 가능하다.

~~~java
Vehicle vehicle = new VehicleImpl();
String overview = vehicle.getOverview();
~~~
default method 사용을 위해서는 instance 생성을 통해서만 쓸 수 있다.


## 참고
https://www.baeldung.com/java-8-new-features#interface