# Redis Sets

## 특징

- 순서가 없는 유니크한 값의 집합
- 검색이 빠르다
- 개별 접근을 위한 인덱스가 없음.
- 특정값의 존재여부 혹은 집합 연산이 가능 (교집합, 합집합)
- 사용
  - 유저의 아이디를 set에 넣어서 쿠폰 발급 여부 확인

## 명령어
```sh
// set에 새로운 항목을 추가
> sadd myset 1 2 3
(integer) 3

// set에서 데이터 삭제
> srem myset 2

// 모든 항목 반환
> smembers myset
1. 3
2. 1
3. 2

// set에 저장된 아이템 개수 반환
> scard myset

// myset에서 해당 값이 있으면 1, 없으면 0 반환
// set 데이터 개수에 상관없이 동일한 수행속도 보장
> sismember myset 3
(integer) 1
> sismember myset 30
(integer) 0

-----------------------------------------

객체간의 관계를 표현하기 위해 유용.
태그를 구현하기 좋음

// news 1000 객체에 1 2 5 77 태깅
> sadd news:1000:tags 1 2 5 77
(integer) 4

// 모든 태그 불러오기
> smembers news:1000:tags            : 
1. 5
2. 1
3. 77
4. 2

--------------------------------

태그 1, 2, 10 및 27이 함께 있는 모든 개체의 목록 불러오기

> sinter tag:1:news tag:2:news tag:10:news tag:27:news
... results here ...


```
