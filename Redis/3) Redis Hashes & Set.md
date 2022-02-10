# Hashes 

field - value 

RDBMS의 테이블과 유사한 형태 

객체를 나타내는데 편리

자바처럼 객체 만들고 필드값 넣는다고 생각하면 편함

Hash key가 있고 
    Hash Sub key1(Field1)
    Hash Sub Key2(Field2)아래에 서브키가 있는 형태

해시 안에 넣을 수 있는 필드 수에는 실질적으로 제한이 없다 

    > hmset user:1000 username antirez birthyear 1977 verified 1 : 해시의 여리 필드 설정
    OK
    > hget user:1000 username : 단일 필드 반환 
    "antirez"
    > hget user:1000 birthyear
    "1977"
    > hgetall user:1000
    1) "username"
    2) "antirez"
    3) "birthyear"
    4) "1977"
    5) "verified"
    6) "1"
    7) > hmget user:1000 username birthyear no-such-field : 배열 반환
    8) "antirez"
    9) "1977"
    10) (nil)
    > hincrby user:1000 birthyear 10  : 개별 필드 값 증가
    (integer) 1987
    > hincrby user:1000 birthyear 10
    (integer) 1997



# Sets

순서없는 문자열의 Collection

    > sadd myset 1 2 3       : set에 새로운 항목을 추가
    (integer) 3
    > smembers myset        : 모든 항목 반환
    1. 3
    2. 1
    3. 2
    > sismember myset 3     : myset에서 해당 값이 있으면 1, 없으면 0 반환
    (integer) 1
    > sismember myset 30
    (integer) 0

-----------------------------------------

객체간의 관계를 표현하기 위해 유용.

태그를 구현하기 좋음

    > sadd news:1000:tags 1 2 5 77      : news 1000 객체에 1 2 5 77 태깅
    (integer) 4
    > smembers news:1000:tags            : 모든 태그 불러오기
    1. 5
    2. 1
    3. 77
    4. 2

--------------------------------

태그 1, 2, 10 및 27이 함께 있는 모든 개체의 목록 불러오기

    > sinter tag:1:news tag:2:news tag:10:news tag:27:news
    ... results here ...

