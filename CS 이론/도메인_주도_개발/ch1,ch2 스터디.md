# Ch1: 도메인 모델 시작하기

## 1. 도메인이란?

- 온라인 서점을 예로 들 때, 책을 구매하기 위한 여러 과정(검색, 장바구니 담기, 결제, 배송 추적 등)을 하나의 비즈니스 영역(도메인) 으로 볼 수 있다.
- 도메인: **소프트웨어가 해결하고자 하는 문제 영역**

### 1-1. 하위 도메인

하나의 도메인은 여러 하위 도메인으로 나눌 수 있다.

온라인 서점 도메인 → 주문, 결제, 배송, 회원, 혜택, 카탈로그, 정산, 리뷰 등으로 세분화

모든 기능을 직접 구현하지 않는다.

외부 시스템(서비스)와 연동하여 일부 기능 처리

예: 결제는 PG, 배송은 외부 물류 회사 API 사용

대상 고객, 사업 목적에 따라 필요한 하위 도메인을 선택한다.

도메인마다 고정된 하위 도메인이 존재하는것이 아님

예: 소규모 업체는 엑셀을 통해 수작업으로 정산하는 경우 정산 도메인은 필요 없음

## 2. 도메인 전문가와 개발자 간 지식 공유

도메인 전문가란?

**특정 분야(예: 정산, 홍보, 배송 등)의 지식과 경험을 가진 사람**

본인이 원하는 기능을 개발자에게 요구하는 역할

도메인 전문가와 개발자 간 지식 공유를 왜 해야 하는가?

요구사항을 잘못 이해하면 엉뚱한 기능 개발, 일정 지연, 추가 비용 발생

한 번 잘못된 요구사항이 전달되면 고치기 어렵고 많은 시간이 소요

개발자와 도메인 전문가 간 직접 소통이 필수

정확한 요구 → 좋은 결과, 잘못된 요구 → 잘못된 결과 (Garbage in, Garbage out).

## 3. 도메인 모델

### 3-1. 도메인 모델이란?

도메인 모델은 우리가 해결하고자 하는 업무 영역(도메인)을 구체적이고 명확하게 표현한 것이다.

즉, 업무를 이해하고 소프트웨어로 풀기 위해 만든 설계도이다.

도메인 모델이 필요한 이유는 명확한 도메인 모델 없이는 잘못된 시스템이 만들어질 수 있기 때문이다.

개발자와 도메인 전문가 등 이해관계자들이 같은 모델을 보며 소통해야 제대로 된 시스템 개발 가능.

### 3-2. 도메인 모델 표현 방식

객체 기반 모델 (클래스 다이어그램)

데이터와 기능을 함께 표현

상태 다이어그램

시간에 따라 변하는 상태와 흐름을 시각적으로 표현

### 3-3. 개념 모델 vs 구현 모델

#### 개념 모델

도메인을 이해하기 위해 문제를 분석한 결과물.

DB, 트랜잭션 처리, 구현 기술과 같은 것을 고려하지 않기 때문에 코드 작성을 위해서는 구현 모델이 필요

예시

객체기반 모델, 상태 다이어그램

#### 구현 모델

- 코드를 어떻게 만들 것인지 정리한 설계

예시

수도 코드

도메인 객체

## 4. 도메인 모델 패턴

도메인 모델 패턴은, **도메인 계층을 객체 지향 기법으로 구현**하는 패턴을 의미한다.

마틴 파울러가 쓴 “엔터프라이즈 애플리케이션 아키텍처 패턴”에서 정의

도메인 계층은 도메인의 핵심 규칙을 구현한 계층


public enum OrderState { 

		PAYMENT_WAITING {
				public boolean isShippingChangeable() {
						return true;
				}
		},
		
		SHIPPED, DELIVERING, DELIVERY_COMPLETED
		
		public boolean isShippingChangeable() {
				return false;
		}
}


주문 도메인의 일부 기능을 도메인 모델 패턴으로 구현한 예시

PAYMENT_WAITING(주문 대기중) 상태는 배송지를 변경할 수 있고 이외 상태는 배송지를 변경할 수 없다는 도메인 규칙을 구현하고 있다.

## 5. 도메인 모델 도출

- 여기서 이야기하는 도메인 모델은 개념적 모델이 아닌, **실제 코드상의 도메인 객체**를 의미한다.

도메인 모델링을 할 때 기본은 모델을 구성하는 핵심 구성요소, 규칙, 기능을 찾는것이다.

이 과정은 요구사항에서 출발한다.

### 5-1. 요구사항

- 최소 한 종류 이상의 상품을 주문해야 한다.
- 한 상품을 한 개 이상 주문할 수 있다.

총 주문 금액은 각 상품의 구매 가격 합을 모두 더한 금액이다.

각 상품의 구매 가격 합은 상품 가격에 구매 개수를 곱한 값이다.

