# if문 피하기

## 무자비한 if문 남발 
- 코드를 짜다 보면 분기처리는 필수.
- 하지만 if-else나 switch-case는 객체지향적이지 않을 수 있다.
- 가능한 분기문을 없애야 한다? 객체지항적 사고와 코드를 얻기 위해
  - 중복배제를 지키고, boiler plate 코드를 없애기 위해 노력하자.

## 예시 코드 
1. 중복 코드 메서드로 추출
   1. 메서드 추출은 기존 절차적 프로그래밍에서도 가능한 리팩터링 기법이다.
   2. 그런데 해당 로직을 이 클래스의 책임으로 두는 것이 맞냐는 고민이 필요하다. 
2. 추상화 시각이 필요
   1. 책임을 기반으로 분리할 도메인 로직으 핵심을 직어내야함.
   2. 추상화 -> interface
   3. 추상화 == 일반화
3. 이러한 리팩터링 기법을 **인터페이스 추출** 이라고 한다.
```java
public interface Discountable {
    /** 할인없음 */
    Discountable NONE = new Discountable() {
        @Override
        public long getDiscountAmt(long originAmt) {
            return 0;
        }
    };

    long getDiscountAmt(long originAmt);
}

class NaverDiscountPolicy implements Discountable {
    @Override
    public long getDiscountAmt(long originAmt) {
        return originAmt * 0.1;
    }
}

class DanawaDiscountPolicy implements Discountable {
    @Override
    public long getDiscountAmt(long originAmt) {
        return originAmt * 0.15;
    }
}
```
4. 어떤 구현체를 쓸지 정해주는 팩토리 메서드도 기존 클래스에서 분리하자. 이것도 인터페이스로 추출을 할 수 있다. 이게 simple factory pattern
```java
/** 할인 생성 팩토리 */
public interface DiscounterFactory {
    Discountable getDiscounter(String discountName);
}

public class SimpleDiscounterFactory implements DiscounterFactory {
    @Override
    Discountable getDiscounter(String discountName) {
        if ("NAVER".equals(discountCode)) {   // 네이버검색 할인
            return new NaverDiscountPolicy();
        } else if ("DANAWA".equals(discountCode)) { // 다나와검색 할인
            return new DanawaDiscountPolicy();
        } else if ("FANCAFE".equals(discountCode)) {  // 팬카페 할인
            return new FancafeDiscountPolicy();
        } else {
            return Discountable.NONE;
        }
    }
}
```
위에서 만든 각 할인 정책 구현체를 여기서 사용해주고 있다.

```java
discounterFactory = new SimpleDiscounterFactory();

// 실시간 할인내역 확인
public Discount getDiscount(...) {
    ...
}

// 결제처리
public void payment(...) {
    ...
}

private Discountable getDiscounter(String discountCode) {
    return discounterFactory.getDiscounter(discountCode);
}
```
- 팩토리 인터페이스는 이렇게 가져온다.

## 출처
https://redutan.github.io/2016/03/31/anti-oop-if