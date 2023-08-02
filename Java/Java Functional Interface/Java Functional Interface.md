# Java Functional Interface(함수형 인터페이스)

## 정의
**SAM(Single Abstract Method)**, 하나의 추상 메서드를 가지고 있는 interface

그리고 functional interface의 구현을 하는 방식이
`람다 표현식`이다.

~~~java
Consumer<Integer> method = 
n -> System.out.println(n);
~~~
람다 표현식을 하나의 변수에 대입할 때 사용하는 참조 변수의 타입을 functional interface라고 부른다.

참고로, interface의 default, static 는 abstract method가 아니기 때문에 개수에 포함되지 않는다.

~~~java
@FunctionalInterface
interface Calc { // 함수형 인터페이스의 선언
    public int min(int x, int y);
}

public class Lambda02 {
public static void main(String[] args){
        Calc minNum = (x, y) -> x < y ? x : y; // 추상 메소드의 구현
        System.out.println(minNum.min(3, 4));  // 함수형 인터페이스의 사용
    }
}
~~~

## @FunctionalInterface
모든 functional interface들은 @FunctionalInterface 가지고 있다.

이를 통해, 이 interface가 functional interface라고 명시해주고, 

또한 compiler가 해당 interface를 functional interface로 인식해서 조건을 만족하는지 검사한다.



## 표준 함수형 인터페이스
### Supplier
~~~java
@FunctionalInterface 
public interface Supplier<T> { 
  T get(); 
}
~~~
매개변수를 받지 않고 제네릭 타입 객체를 반환한다.

`Supplier`는 주로 값의 `lazy generation`를 위해 사용한다. Supplier는 값의 공급자 역할을 하게 된다.
~~~java
public double squareLazy(Supplier<Double> lazyValue) {
    return Math.pow(lazyValue.get(), 2);
}
Supplier<Double> lazyValue = () -> {
    Uninterruptibles.sleepUninterruptibly(1000, TimeUnit.MILLISECONDS);
    return 9d;
};
Double valueSquared = squareLazy(lazyValue);
~~~
위의 예시를 보면, Supplier를 통해 인수를 지연 생성할 수 있다.

또한, Supplier는 시퀀스 생성을 위한 로직을 정의하는데 사용된다.

~~~java
int[] fibs = {0, 1};
Stream<Integer> fibonacci = Stream.generate(() -> {
    int result = fibs[1];
    int fib3 = fibs[0] + fibs[1];
    fibs[0] = fibs[1];
    fibs[1] = fib3;
    return result;
});
~~~
위는 피보나치 수열을 생산하는 method이다.
Supplier가 sequence를 구현하고 있다.

### Consumer
~~~java
@FunctionalInterface
public interface Consumer<T> {
  void accept(T t);
}
~~~
반환타입이 void이다. 
매개변수를 받고 동작만 하고 return은 하지 않는 case이다.
예시, 
~~~java
List<String> names = Arrays.asList("John", "Freddy", "Samuel");
names.forEach(name -> System.out.println("Hello, " + name));
~~~
List의 원소를 매개변수로 받아 sout를 동작하는 경우이다. return이 없음.

`BiCounsumer`라는 변형 interface도 존재하는데
~~~java
HashMap.forEach(BiConsumer<? super K, ? super V> action)
~~~
매개변수를 2개 받을 때 사용한다. 주로 Map에서 key와 value를 받는다.

### Function
~~~java
@FunctionalInterface
public interface Function<T, R> {
  R apply(T t);
}
~~~
가장 간단하고 일반적인 case.

T타입을 파라미터로 하나를 받아서, R타입 값을 하나 return한다.

`Consumer와` `Supplier`의 조합이라 할 수 있다.

~~~java
Function<Integer, String> intToString = Object::toString;
Function<String, String> quote = s -> "'" + s + "'";

Function<Integer, String> quoteIntToString = quote.compose(intToString);
~~~
`Function`의 compose()는 2개의 람다표현식을 순서대로 동작하게 도와준다.

매개변수로 받는 inToString이 먼저 실행되게 된다.

`Stream.map()`이 `Function interface`를 사용하는 예이다.

## UnaryOperator
Operator 계열 interface.
신기하게 기본 Operator interface는 없다.

~~~java
@FunctionalInterface
public interface UnaryOperator<T> extends Function<T, T> {
    static <T> UnaryOperator<T> identity() {
        return t -> t;
    }
}
~~~
Function과 똑같지만, 인자의 타입과 return의 타입이 같아야 한다.

~~~java
List<String> names = Arrays.asList("bob", "josh", "megan");

names.replaceAll(name -> name.toUpperCase());
~~~
List의 원소를 받아 수정을 거친 후 그대로 같은 타입으로 반환하는  경우 쓰인다.


### Predicate
~~~java
@FunctionalInterface
public interface Predicate<T> {
  boolean test(T t);
}
~~~
매개변수를 받아 논리를 진행한 후, boolean을 반환하는 case이다.

~~~java
List<String> names = Arrays.asList("Angela", "Aaron", "Bob", "Claire", "David");

List<String> namesWithA = names.stream()
  .filter(name -> name.startsWith("A"))
  .collect(Collectors.toList());
~~~
가장 흔한 예로, stream의 filter()가 있다.



## Legacy Functional Interfaces

Java 8 이전에도, functional interface의 제약을 따르는 interfacer가 있었다. 

동시성 API에 사용되는 `Runnable`, `Callable` interface가 대표적이다. 

~~~java
Thread thread = new Thread(
    () -> System.out.println("Hello"));
thread.start();
~~~
Thread의 생성자를 보면 Runnable을 매개변수로 받는다.

Java8 이후로, 해당 interface에 @FunctionalInterface 애노테이션이 붙게 되었다.

## 출처
https://www.baeldung.com/java-8-functional-interfaces

https://developer-talk.tistory.com/460