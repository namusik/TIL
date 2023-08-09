# DI(Dependency Injection)
의존관계 주입

## 정의
IoC를 구현하는 패턴 중 하나이다.

객체의 의존관계를 역전된 제어가 설정한다.

## 개념
자바의 다형성, OCP, DIP를 가능하도록 지원해준다.

기존에는 다형성만으로 OCP, DIP를 지키기 어려웠다.
[다형성의 문제점](../../Java/객체지향/객체지향%20특징.md)

DI를 활용하면, 클라이언트의 코드 변경없이 확장이 가능하다.

구현 객체를 생성하고, 지정해주는 책임을 가지는 별도의 클래스를 생성해주면 된다.

의존관계를 마치 외부에서 주입해주는 것 같다 해서, DI 의존관계 주입이라 부른다.

## 정적 vs 동적 의존관계
정적인 클래스 의존관계
>import 코드만 보고도 판단할 수 있는 의존관계. 애플리케이션 실행 없이도 알 수 있다.

동적인 객체 인스턴스 의존관계
> 실행 시점(런타임)에 정해지는 의존관계. 외부에서 정해준다.

## 의의
DI를 사용하면, 정적 클래스 의존관계를 변경하지 않고, 동적인 객체 인스턴스 의존관계를 변경할 수 있다.

SOLID를 지킬 수 있게 된다. 

SRP
>기능을 실행하는 클라이언트, 구현 객체를 생성하고 연결해주는 AppConfig

OCP
>구현체가 바뀌어도 클라이언트 코드는 수정되지 않아도 됨. AppConfig 코드만 변경됨.

DIP
>클라이언트가 Interface에만 의존하도록 변경됨.

## 의존관계 수동 주입
[baeldung](https://www.baeldung.com/constructor-injection-in-spring)

인스턴스화 시점에 클래스에 필요한 components들을 전달한다.

~~~java
public class MemberServiceImpl implements MemberService{
    private final MemberRepository memberRepository;

    public MemberServiceImpl(MemberRepository memberRepository) {
        this.memberRepository = memberRepository ;
    }
}
~~~

~~~java
public class MemoryMemberRepository implements MemberRepository{}
~~~

~~~java
@Configuration
public class AppConfig {
    @Bean
    public MemberService memberService() {
        return new MemberServiceImpl(new MemoryMemberRepository());
    }
}
~~~
1. `MemberServiceImpl`의 생성자를 만들어준다. 
2. 이 때, field로 `MemberRepository`를 가지고 있기 때문에, 매개변수로 받아준다.
3. `AppConfig`에서 `MemberService`(`MemberServiceImpl`의 Interface)를 반환하는 Method를 하나 만들어준다.
4. `MemberServiceImpl`의 생성자를 호출해서 return한다.
5. 이때, 생성자의 인수로 `MemberRepository`의 구현체인 `MemoryMemberRepository`를 넣어준다.
6. `MemberService`반환 타입은 부모이기 때문에 자식인 `MemberServiceImpl`를 받을 수 있다.

이제 어디선가 AppConfig의 `memberSerive()`를 조회하면, `MemberService`와 `MemberRepository`의 구현체 값이 들어간다.
 
## 의존관계 자동 주입

### 생성자 주입
~~~java
public class MyClass{
    private final MyRepository myrepository;

    @Autowired
    public MyClass(MyRepository myrepository){
        this.myrepository = myrepository;
    }
}
~~~
생성자 위에 `@Autowired` 사용

>생성자 호출시점에 딱 1번 호출되는 것이 보장된다. 

>불변,필수 의존관계에 주로 사용. 특히 final 의존관계

생성자가 1개만 있을 때는 `@Autowired` 생략 가능

생성자 주입법을 쓰면 스프링 빈 등록과 동시에 의존관계 주입이 같이 일어나게 된다. 빈 등록을 하면서, new 생성자를 쓰게 되는데 이때 객체들이 매개변수로 들어가기 때문에.

### 수정자(Setter) 주입
~~~java
public class MyClass{
    private MyRepository myrepository;

    @Autowired
    public void setMyRepository(MyRepository myrepository){
        this.myrepository = myrepository;
    }
}
~~~
Setter 위에 `@Autowired` 사용

그리고 초기화를 안해주기 때문에, 필드에 final이 빠진다.

선택적으로 의존관계 주입이 가능해서 스프링 빈이 등록 안되었는 객체를 쓸 수 도 있다. `@Autowired(required=false)`

수정자 주입법을 쓰면, 스프링 빈 등록이 모두 끝난 후에, @Autowired를 읽으면서 의존관계가 주입된다.  

## 필드 주입법
~~~java
public class MyClass{
    @Autowired
    private MyRepository myrepository;
}
~~~
필드 위에 바로 `@Autowired`를 써준다.
역시, 초기화를 안하기 때문에 final을 빼준다.

스프링이 없으면 사용이 불가능한 치명적 단점이 있다. 순수한 자바코드로 테스트 불가.

`@SpringBootTest` 테스트 코드 혹은 `@Configuration`을 제외하고는 **사용하지 않는게 낫다.**

## 일반 메서드 주입
~~~java
public class MyClass{
    private MyRepository myrepository;

    @Autowired
    public void init(MyRepository myrepository){
        this.myrepository = myrepository;
    }
}
~~~
그냥 아무 메서드를 사용.

## 생성자 주입을 써야하는 이유
* 대부분의 의존관계는 불변이다. 바뀔일이 거의 없음.
* 자바 순수 테스트 코드에서 컴파일 오류를 확인하기 위해
* `final` 키워드를 사용해서 역시 자동주입 누락에 대해 컴파일 오류 확인 가능

## @RequiredArgsConstructor
Lombok 라이브러리를 통해 사용 가능
final이 붙은 필드를 모아서 생성자를 자동을 만들어준다.

## 참고
[baeldung](https://www.baeldung.com/tag/spring-di)

https://www.baeldung.com/inversion-control-and-dependency-injection-in-spring#what-is-dependency-injection