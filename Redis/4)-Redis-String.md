# Redis Strings

## 특징
- 가장 기본적인 데이터 타입
- 문자열이 바이트 배열려 저장됨 (binary-safe)
  - 모든 문자를 표현할 수 있음
  - 바이너리로 변환할 수 있는 모든 데이터를 저장가능
    - JPG와 같은 파일도 가능
- 최대 크기 512  MB 
## Redis Strings
```sh
// key에 데이터 저장. 기존 값 덮어씌울 수 있음
> set myname hello
OK
//해당 key의 값 가져오기
> get myname
"somevalue"

-------------------

> set counter 100
OK
// 특정 키의 값을 Integer로 취급하여 1씩 증가시킴
// atomic 명령어. 동시에 여러 서버에서 incr, decr 명령어를 하여도 안전하다
> incr counter
(integer) 101

// 지정한 수 만큼 증가
> incrby counter 50 
(integer) 152

// 특정 키의 값을 Integer로 취급하여 1씩 감소시킴
> decr counter
(integer) 99

-------------------
// 여러 key 한번에 여러개 저장. 한번에 하면 latency 줄일 수 있음
> mset a 10 b 20 c 30
OK

// 배열 형태로 반환
> mget a b c
1) "10"
2) "20"
3) "30"

-------------------

> set mykey hello
OK
// Redis에 존재하면 1, 없으면 0 반환
> exists mykey
(integer) 1

// Key의 타입을 반환
> type mykey 
string

// 삭제했으면 1, 못했으면 0 반환
> del mykey
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
```