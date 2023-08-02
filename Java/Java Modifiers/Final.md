# Final
[baeldung](https://www.baeldung.com/java-final)

## 개념
확장성에 제한을 둬야 할 때.

## Final Classes
`final`이 붙은 class는 확장될 수 없다.

~~~java
public final class String{}
~~~
자주 쓰는 String 클래스를 보면 final이 붙어 있다.
String 클래스를 상속하고, 메서드를 override 해버리면 여기저기서 쓰이는 String을 예측할 수 없다.
그래서, String에 final이 붙은 이유이다.

final 클래스를 상속하려 하면, compile error가 발생한다.
**`Cannot inherit from final ...`**

>클래스에 final이 붙어있다고, field가 불변인 것은 아니다. 

## Final Methods
final이 붙은 method는 override가 불가능하다.

그래서, 클래스는 상속되게 하고싶지만, 그 안에 변경되지 말아야할 method가 있다면 final을 붙인다.

또한, A method가 B method에서 호출되는 형태라면 final로 해두는 것이 B method에 
영향을 끼치지 않는다. 특히, 상속자에서 method를 호출하는 경우.

~~~java
public class Thread{
    public final native boolean isAlive();
}
~~~
그 예로, Thread 클래스를 상속할 수 있지만, isAlive()는 override 불가능하다.
이유는 Native Code이기 때문에.

## Final Variables
변수에 final이 붙으면, 한번 초기화되면 값을 바꾸는 것이 불가능하다.

#### Final Primitive Variables
final이 붙은 기본형 타입 변수는 재할당이 불가능하다.

#### Final Reference Variables
final이 붙은 객체(참조형 변수) 역시 재할당이 불가능하다. 보통 New를 의미.

하지만, 객체의 field는 재할당이 가능하다. (물론, final이 붙지 않은 field에 한해서)

#### Final fields
Final fields는 2가지 경우로 볼 수 있다. 
1. **constant**(상수)
   1.  보통 `static final`을 붙인다.
   2.  상수의 변수명은 대문자와 언더스코어의 조합으로
2. **write-once fields**(final이 붙은 field)

둘을 나누는 기준은 객체를 직렬화 했을때 포함 안 되면 상수.

>모든 final이 붙은 field는 생성자가 완료되기 전에 초기화 되어야 한다.

**static final fields**(상수)를 초기화 하는 방법은 
1. 선언과 동시에
2. static initializer block에서

**instance final fields**를 초기화 하는 방법은
1. 선언과 동시에
2. instance initializer block에서
3. 생성자를 통해

그리고 한번, 초기화되면 값을 변경할 수 없다.

#### Final Arguments
method의 매개변수에도 final을 붙일 수 있다. 
이 경우, method 내부에서 final 인수를 변경할 수 없다.

## effectively final
https://www.baeldung.com/java-effectively-final

Java 8에 도입된 개념.

변수에 final이 붙지 않았지만, 선언된 후 참조가 변경되지 않는 경우.

#### 나오게 된 이유
사실, final이 붙이지 않더라도 객체나 값을 변경하지 않는 이상 사실상 final이 붙은 거나 마찬가지라 할 수 있다.

기존에 익명 클래스에는 non-final 지역변수를 사용할 수 없었다.

물론 여전히 익명 클래스, 내부 클래스, 람다 표현식에는 하나 이상의 값이 할당된 변수를 쓰지 못한다.

하지만, effectively final 개념을 통해 더이상 final 제어자를 쓰지 않아도 되었으며 타자를 줄여주었다.

#### final vs effectively final
사실 effectively final이 될 수 있는지 가장 쉽게 알아보는 방법은 final을 없애보는 것이다.
만약, compile 오류가 발생하면 final을 붙여야만 하는 것이다.

붙어있는 final을 떼거나, final을 붙여도 compile 오류가 없다면 이것은 effectively final이라 할 수 있다.


## final의 퍼포먼스 영향
https://www.baeldung.com/java-final-performance

## 참고
https://velog.io/@snack655/Java-Fire%ED%95%9C-Effectively-Final%EC%9D%B4%EB%9E%80
