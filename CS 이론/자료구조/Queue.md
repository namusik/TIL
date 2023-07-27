# Queue 큐

## 정의
![queue](../../images/Cs/queue.png)

컴퓨터 자료구조의 한 종류.

data를 일시적으로 저장하고 관리하는데 유용

**FIFO(First In First Out)**

먼저 들어온 데이터가 먼저 나간다.

## 용어

### front 
Queue 제일 앞에 있는 data값
제일 먼저 들어온 값이기도 하다.

### Rear
Queue 제일 뒤에 있는 data값

### Enqueue 
Queue에 data를 추가한다. 
만약, Queue가 가득 차있으면 추가되지 않음.

### Dequeue
Queue에서 data를 제거한다.
FIFO이기 때문에, Front부터 제거된다.

## 주 사용처
1. 운영체제에서는 `프로세스 스케줄링`에 사용되어 CPU의 시간을 할당받기를 대기하는 프로세스들을 큐에 유지.
</br>
2. `네트워크 패킷` 처리에 사용되어 패킷들이 도착한 순서대로 처리되는데 사용됨.
</br>
3. 버퍼링이 필요한 상황.
</br>
4. 멀티스레드 환경에서 작업의 실행 순서를 제어하는 용도
</br>
5. Message System에서 메시지를 임시적으로 저장하고 관리하는 Message Queue

## Java에서의 Queue
