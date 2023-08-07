# DI(Dependency Injection)

## 정의
의존관계 주입

## 의의
자바의 다형성, OCP, DIP를 가능하도록 지원해준다.

기존에는 다형성만으로 OCP, DIP를 지키기 어려웠다.
[다형성의 문제점](../../Java/객체지향/객체지향%20특징.md)

DI를 활용하면, 클라이언트의 코드 변경없이 확장이 가능하다.

구현 객체를 생성하고, 지정해주는 책임을 가지는 별도의 클래스를 생성해주면 된다.

의존관계를 마치 외부에서 주입해주는 것 같다 해서, DI 의존관계 주입이라 부른다.

### 생성자 주입

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
public class AppConfig {
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


### 정적 vs 동적 의존관계
정적인 클래스 의존관계
>import 코드만 보고도 판단할 수 있는 의존관계. 애플리케이션 실행 없이도 알 수 있다.

동적인 객체 인스턴스 의존관계
> 실행 시점(런타임)에 정해지는 의존관계. 외부에서 정해준다.

### 결론
DI를 사용하면, 정적 클래스 의존관계를 변경하지 않고, 동적인 객체 인스턴스 의존관계를 변경할 수 있다.

SOLID를 지킬 수 있게 된다. 

SRP
>기능을 실행하는 클라이언트, 구현 객체를 생성하고 연결해주는 AppConfig

OCP
>구현체가 바뀌어도 클라이언트 코드는 수정되지 않아도 됨. AppConfig 코드만 변경됨.

DIP
>클라이언트가 Interface에만 의존하도록 변경됨.

ㅇ