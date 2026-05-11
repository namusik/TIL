# Anonymous Class

## 정의
- 이름이 없는 내부 클래스
- 이름이 없기 때문에 익명 클래스의 인스턴스를 생성하는데 사용할 수는 없다.
- 사용 시점에 단일 표현식으로 익명 클래스를 선언하고 인스턴스화 해야 함.
- 전혀 새로운 클래스를 익명으로 사용하는 것이 아니라, 이미 정의되어 있는 클래스의 멤버들을 재정의 하여 사용할 필요가 있을때 그리고 그것이 일회성으로 이용될때 사용하는 기법

## 클래스 상속
~~~java
    public class Animal {
        private String name;

        public void sound() {
            System.out.println("animal");
        }
    }
~~~

~~~java
    Animal dog = new Animal("Romy") {
        @Override
        public void sound() {
            System.out.println("dog");
        }
    };

    dog.sound();
~~~
- 기존에 존재하는 클래스에서 익명 클래스를 인스턴스화 할 때 사용
- 일회용처럼 한 번 사용하는 마는 느낌.

## 인터페이스 구현
```java
public interface AnonymousInterface {
    void run();
}
```

```java
    AnonymousInterface anonymousInterface = new AnonymousInterface() {
        @Override
        public void run() {
            log.info("run");
        }
    };

    anonymousInterface.run();
```
- 존재하는 interface의 구현체를 즉석에서 구현하고 일회용으로 사용

## 익명 클래스 속성


## 참고
https://www.baeldung.com/java-anonymous-classes