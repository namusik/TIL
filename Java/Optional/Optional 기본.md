# Optional\<T>

[공식문서](https://docs.oracle.com/en/java/javase/20/docs/api/java.base/java/util/Optional.html)
[oracle article](https://www.oracle.com/technical-resources/articles/java/java8-optional.html)
[baeldung guide](https://www.baeldung.com/java-optional)

## 설명
Null이 될 수 있는 값을 감싸는 Wrapper 클래스.
Java8에 도입되었다.

NullPointerException을 방지하기 위해.
Null 체크 로직 때문에 떨어진 코드 가독성과 유지 보수성.

## Tip
1. Optional을 최대 1개의 원소를 가지고 있는 특별한 Stream이라고 생각하자. Stream과 사용방법이나 사상이 유사하다.

## 사용법

### Optinal 객체 만들기

#### 1. Optional 빈값 생성하기
~~~java
Optional<String> opt = Optional.empty();
~~~
내부에 빈값으로 생성해주는 empty()메서드를 가지고 있다.

#### 2. 절대 Null이 아닌 경우
~~~java
Optional<String> op = Optional.of("aa");
~~~
여기서는 오히려 null을 값으로 넣으면 NPE 발생

#### 3. null 일수도 있는 경우
~~~java
String name = "baeldung";
String name = null
Optional<String> op = Optional.ofNullable(name)
~~~
`ofNullable`을 사용하면
 non-null, null 모두 사용 가능하다.

그런데, 보통 ofNullable()에 직접적으로 null을 넣지는 않는다. empty()를 사용하면 되기 때문에.

### optional null checking
#### isPresent()
~~~java
Optional<String> opt = Optional.of("Baeldung");
assertTrue(opt.isPresent());
~~~
`isPresent()`는 null이 아닌경우 true 반환

#### isEmpty()
~~~java
Optional<String> opt = Optional.of(null);
assertTrue(opt.isEmpty());
~~~
`isEmpty()`는 반대로 null이면 true를 반환

### ifPresentOrElse()
~~~java
Optional<String> opt = Optional.empty();
opt.ifPresentOrElse(name -> System.out.println(name.length()),
                    ()-> System.out.println("null 입니다."));
~~~
present인 경우 진행할 if문을 함수형으로 변경. 

값이 존재하는 경우의 행동을 첫번째 인자로, 존재하지 않는 경우에 처리할 람다함수를 두 번째 인자로 받는다.

### Optional 값 가져오기
#### get()
Optional의 값을 가져온다.
치명적인 문제는 Optional이 null인 경우, exception이 발생한다. 

#### orElse()
~~~java
String nullName = null;
String name=Optional.ofNullable(nullName).orElse("john");
~~~

값을 가져올 때 orElse()를 사용해서 null인 경우의 값을 지정해줄 수 도 있다.

그냥 .get()으로 값을 가져올 수 도 있는데 대신 null이면 NPE 발생.

#### orElseGet()
~~~java
String nullName = null;
String name = Optional.ofNullable(nullName).orElseGet(() -> "john");
~~~
전체적으로 orElse()와 동일한 기능을 하지만,
supplier 함수형 인터페이스를 인자로 받는다.

#### orElse vs orElseGet

orElse

    파라미터로 return할 값 자체를 받음
    함수가 파라미터로 들어오면, 함수가 실행이 되고 return값을 파라미터로 넣어줌.
    null이 아니더라도 함수가 실행됨.
    불필요한 cost가 발생하게 된다.

orElseGet

    파라미터로 람다(함수형 인터페이스)를 받음
    함수가 실행되지 않고 함수 자체가 파라미터 됨. 
    null이 아니면 함수가 실행되지 않음. -> 지연 로딩 가능

#### orElseThrow()
~~~java
String nullName = null;
String name = Optional.ofNullable(nullName).orElseThrow(
    IllegalArgumentException::new);
~~~

default value를 반환하는 것이 아니라, 
exception을 throw한다.

Java10에서 예외를 직접 던지지 않으면,  NoSuchElementException을 throw하는 기능이 추가되었다.

#### or()
~~~java
String expected = "properValue";
Optional<String> value = Optional.of(expected);
Optional<String> defaultValue = Optional.of("default");

Optional<String> result = value.or(() -> defaultValue);
~~~
Optional이 null일 경우, Optinal 객체를 return 하는 method.
orElseGet()과 같이 lazy loading이 적용된다.

따라서, 인자로 Optional을 반환하는 람다를 넣어줘야 한다.

메서드 체인 중간에 쓰일 수 있다.

### filter()
~~~java
Integer year = 2016;
Optional<Integer> yearOptional = Optional.of(year);
boolean is2016 = yearOptional.filter(y -> y == 2016).isPresent();
assertTrue(is2016);
boolean is2017 = yearOptional.filter(y -> y == 2017).isPresent();
assertFalse(is2017);
~~~
filter method로 일종의 inline test를 돌린다.
`y==2016` 해당 조건에 일치하면(true이면) 해당 Optional을 반환하고, 

일치하지 않으면 empty Optional이 반환된다.

### map()
~~~java
List<String> companyNames = Arrays.asList(
    "paypal", "oracle", "", "microsoft", "", "apple");
Optional<List<String>> listOptional = Optional.of(companyNames);

int size = listOptional
    .map(List::size)
    //.map(y -> y.size()) method reference로 바뀜.
    .orElse(0);
~~~
Optional의 값을 바꿔버린다.

map()에는 Function 인터페이스가 들어가는데,
현재 존재하는 value를 받아서 함수를 실행하고
결과로 나온 value를 Optional로 감싸서 return한다.
결과가 null이면 empty Optional을 return한다.

위의 예제에서는 List.size()의 return값을 Optional로 wrap해서 반환한다.

map()을 주로 filter()와 결합해서 강력한 효과를 낸다.

#### flatMap()
map()과 동일한 기능을 하지만, 반환에 있어서 차이가 있다.

map()은 return값에 Optional을 감싸서 반환하는데, 만약 return 값이 Optional이면 
`Optional\<Optional<T>>` 이렇게 nested Optional이 되어 버린다.

그래서 값을 얻기 위해서는 2번 처리해줘야 하는 번거로움이 있다. 

하지만, flatMap()은 애초에 함수 return값이 Optional\<T>인 경우만 인자로 받아서 그대로 반환하기 때문에, nested Optional이 되지 않는다.

### stream()
~~~java
Optional<String> value = Optional.of("a");

List<String> collect = value.stream().map(String::toUpperCase).collect(Collectors.toList());
~~~
Optional 객체를 Stream 객체로 변환.
Optional 비어있다면 empty Stream을 만든다.

## 주의점

> Optinal을 쓰고 null check를 하지 말자 
무의미한 짓.

>Optional은 반환 타입으로만 사용해야 한다. 
Optional을 method의 parameter 타입이나, field type으로 쓰지 말자. Null 자체가 넘어오면 대응불가.

>Optional 변수에 null을 넣지 말자. empty()를 쓰자




## 출처
https://mangkyu.tistory.com/70

https://www.daleseo.com/java9-optional/