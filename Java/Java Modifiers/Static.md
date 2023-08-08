# Static 

애플리케이션 실행 시, 다른 변수나 메서드보다 먼저 메모리에 올라간다.

따라서, 별도의 인스턴스화가 필요없이 사용 가능하다.

## 스태틱 영역
바로 'static 영역에서 힙 영역을 참조할 수 없다'

static 은 프로그램에서 유일한 영역이고, 인스턴스는 힙 영역에 N개로 늘어날 수 있습니다.

그래서 static 과 힙 영역의 인스턴스는 1:N 관계가 됩니다.

그래서 힙 영역의 인스턴스가 static 영역을 참조할 수 있으나, static영역에서 힙 영역의 인스턴스를 참조할 순 없습니다.

N개의 인스턴스가 존재할 수 있기에, 어떤 인스턴스를 지칭하는지 알 방법이 (자바 문법 상으론) 없습니다.

## 자기 자신을 내부에서 static 객체로 생성
https://jang-sn.tistory.com/35

## inner class vs static inner class

inner class는 반드시 outer class를 통해 접근해야함. 

그런데, static을 붙이면 애플리케이션 어디서나 접근할 수 있게된다.

https://siyoon210.tistory.com/141

https://johngrib.github.io/wiki/java/inner-class-may-be-static/