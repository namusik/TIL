# Redis Hash

## 특징
- 하나의 key 아래에 여러개의 field-value 쌍을 저장
- 자바 객체와 유사
- 객체를 나타내는데 편리
  - Json을 한번에 String으로 저장하면 부분에 접근할 수 가 없기에 Hash를 사용
- RDBMS의 테이블과 유사한 형태 
- Hash key가 있고 아래에 서브키가 있는 형태
  - Hash Sub key1(Field1)
  - Hash Sub Key2(Field2)

해시 안에 넣을 수 있는 필드 수에는 실질적으로 제한이 없다 

## 명령어
```sh
// 해시의 여리 필드 설정
> hset user username aaa birthyear 1977 verified 1
3

// 단일 필드 반환
> hget user username 
"antirez"
> hget user birthyear
"1977"

// 한개 이상의 필드 반환
> hmget user username verified
1) "aaa"
2) "1"

// hash field-value 전체 반환
> hgetall user
1) "username"
2) "antirez"
3) "birthyear"
4) "1977"
5) "verified"
6) "1"

// 개별 필드 값 증가
// 방문수, 클릭수 같은 카운터로 활용가능
>  
(integer) 1987
> hincrby user birthyear 10
(integer) 1997

// 한개 이상의 필드 삭제
> hdel user verified
(integer) 1

```