주문할 때 배송지 정보를 반드시 지정해야 한다.

배송지 정보는 받는 사람 이름, 전화번호, 주소로 구성된다.

출고를 하면 배송지를 변경할 수 없다.

출고 전에 주문을 취소할 수 있다.

고객이 결제를 완료하기 전에는 상품을 준비하지 않는다.

### 5-2. 도메인 모델 일부 구현

주문 항목을 표현하는 OrderLine

public class OrderLine {

    private Product product;
    private int price;
    private int quantity;
    private int amounts;

    public OrderLine(Product product, int price, int quantity) {
        this.product = product;
        this.price = price;
        this.quantity = quantity;
        this.amounts = calculateAmounts();
    }

    private int calculateAmounts() {
        return price * quantity;
    }

    public int getAmounts() {
        return amounts;
    }
}



한 상품 → Product

한 개 이상 → quantity

상품의 구매 가격 → price

구매 가격 합 → amounts

각 상품의 구매 가격 합은 상품 가격에 구매 개수를 곱한 값이다. → ****calculateAmounts()

## 6. 엔티티와 밸류

도출한 모델은 크게 엔티티와 밸류로 구분할 수 있다.

둘의 차이를 명확히 이해해야, 도메인을 올바르게 설계하고 구현할 수 있다.

### 6-1. 엔티티

public class Order {

    private String orderNumber;
    private OrderState orderState;
    private Address address;

    @Override
    public boolean equals(Object obj) {
        ...
        return this.orderNumber.equals(other.orderNumber);
    }

    @Override
    public int hashCode() {
        ...
    }
}



가장 큰 특징은 엔티티 객체마다 고유한 식별자를 가진다는 것

예: 주문 도메인에서, 각 주문은 주문번호를 가진다. 따라서 주문번호가 주문의 식별자가 된다.

주문의 상태값(배송 상태, 주소지)이 변경되어도 주문 번호는 바뀌지 않는다.

엔티티는 식별자로 같은 객체를 구별한다.

식별자는 바뀌지 않고, 고유하기 때문에 식별자가 같으면 같은 엔티티라고 판단할 수 있다.

엔티티는 equals(), hashcode() 오버라이딩을 통해 고유한 값인 식별자를 비교해야 한다.

6-1-1. 엔티티 식별자 생성

도메인의 특징과 사용 기술에 따라 달라지지만 보통 아래와 같은 방식을 이용

특정 규칙에 따라 직접 생성

UUID같은 고유 식별자 생성기 사용

값을 직접 입력 (사용자가 입력하는 아이디 또는 이메일)

일련번호 사용(MySQL의 autoIncrement)

### 6-2. 밸류

프로그래밍 언어에는 원시 데이터 타입(int, long 등)이 있다.

이 원시 데이터 타입만 사용해 시스템을 개발할 수도 있지만 때로는 시스템 특유의 값을 정의해야 할 때가 있다.

이러한 시스템 특유의 값을 표현하기 위해 정의하는 객체를 밸류라고 한다

밸류를 사용하면 아래와 같은 이점을 얻을 수 있다.

의미를 명확하게 표현하여 쉽게 파악 할 수 있다.

밸류 타입을 위한 기능을 추가할 수 있다.

#### 6-2-1. 의미를 명확하게 표현

public class ShippingInfo {

    // 받는 사람 정보
    private String receiverName;
    private String receiverPhoneNumber;

    // 주소 정보
    private String shippingAddress1;
    private String shippingAddress2;
    private String shippingZipcode;
  }


receiverName, receiverPhoneNumber → 개념적으로 받는 사람을 의미

shippingAddress1, shippingAddress2, shippingZipcode → 개념적으로 주소 정보를 의미

public class Receiver { 
		private String name;
		private String phoneNumber;
}


public class Address {
		private String address1; 
		private String address2;
		private String zipcode;
}


public class ShippingInfo { 
		private Receiver receiver; 
		private Address address;
}


- 배송 정보가 받는 사람과 주소로 구성된다는 것을 쉽게 파악할 수 있다.

```java 
// AS-IS
public class OrderLine {
    private Product product;
    private int price;
    private int quantity;
    private int amounts;
}

// TO-BE
public class Money { 
		private int value;
}

public class OrderLine { 
		private Product product; 
		private Money price; 
		private int quantity; 
		private Money amounts;
}
```

- 밸류 타입이 꼭 두 개 이상의 데이터를 가져야 하는 것은 아니다.
- 의미를 명확하게 표현하기 위해 사용해도 된다.

#### 6-2-2. 밸류 타입을 위한 기능 추가

