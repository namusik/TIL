# Sorted Sets

Set + Hash 와 비슷

모든 항목들은 score라는 floating point value를 가져서 정렬 가능

해커의 이름을 score로 사용될 생일과 함께 scored set에 추가해보기

    sadd와 유사하지만 score라는 인자가 하나 더 필요하다

    > zadd hackers 1940 "Alan Kay"
    (integer) 1
    > zadd hackers 1957 "Sophie Wilson"
    (integer) 1
    > zadd hackers 1953 "Richard Stallman"
    (integer) 1
    > zadd hackers 1949 "Anita Borg"
    (integer) 1
    > zadd hackers 1965 "Yukihiro Matsumoto"
    (integer) 1
    > zadd hackers 1914 "Hedy Lamarr"
    (integer) 1
    > zadd hackers 1916 "Claude Shannon"
    (integer) 1
    > zadd hackers 1969 "Linus Torvalds"
    (integer) 1
    > zadd hackers 1912 "Alan Turing"
    (integer) 1

    -------------------------------------

    > zrange hackers 0 -1         : 처음부터 끝까지 score 기준 정렬해서 출력하기
    1) "Alan Turing"
    2) "Hedy Lamarr"
    3) "Claude Shannon"
    4) "Alan Kay"
    5) "Anita Borg"
    6) "Richard Stallman"
    7) "Sophie Wilson"
    8) "Yukihiro Matsumoto"
    9) "Linus Torvalds"
    > zrevrange hackers 0 -1       : 반대 정렬

    ---------------------------------------

    > zrange hackers 0 -1 withscores         : score도 같이 반환
    1) "Alan Turing"
    2) "1912"
    3) "Hedy Lamarr"
    4) "1914"
    5) "Claude Shannon"
    6) "1916"
    7) "Alan Kay"
    8) "1940"
    9) "Anita Borg"
    10) "1949"
    11) "Richard Stallman"
    12) "1953"
    13) "Sophie Wilson"
    14) "1957"
    15) "Yukihiro Matsumoto"
    16) "1965"
    17) "Linus Torvalds"
    18) "1969"

    ------------------------------------

    > zrangebyscore hackers -inf 1950     : 1950년 출생까지 출력
    1) "Alan Turing"
    2) "Hedy Lamarr"
    3) "Claude Shannon"
    4) "Alan Kay"
    5) "Anita Borg"

    ------------------------------

    > zrank hackers "Anita Borg"          : 특정 항목 몇 등인지 출력
    (integer) 4