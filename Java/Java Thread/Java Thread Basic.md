# Java Thread

## 정의
**program**을 실행하면 OS로부터 실행에 필요한 자원(메모리)를 할당받는다.
그러면 **process**(실행중인 프로그램)이 된다.

process는 데이터, 메모리, 쓰레드로 구성이 되어있다. 

process의 자원을 이용해서 실제로 작업을  수행하는 것이 바로 **쓰레드**이다.

일종의 일꾼 역할.

![process](../../Images/Java/process.png)

프로세스에는 최소 하나 이상의 쓰레드가 존재한다. 만약 쓰레드가 여러개 있으면 **멀티쓰레드 프로세스**라고 부른다.

## 멀티태스킹과 멀티쓰레딩
멀티태스킹(multi-tasking) : 여러개의 프로세스가 동시에 실행
멀팅쓰레딩(multi-threading) : 여러개의 쓰레드가 동시에 작업 수행

사실 CPU의 Core는 한 번에 단 하나의 작업만 수행가능하다. 여러개의 작업을 아주 짧은 시간동안 번갈아 수행함으로써 여러 작업이 동시에 수행되는 것처럼 보이게 한다.

만약, 서버가 싱글쓰레드였다면 모든 사용자의 요청마다 각각 프로세스를 생성해야 했을 것이다. 프로세스의 생성 비용은 쓰레드보다 훨씬 비싸다.

## 특징 
> 쓰레드의 개수에는 제한이 없다. 
하지만, 쓰레드는 개별적인 메모리 공간(호출스택)을 필요로 하기 때문에, 프로세스의 메모리 한계에 영향을 받는다.

> Java의 main()도 쓰레드 이다. 그래서 **메인쓰레드**라고 불린다.

> 실행중인 **user thread**(사용자 쓰레드)가 없을 때, 프로그램이 종료된다.

## Java에서의 Thread 구현 방법
### Runnable interface 구현

`Runnable` interface에는 `run()`만 정의되어있다.

~~~java
@FunctionalInterface
public interface Runnable {
    public abstract void run();
}
~~~

Java8부터 단일 추상 메서드만 있는 인터페이스는 함수형 인터페이스로 취급된다. 
**@FunctionalInterface**가 붙어있는 것을 알 수 있다.

따라서, 람다 표현식으로도 구현할 수 있다.

~~~java
public class RunnableImpl implements Runnable{
    @Override
    public void run() {    }
}
~~~

~~~java
Runnable runnable = () -> System.out.println("runnable");
~~~

### Thread class 상속법

~~~java
public class ThreadEx extends Thread{
    @Override
    public void run() {    }
}
~~~

### Runnable 구현 방법을 사용하자
Thread class를 상속받으면, 다른 class를 상속받을 수 없기 때문에 일반적이진 않음.

람다 표현식으로 쓰는 것이 편하다.

## start()와 run()
~~~java
var thread = new Thread(() -> System.out.println("runnable"));

thread.start();
~~~
구현한 thread를 실행할 때, run()이 아닌 start()를 호출하는 이유가 있다.

### run()
![run](../../Images/Java/threadrun.png)

run()을 호출하는 것은 단순히 선언된 메소드를 호출하는 것이다. 생성된 쓰레드를 실행하는 것과 무관하다.

따라서, main()에서 쓰레드의 run()을 호출했을 때는 위처럼 Call Stack에 run()이 올라오게 된다.

### start()
![start](../../Images/Java/threadstart.png)

1. start()를 호출하게 되면, 새로운 쓰레드가 생성이 된다.
2. 새로운 쓰레드가 자신만의 Call Stack을 생성한다.
3. 생성된 Call Stack에 쓰레드의 run()을 첫번 째로 올린다.
4. run() 수행이 종료되면, call stack이 비워지고 사라진다.

쓰레드의 start()가 호출되면 바로 실행되는 것이 아니라, 실행대기 상태에 있다가 자신의 차례가 되어야 실행된다.

**스케줄러**는 쓰레드의 실행대기중인 쓰레드들의 우선순위를 고려하여 실행순서와 실행시간을 결정한다.

> 한 번 실행이 종료된 쓰레드는 다시 실행할 수 없기 때문에, start()는 딱 한 번 호출될 수 있다.


## 참고
자바의 정석

https://www.baeldung.com/java-runnable-vs-extending-thread

https://www.baeldung.com/java-thread-lifecycle

https://www.baeldung.com/java-start-thread