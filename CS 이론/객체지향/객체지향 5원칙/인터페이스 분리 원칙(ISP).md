# 인터페이스 분리 원칙

ISP : 인터페이스 분리 원칙(Interface Segregation Priniciple)

## 정의

특정 클라이언트를 위한 인터페이스 여러 개가 범용 인터페이스 하나보다 낫다.

## 개념

범용적인 인터페이스 보다는 사용자가 실제로 사용하는 Interface를 만들어야 한다. 

인터페이스를 사용에 맞게 각각 분리해야한다는 뜻

![isp](../../../images/Spring/isp.png)

인터페이스가 명확해지고, 대체 가능성이 높아진다.

## SRP vs ISP

SRP : 클래스의 단일 책임
ISP : 인터페이스의 단일 책임

하지만, SRP을 만족하더라고 ISP가 만족되지 않을 수 있다.

![srp](../../../images/Spring/srp.png)

## 출처 
https://blog.itcode.dev/posts/2021/08/16/interface-segregation-principle