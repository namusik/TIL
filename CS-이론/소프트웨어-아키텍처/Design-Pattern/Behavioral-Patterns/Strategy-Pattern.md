# Strategy Pattern (전략 패턴)

> 최종 업데이트: 2026-03-24 | 분류: GoF Behavioral Pattern

## 개념

행동(알고리즘)을 별도의 클래스로 캡슐화하여, 런타임에 동적으로 교체할 수 있게 하는 패턴.

- Context는 알고리즘의 구체적인 구현을 모른 채 Strategy 인터페이스를 통해 실행한다
- 새로운 알고리즘 추가 시 기존 코드를 수정하지 않는다 (**OCP**)
- 각 알고리즘이 별도 클래스로 분리되어 하나의 책임만 갖는다 (**SRP**)

## 쉽게 이해하기
- 네비게이션 앱을 떠올리면 됨
  - 같은 목적지라도 "최단 경로", "최소 요금", "최소 환승" 등 **경로 탐색 알고리즘을 사용자가 선택**
  - 앱(Context)은 어떤 알고리즘이 쓰이는지 몰라도 되고, 선택된 전략에게 위임만 하면 됨
  - 새로운 경로 옵션이 추가돼도 앱 코드를 수정할 필요 없이 전략 클래스만 추가
- State 패턴과 구조가 거의 같지만, **Strategy는 클라이언트가 직접 전략을 골라 꽂아주는 것**이고 State는 내부 상태에 따라 자동 전환되는 것

## 구조

```
┌──────────────────┐       ┌──────────────────────┐
│     Context      │       │  <<interface>>        │
│                  │──────→│     Strategy          │
│ - strategy       │       │ + execute()           │
│ + setStrategy()  │       └──────────────────────┘
│ + doWork()       │               △
└──────────────────┘       ┌───────┼───────┐
                           │       │       │
                    ┌──────┴──┐ ┌──┴─────┐ ┌┴─────────┐
                    │StrategyA│ │StrategyB│ │StrategyC │
                    │+execute│ │+execute │ │+execute  │
                    └────────┘ └─────────┘ └──────────┘
```

| 구성 요소 | 역할 |
|----------|------|
| Strategy (인터페이스) | 알고리즘의 공통 인터페이스 정의 |
| ConcreteStrategy | Strategy를 구현한 실제 알고리즘 클래스 |
| Context | Strategy를 사용하는 객체. 구체적 구현을 알지 못함 |

## 코드 예시

### 결제 시스템

```java
// Strategy 인터페이스
public interface PaymentStrategy {
    void pay(int amount);
}

// ConcreteStrategy
public class CreditCardPayment implements PaymentStrategy {
    private final String cardNumber;

    public CreditCardPayment(String cardNumber) {
        this.cardNumber = cardNumber;
    }

    @Override
    public void pay(int amount) {
        System.out.println(amount + "원 신용카드 결제 (카드: " + cardNumber + ")");
    }
}

public class KakaoPayPayment implements PaymentStrategy {
    @Override
    public void pay(int amount) {
        System.out.println(amount + "원 카카오페이 결제");
    }
}

// Context
public class PaymentService {
    private PaymentStrategy strategy;

    public void setStrategy(PaymentStrategy strategy) {
        this.strategy = strategy;
    }

    public void checkout(int amount) {
        strategy.pay(amount);
    }
}
```

```java
// 사용
PaymentService service = new PaymentService();

service.setStrategy(new CreditCardPayment("1234-5678"));
service.checkout(50000);  // 50000원 신용카드 결제

service.setStrategy(new KakaoPayPayment());
service.checkout(30000);  // 30000원 카카오페이 결제
```

- 새로운 결제 방식 추가 시 `PaymentStrategy` 구현체만 만들면 된다
- `PaymentService`는 수정할 필요 없음

### Spring에서의 활용

Spring의 DI 자체가 Strategy 패턴과 동일한 구조이다.

```java
@Service
public class OrderService {
    private final PaymentStrategy paymentStrategy;

    // 생성자 주입으로 전략 교체
    public OrderService(PaymentStrategy paymentStrategy) {
        this.paymentStrategy = paymentStrategy;
    }

    public void order(int amount) {
        paymentStrategy.pay(amount);
    }
}

@Configuration
public class PaymentConfig {
    @Bean
    public PaymentStrategy paymentStrategy() {
        return new KakaoPayPayment();  // 설정으로 전략 교체
    }
}
```

## Java 표준 라이브러리의 Strategy 패턴

| 사용처 | Strategy | 설명 |
|--------|----------|------|
| `Collections.sort(list, comparator)` | `Comparator<T>` | 정렬 알고리즘을 외부에서 주입 |
| `Stream.sorted(comparator)` | `Comparator<T>` | 스트림 정렬 전략 |
| `Arrays.sort(arr, comparator)` | `Comparator<T>` | 배열 정렬 전략 |
| `ExecutorService` | `RejectedExecutionHandler` | 작업 거부 전략 |

```java
// Comparator = Strategy
List<String> names = List.of("Charlie", "Alice", "Bob");

// 전략 1: 알파벳 순
names.stream().sorted(Comparator.naturalOrder());

// 전략 2: 길이 순
names.stream().sorted(Comparator.comparingInt(String::length));

// 전략 3: 역순
names.stream().sorted(Comparator.reverseOrder());
```

## Strategy vs 다른 패턴 비교

| 패턴 | 차이점 |
|------|--------|
| **Template Method** | 상속으로 알고리즘의 일부를 변경. Strategy는 조합(위임)으로 전체 알고리즘을 교체 |
| **State** | 구조는 유사하지만, State는 상태에 따라 자동 전환. Strategy는 클라이언트가 명시적으로 선택 |
| **Command** | 요청 자체를 객체로 캡슐화. Strategy는 같은 목적의 다른 알고리즘을 캡슐화 |
