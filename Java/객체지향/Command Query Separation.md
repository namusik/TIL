# Command Query Separation

## 개념 
Bertrand Meyer의 책 "Object Oriented Software Construction"에서 제시된 개념.

객체의 method를 2개의 카테고리로 뚜렷하게 나눠야 한다.

## Query
어떤 값을 return하고,` observable state of the system`를 변화시키지 않는 method.

free of side effects이다. 

ex) getter()

## Command(modifiers)
어떤 동작을 수행해서 시스템 상태를 변경하지만, 어떤 값도 return 하지 않는 method.

modifiers라고도 불린다.

ex) setter()

## 의의
이 둘을 분리하면 매우 편리하다.

다양한 상황에서 Query를 자신있게 사용할 수 있고, 도입하고, 순서를 바꿀 수 있기 때문이다.

> return type is the give-away for the difference.

예외는 있다. stack의 pop()은 상태를 변경하는 Query의 예시이다.

언어가 자체적으로 이러한 method들을 감지해서 알려주면 좋겠지만, 이 규칙은 ObservableState of the system에만 적용되기 때문에 불가능하다.

## 참고
https://martinfowler.com/bliki/CommandQuerySeparation.html



