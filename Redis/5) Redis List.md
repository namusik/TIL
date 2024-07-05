## Redis Lists

## 특징
- Linked-list 형태의 자료구조
- 인덱스 접근은 느리지만 데이터 추가/삭제는 빠르다.
- Queue, Stack으로 사용할 수 있음.
  - 앞에서 빼면 Stack
  - 뒤에서 빼면 Queue
- 중간에 데이터를 삽입한다면 sorted set을 사용하는 것이 좋다


## 명령어
```sh
// list 오른쪽에 삽입
> rpush mylist A 
(integer) 1
> rpush mylist B
(integer) 2

// list 왼쪽에 삽입
> lpush mylist first
(integer) 3

// list 범위 가져오기 0(시작) -1(가장 오른쪽). 왼쪽부터 오른쪽 순서로
> lrange mylist 0 -1
1) "first"
2) "A"
3) "B"

// list 아이템 개수 반환
> llen mylist

----------------------------

> rpush mylist a b c
(integer) 3
// 오른쪽에서 제거하고 반환
> rpop mylist
"c"

// 왼쪽에서 제거하고 반환
> lpop mylist

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
```
   
    