```java
public class Money {

    private int value;
    
    public Money multiply(int multiplier) {
        return new Money(this.value * multiplier);
    }

 }


AS-IS

public class OrderLine {

    private Product product;
    private int price;
    private int quantity;
    private int amounts;

    private int calculateAmounts() {
        return price * quantity;
    }
}



TO-BE

public class OrderLine {

    private Product product;
    private Money price;
    private int quantity;
    private Money amounts;

    private int calculateAmounts() {
        return price.multyply(quantity);
    }
}
```


- 밸류 타입은 아래와 같이 사용하는 것을 권장한다.
- 밸류 타입은 불변

set 메서드 지양

#### 6-2-3. 밸류 타입은 불변하게 유지한다.
```java
public class Money { 

		private int value;
		
		public Money add(Money money) {
				return new Money(this.value + money.value); 
		}
}


Money price = new Money(100);
OrderLine line = new OrderLine (product, price, quantity); 
price.setValue(0);
```

- 밸류 객체는 값을 수정하기보다는 불변으로 유지하는 것이 좋다.

값을 수정할 수 있는 setter가 존재한다면 언제 어디서든 가격이 수정될 수 있고, 가격이 잘못 계산될 가능성이 존재한다. 이런 상황 자체를 발생하지 않도록 강제할 수 있다.

#### 6-2-4. set 메서드 지양
```java
// AS-IS
public class Order {
  public void setShippingInfo (ShippingInfo newShipping) {
    ...
  }
}
```

단순히 배송지 값을 설정한다는 의미를 나타냄

```java
TO-BE

public class Order {

		public void changeShippingInfo (ShippingInfo newShipping) {
				...
		}
}
```

배송지 정보를 새로 변경한다는 의미를 나타냄

# Ch2: 아키텍처 개요

## 1. 네 개의 영역

1-1. 응용 계층

public class CancelOrderService {

    @Transactional
    public void cancelOrder(String orderId) {
        Order order = findOrderById(orderId);
        if (order == null) throw new OrderNotFoundException(orderId);
        order.cancel();
    }
    ...
}

응용 서비스는 로직을 직접 수행하기보다는, 도메인 모델에 로직 수행을 위임한다.

응용 서비스는 마치 퍼사드 계층처럼 도메인 로직을 조합하는 곳

1-2. 인프라스트럭처 영역

논리적인 개념을 표현하기보다는, 실제 구현을 다루는 영역

도메인 로직이 특정 구현 기술에 종속되는것을 방지할 수 있다.

## 2. 도메인 영역의 주요 구성요소

### 2-1. 애그리거트

시간이 지날수록 도메인 모델이 복잡해진다

전체 구조 수준에서 모델을 관리하기 어려워짐

전체 모델 구조를 이해하기 어렵고 모델 관계를 이해하는데 어려워짐

전체 구조를 이해하는데 도움이 되는것이 바로 애그리거트이다.



애그리거트는 관련 객체를 하나로 묶은 군집이다.

애그리거트를 사용하면 전체 모델을 이해, 관리하기 용이하다.

### 2-2. 애그리거트 루트

- 애그리거트는 군집에 속한 객체를 관리하는 루트 엔티티를 갖는다.
- 루트 엔티티의 역할
  - 애그리거트에 속한 엔티티, 밸류들을 이용하여 애그리거트가 구현해야할 기능 제공
  - 다른 객체들은 애그리거트의 루트를 통해서만 기능을 실행한다.

애그리거트에 속한 모든 객체가 일관된 상태를 유지하기 위함

public class Order {

		private ShippingInfo shippingInfo;

		public void changeShippingInfo(ShippingInfo newInfo) {
				checkshippingInfochangeable(); // 배송지 변경 가능 여부 확인
				this.shippingInfo = newInfo;
		}

		private void checkShippingInfoChangeable() {
			... 배송지 정보를 변경할 수 있는지 여부를 확인하는 도메인 규칙 구현
		}
}


루트 엔티티인 Order에서만 배송지 변경 기능을 제공

배송지 변경시, 배송지 변경 가능 여부를 확인하는 도메인 규칙을 구현

Order를 통하지 않고 배송지를 변경할 수 있는 기능을 제공하지 않음 → 도메인 규칙을 항상 따르게 된다.

ShippingInfo에서 Setter와 같은 상태를 변경하는 메서드가 없어야 함

애그리거트에 대한 보다 자세한 내용은 3장에서 다룹니다.

## 3. 모듈 구성

### 3-1. 영역별 패키지 구성



### 3-2. 도메인별 모듈

도메인이 큰 경우, 도메인별로 패키지 구성

### 3-3. 하위 도메인을 포함

catalog 도메인이 product, category 도메인을 포함하는 경우

정해진 규칙은 없다. 한 패키지에 너무 많은 타입이 몰려서 코드를 찾을 때 불편한 정도만 아니면 된다. 책의 저자는 10~15개 미만으로 타입 개수를 유지하려고 노력한다.

챕터2는 아키텍처, 도메인 구성요소, DIP, 패키지 구성 등에 대한 내용