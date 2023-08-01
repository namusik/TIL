# Why We Need Lambda Expressions in Java

[출처](https://dzone.com/articles/why-we-need-lambda-expressions)

Java 8 in Actoin 저자 중 한명인 Mario Fusco의 글.
2013년에 쓰인 글로 현재의 분위기와 맞지 않을 수 도 있습니다.

### External vs. internal iteration
~~~java
List<Integer> numbers = Arrays.asList(1, 2, 3, 4, 5, 6);
for (int number : numbers) {
    System.out.println(number);
}
~~~
기존에 자바 개발자들은 단 하루도 이러한 코드를 짜지 않은 적이 없을 것이다. 

외부에서 Collection을 반복하고, item을 하나 하나씩 명시적으로 꺼내서 처리했다.

람다 표현식으로 통해 internal iteration을 하면, 
JIT compiler가 병렬을 통해 처리하든, 다른 순서로 처리하든 최적화 할 수 있다.

왜 자바 개발자는 internal iteration에 익숙지 않을까.
~~~java
numbers.forEach((Integer value) -> System.out.println(value));
~~~

compiler는 자동으로 위의 lambda가 functional interface의 구현되지 않은 abstract method와 같은 것임을 알아낸다. 

생성된 bytecode가 다르더라도 람다 표현식을 instance로 인식한다. 

### Passing behaviors, not only values
람다 표현식을 다른 함수에 전달하는 것은 단순히 값 뿐만 아니라 행동을 전달할 수 있게 해준다. 

이를 통해 추상화 수준을 획기적으로 높이고 보다 일반적이고 유연하며 재사용 가능한 API를 만들 수 있다.

### Efficiency through laziness
internal iteration의 또 다른 이점은 lazy evaluation이다.

~~~java
List<Integer> numbers = Arrays.asList(1, 2, 3, 4, 5, 6);

for (int number : numbers) {
    if (number % 2 == 0) {
        int n2 = number * 2;
        if (n2 > 5) {
            System.out.println(n2);
            break;
        }
    }
}
~~~
이 코드의 문제점은 한번에 너무 많은 것을 하고 있고, 깊게 중첩되어있다. 그래서 코드를 읽고 유지하기가 어렵다. 

이 코드들을 각각의 method로 분리해서 개선해본다면
~~~java
public boolean isEven(int number) {
    return number % 2 == 0;
}

public int doubleIt(int number) {
    return number * 2;
}

public boolean isGreaterThan5(int number) {
    return number > 5;
}

List<Integer> l1 = new ArrayList<Integer>();
for (int n : numbers) {
    if (isEven(n)) l1.add(n);
}

List<Integer> l2 = new ArrayList<Integer>();
for (int n : l1) {
    l2.add(doubleIt(n));
}

List<Integer> l3 = new ArrayList<Integer>();
for (int n : l2) {
    if (isGreaterThan5(n)) l3.add(n);
}

System.out.println(l3.get(0));
~~~
뭔가 중첩이 줄어든 것 같지만, 이 2번째 코드가 첫번째 코드보다 좋은 코드라고 할 수 있을까?
2번째 코드는 정답을 얻기까지 불필요한 계산을 하게 된다. 

첫번째 코드가, 4번째만에 결과를 얻는다면 
두번째 코드는 리스트 전체를 돌고 계산한다.

Stream을 쓰면 이러한 문제를 해결할 수 있다. Collection에서 stream() 메서드를 통해 Stream 객체를 만들 수 있다.

~~~java
System.out.println(
    numbers.stream()
            .filter(Lazy::isEven)
            .map(Lazy::doubleIt)
            .filter(Lazy::isGreaterThan5)
            .findFirst()
);
~~~
stream과 lambda를 써서 개선한 코드이다. 

이를 통해 이점을 얻을 수 있는데, 
1. laziness를 통해 CPU를 낭비하지 않는다. 4번 째 순서까지만 계산해도 답을 도출할 수 있다.
2. findFirst()의 응답으로 Optional을 반환한다. Optional을 공부해보면 이점을 알 수 있다.

### The loan pattern
자바에서 함수형 프로그래밍을 더 잘 활용하고, 특히 더 나은 캡슐화를 달성하고 반복을 피하기 위함을 보여주는 예시이다.

~~~java
public class Resource {

    public Resource() {
        System.out.println("Opening resource");
    }

    public void operate() {
        System.out.println("Operating on resource");
    }

    public void dispose() {
        System.out.println("Disposing resource");
    }
}
Resource resource = new Resource();
resource.operate();
resource.dispose();
~~~
resource를 만들고, 작동 시키고, 누수를 피하기 위해 폐기하는 메서드 들이다. 

여기에는 문제가 있다.
~~~java
Resource resource = new Resource();
try {
    resource.operate();
} finally {
    resource.dispose();
}
~~~
operate()를 하는동안 RuntimeException이 발생할 수 도 있기에, 무조건 despose()가 실행되게 하려면 finally block으로 감싸야 한다.

하지만, 여전히 문제가 있는데 DRY(Don't Repeat Yourself) 원칙을 위반한다. 위 코드를, 사용되는 모든 곳에 적어주는 반복을 해야한다.

~~~java
public static void withResource(Consumer<Resource> consumer) {
    Resource resource = new Resource();
    try {
        consumer.accept(resource);
    } finally {
        resource.dispose();
    }
}

withResource(resource -> resource.operate());
~~~
반복을 피하기 위해 코드를 interface의 static method로 만들었다. 생성자를 private하게 만들어 이 method를 통해서만 쓸 수 있도록 강제하였다.

그리고, Consumer functional interface를 매개변수로 받는다.