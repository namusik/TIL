# Static 

애플리케이션 실행 시, 다른 변수나 메서드보다 먼저 메모리에 올라간다.

따라서, 별도의 인스턴스화가 필요없이 사용 가능하다.

## Static 변수 (정적 변수)

- 클래스 자체에 소속된 공용 데이터
- 메모리 할당:
  - static 변수는 클래스가 메모리에 로딩될 때 **단 한 번 할당**되며, 프로그램이 종료될 때까지 유지된다.
  -  여러 인스턴스(클래스의 객체)가 같은 static 변수의 값을 공유합니다.
  -  예를 들어, 여러 객체가 생성되더라도 하나의 메모리 공간에 저장되므로 메모리 사용 측면에서 효율적
- 공유 개념:
  - 객체마다 같은 값을 따로 저장하지 않고, 한 번 생성된 static 변수의 값을 모든 인스턴스가 공유하므로, 클래스 수준에서 공통된 데이터를 관리할 때 유용
  - 예시로, 객체 생성 시마다 카운트를 증가시키고자 할 때 static 변수를 사용하면 모든 인스턴스가 같은 카운터를 참조 가능
- 상수와의 결합:
  - 값이 변경되지 않아야 하는 경우 static 변수에 `final`을 붙여 상수로 정의가능

```java
public class Counter {
    public static int count = 0;

    public Counter() {
        count++;  // 생성자에서 static 변수 count를 증가시킴
    }
}
```
Counter c1 = new Counter();
Counter c2 = new Counter();

두 생성자 호출이 모두 같은 static 변수 count를 참조하므로, 첫 번째 생성자 호출 후 count는 1, 두 번째 생성자 호출 후 count는 2가 됩니다.
즉, c1과 c2는 **각자 독립적인 인스턴스 변수**는 가지지만, **static 변수인 count는 하나의 메모리 공간을 공유**

## Static 초기화 블록

- 클래스 내부에 선언되며, static 키워드와 중괄호 {}로 구성된 코드 블록
- 클래스의 static 멤버(변수, 메서드)를 초기화하는 특별한 목적
- **클래스**별로 한 번만 실행되는 초기화 로직이 필요할 때 사용

```java
public class InitializationOrderDemo {
    // 1. static 필드 명시적 초기화
    static int staticField1 = 10;

    // 2. static 초기화 블록 (첫 번째)
    static {
        System.out.println("Static Block 1 실행: staticField1 = " + staticField1); // 10
        staticField2 = 20; // staticField2는 아직 선언만 된 상태이지만, static 블록에서 초기화 가능
    }

    // 3. static 필드 명시적 초기화 (뒤에 선언된 필드)
    static int staticField2;

    // 4. static 초기화 블록 (두 번째)
    static {
        System.out.println("Static Block 2 실행: staticField2 = " + staticField2); // 20
    }

    // 5. 생성자 (인스턴스 생성 시 실행)
    public InitializationOrderDemo() {
        System.out.println("생성자 실행");
    }

    public static void main(String[] args) {
        System.out.println("main 메서드 시작");

        // 클래스 로딩이 여기서 발생 (staticField1에 접근)
        System.out.println("staticField1 값: " + InitializationOrderDemo.staticField1);

        // 클래스 로딩은 이미 완료되었으므로 static 블록은 다시 실행되지 않음
        InitializationOrderDemo obj = new InitializationOrderDemo();

        System.out.println("main 메서드 종료");
    }
}
```

- 클래스 로딩 시점
  - 해당 클래스가 **Java Virtual Machine (JVM)에 로드될 때** 정확히 한 번만 실행됨.
  - 해당 클래스의 첫 인스턴스가 생성될 때 (new MyClass())
  - 해당 클래스의 static 멤버(변수나 메서드)가 처음으로 접근될 때 (MyClass.staticField 또는 MyClass.staticMethod())
  - (드물지만) Class.forName()과 같은 메서드를 통해 명시적으로 클래스를 로드할 때
- 실행 순서:
  - static 필드의 **명시적 초기화(선언과 동시에 값 할당)**가 먼저 실행됨
  - 그 다음에 static 초기화 블록이 실행됨
  - 만약 클래스에 여러 개의 static 초기화 블록이 있다면, 소스 코드에 나타난 **순서대로** 위에서 아래로 실행됨
  - static 초기화 작업이 모두 완료된 후에야 해당 클래스의 생성자(Constructor)가 호출되거나 다른 static 멤버에 접근할 수 있음.

### 용도

- 복잡한 static 필드 초기화
  - static final 필드(상수)를 선언할 때, 단순한 리터럴 값으로 초기화할 수 없고 여러 단계를 거쳐야 하거나, 계산이 필요하거나, 다른 static 필드를 참조해야 할 경우에 사용됨
- 외부 설정(예: application.properties의 값)이 주입되기 전에 초기화되어야 하는 static 필드가 있을 때
- 자원 로딩 및 설정
  - 로그 설정 파일 로딩 등 애플리케이션 전역에서 사용될 static 리소스를 한 번만 로드하고 설정할 때 유용
- static 멤버들의 상호 의존적인 초기화
  - 여러 static 필드가 서로의 초기화에 의존하는 경우, static 블록 내에서 명확한 순서를 가지고 초기화할 수 있음.

## 스태틱 영역
바로 'static 영역에서 힙 영역을 참조할 수 없다'

static 은 프로그램에서 유일한 영역이고, 인스턴스는 힙 영역에 N개로 늘어날 수 있습니다.

그래서 static 과 힙 영역의 인스턴스는 1:N 관계가 됩니다.

그래서 힙 영역의 인스턴스가 static 영역을 참조할 수 있으나, static영역에서 힙 영역의 인스턴스를 참조할 순 없습니다.

N개의 인스턴스가 존재할 수 있기에, 어떤 인스턴스를 지칭하는지 알 방법이 (자바 문법 상으론) 없습니다.

## 자기 자신을 내부에서 static 객체로 생성
https://jang-sn.tistory.com/35

## inner class vs static inner class

inner class는 반드시 outer class를 통해 접근해야함. 

그런데, static을 붙이면 애플리케이션 어디서나 접근할 수 있게된다.

https://siyoon210.tistory.com/141

https://johngrib.github.io/wiki/java/inner-class-may-be-static/

