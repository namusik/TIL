# Redis의 다양한 Collections
    Binary-safe strings
    Lists
    Sets
    Sorted Sets
    Hashes
    Bit array
    HyperLogLogs
    Streams

## Redis Strings

    key-value 형태

    > set mykey somevalue : key에 데이터 저장. 기존 값 덮어씌울 수 있음
    OK
    > get mykey           : 해당 key의 값 가져오기
    "somevalue"

    -------------------

    > set counter 100
    OK
    > incr counter       : string 값 파싱해서 1씩 증가
    (integer) 101
    > incrby counter 50  : 지정한 수 만큼 증가
    (integer) 152

    -------------------

    > mset a 10 b 20 c 30   : key-value 한번에 여러개 저장. 한번에 하면 latency 줄일 수 있음
    OK
    > mget a b c            : 배열 형태로 반환
    1) "10"
    2) "20"
    3) "30"

    -------------------

    > set mykey hello
    OK
    > exists mykey      : Redis에 존재하면 1, 없으면 0 반환
    (integer) 1
    > type mykey        : Key의 타입을 반환
    string
    > del mykey         : 삭제했으면 1, 못했으면 0 반환
    (integer) 1
    > exists mykey
    (integer) 0         

    --------------------

    Redis Key 만료기한 설정

    > set key some-value
    OK
    > expire key 5
    (integer) 1
    > get key (immediately)
    "some-value"
    > get key (after some time)
    (nil)


## Redis Lists

    LinkedList 사용

    데이터를 앞, 끝에 삽입 삭제는 용이
    중간에 데이터를 삽입한다면 sorted set을 사용하는 것이 좋다

    > rpush mylist A       : rpush - list 오른쪽에 삽입
    (integer) 1
    > rpush mylist B
    (integer) 2
    > lpush mylist first   : lpush - list 왼쪽에 삽입
    (integer) 3
    > lrange mylist 0 -1   : lrange - list 범위 가져오기 0 -1 == 모든 범위
    1) "first"
    2) "A"
    3) "B"

    ----------------------------

    > rpush mylist a b c
    (integer) 3
    > rpop mylist  : rpop 오른쪽에서 제거
    "c"
    
    ---------------------------

    
    list 사용 예 
    
    숫자 관련된 작업에 매우 유용

    1. 소셜 네트워크에 마지막으로 업데이트한 포스트 저장

        Capped Lists

        Redis는 list를 capped collection으로 사용하게 해줌
        오래된 항목을 날리고 최근 N개의 항목만 기억하게 해줌

        > rpush mylist 1 2 3 4 5
        (integer) 5
        > ltrim mylist 0 2      : index 0~2 까지만 남김
        OK
        > lrange mylist 0 -1
        1) "1"
        2) "2"
        3) "3"


    2. consumer-producer 패턴을 이용하여 프로세스간 통신

        Blocking operations on lists

    

    ---------------------------

    Automatic creation and removal of keys

   
    