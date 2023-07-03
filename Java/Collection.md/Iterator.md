# Iterator

자바의 컬렉션에 저장된 요소를 읽어오는 방법을 Iterator 인터페이스로 표준화 하고 있음.

Iterable을 상속받은 Collection을 상속받은 클래스들은 Iterator를 쓸 수 있다 

그래서 Map에는 바로 쓸 수 없다.
keySet()이나 values()가 Collection을 반환하는데 이렇게 하면 쓸 수 있다. 

컬렉션의 단순 조회는 Enhanced For를 사용하면 된다. for 문이 훨씬 빠름.

수정, 제거를 위해서는 Iterator로 바꿔서 해줘야 한다.

~~~java
forEachRemaining()
~~~
남은 요소없을 때까지 작업 처리.
