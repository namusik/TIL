# ByteBuffer
## 개념
- 일종의 공간
- 데이타를 처리할 때, 하나의 byte를 여러개 모아서 처리
- 담아서 보내는 것
  
## 종류
### OS level
- os level에 있는 buffer
- allocateDirect()
  - 속도측면에서 유리
- 취급에 주의해야 함.
### JVM Heap
- jvm heap 영역에 있는 buffer
- allocate()
  - os level에 있는 buffer를 가져와서 쓰기 때문에 느릴 수 있음.
  - 통합엔진은 이거 사용

## 특징
- 포지션. 0 맨앞.
- capacity : bytebuffer 용량
- bytebuffer.put(A) 
  - A가 담기면 포인트가 1로 이동
- bytebuffer.position()
  - 1 return
- bytebuffer.flip()
  - 현재 포지션은 limit으로 지정하고
  - 포지션이 0으로 감.
  - mark는 -1이 됨
  - 이 때 쓰기를 조심해야함. limit이 넘으면 예외터짐
  - flip은 읽기용
  - get()위주로 호출하자
- bytebuffer.read()
  - 읽기전에 flip()을 해야한다.
- bytebuffer.rewind() 
  - position 1로 하고 limit은 그대로 5

## 함수
- 

## buffer 상태 확인

```sh
netstat -an grep $pid 혹은 port번호
```

read buffer

write buffer 상태 확인 가능.

통신을 할 때, read와 write buffer에 담아서 보낸다. 

read buffer가 꽉차있으면 서버가 처리하는 것보다 클라이언트가 처리하는게 느림

write buffer가 꽉차있으면 내가 처리하는 것보다 서버가 처리하는게 느림

## 네이글 알고리즘
- 버퍼에 20이 차야 보낼래 아니면 들어오는 데로 보낼래를 결정하는 알고리즘
- 모아서 보내면 한번의 전송에 많은 걸 보낼 수 있음.

## 세션 한계
- 하나의 프로세스에서 생성할 수 있는 최대의 세션은 65000개. port가 무한하지 않기 때문에
- tcp 옵션에서 조절해야 65000개 이상 만들어야함. os tcp 설정



