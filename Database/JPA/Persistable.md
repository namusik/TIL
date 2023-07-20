# Persistable

Entity를 만들 때,

@Id를 @GeneratedValue없이 만드는 경우가 있다. 
UUID, 혹은 ULID를 통해서 만들면 
식별자가 있는 상태로 save()를 호출하게 된다.

그런데, 이미 식별자가 있는 상태라 merge가 호출된다. 

이를 방지하기 위해, Persistable을 구현한 Entity를 만들어주면 좋다.

## 출처
https://ttl-blog.tistory.com/852