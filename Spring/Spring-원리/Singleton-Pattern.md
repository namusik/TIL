# Singleton Pattern

## 정의
클래스의 인스턴스가 1개만 생성되는 것을 보장하는 패턴

## 의의
요청이 올 때마다 객체를 생성하는 것이 아니라, 
이미 만들어진 객체를 공유해서 효율적으로 사용한다.

## 문제점
* 코드가 많아진다.
* DIP & OCP 위반 가능성
* 유연성이 떨어진다.
* anti pattern?

## 사용되는 곳
spring container의 스프링 빈

LogManager 같은 글로벌 구성. 
~~~java
public class LogManager {
    // The global LogManager object
    private static final LogManager manager;
    static{
        .....
    }

    public static LogManager getLogManager() {
        if (manager != null) {
            manager.ensureLogManagerInitialized();
        }
        return manager;
    }
~~~
내부에서 자기 자신을 static 객체로 생성하고,
static으로 호출한다.

### 싱글톤 빈이 동시 요구를 처리하는 방법
[baeldung](https://www.baeldung.com/spring-singleton-concurrent-requests)

각 요청의 스레드는 스택 메모리에 자신의 영역을 만들고 지역변수를 저장한다. 그래서 서로가 분리 되어있기 때문에 서로의 변수에 영향을 끼치지 않는다. 

## 주의점
`무상태(stateless)`로 설계해야 한다.

* 특정 클라이언트가 값을 바꾸게 해선 안됨
* 읽기만 가능해야 한다.
* 필드 대신, 지역변수 파라미터 ThreadLocal 사용하기. 스레드끼리 공유되지 않기 때문에

특정 클라이언트가 공유필드를 변경하는 것을 조심해야 한다.

