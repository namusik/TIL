# Redis 

## 정의

    - Remote Dictionary Server
      - 원격에 Dictionary 방식으로 데이터를 저장하는 서버
      - Storage, Database, Middleware의 성격을 띄고 있음.
      - Storage : 데이터 저장소 (데이터 관점). 
      - Database : 전통적인 DBMS의 역할을 수행 (영속성 관점)
      - Middleware : 어플리케이션이 이용할 수 있는 유용한 기능을 제공하는 소프트웨어
        - redis는 제공하는 기능들이 다양하고 고급기능이 많음. ex) sorted set : 랭킹 시스템, 순위

## 장점 

    - 아주 빠른 데이터 저장소
    - 분산된 서버들간의 커뮤니케이션 (동기화, 작업 분할)
    - 내장된 자료구조를 활용한 기능 구현
      - list, set, sorted set, hash 등 다양한 데이터 구조 집합을 제공
    - 싱글 쓰레드 ; rade condition에 빠질 수 있음을 방지.
    - 캐시의 용도로 흔히 사용된다

## 특징

### In-memory DB
      - 메모리 영역에 존재하는 Redis에 저장
        - 데이터를 RAM에 저장
        - 대신 휘발성이 있음
      - session 데이터 같은 단기 사용 데이터를 Redis에 저장
      - cache 데이터
    
### Key-value store
    - key:value 형태
      - map과 유사
    - 가장 단순한 데이터 저장 방식
    - Hash를 이용해 값을 바로 읽어서 속도가 빠름 (추가 연산이 필요없음)
    - key를 가지고 조회하기에 value로는 조회 불가능
    - 범위 검색 등의 복잡한 조회는 불가능

### Hash

    - 필드와 값의 쌍으로 구성된 컬렉션
    - 일반적인 키-값 저장소와 달리, 하나의 키 아래 여러 필드-값 쌍을 저장할 수 있는 데이터 구조
    - user:1000
    - name: Alice
    - age: 30
    - email: alice@example.com
    -  내부적으로 해시 테이블을 사용하여 필드를 저장하고 조회
    -  빠른 조회
    -  키를 사용하여 직접적인 주소를 계산하기 때문에 값의 조회 속도가 매우 빠름
    -  평균적으로 O(1)의 시간 복잡도
    -  공간 효율성
    -  메로리를 효율적을 사용 가능. 각각의 필드와 값이 개별적인 키-값 쌍으로 저장되는 것보다 메모리가 적음.

## 싱글 쓰레드

    한 번에 딱 하나의 명령어만 실행 가능

    Get/Set같은 명령어는 초당 10만개도 처리 가능

    Keys 같이 처리가 오래 걸리는 명령어의 경우 뒤에 있는 명령어들이 전부 기다려야 함.


## Redis 사용처

    1. Session store
    2. Cache
    3. 랭킹 보드
    4. 유저 API 리밋
    5. Job Queue
    6. 여러 서버의 데이터를 공유 할 때
    7. Limit Rater
       1. 특정 API의 분당 호출수 제한 기능

## Redis Data type
- String
- List
- Set
- Hash
- SortedSet
- Bitmap
- HyperLogLog

## 참고 

https://sabarada.tistory.com/177?category=856943

https://brunch.co.kr/@jehovah/20
    