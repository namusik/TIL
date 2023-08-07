# 리스코프 치환 원칙

LSP : 리스코프 치환 원칙(Liskov Substitution Principle)

## 정의
구현 클래스는 인터페이스의 규약을 지켜야 한다. 기능적으로 보장을 해줘야 한다. 

## 개념 
interface의 run()은 앞으로 가는 기능이다. 

그런데, 구현 class에서 run()을 뒤로 가는 기능으로 구현했다.

이는, compile 상에서의 문제는 없지만, LSP 규약은 위반한 것이다.