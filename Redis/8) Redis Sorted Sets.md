# Sorted Sets

- Set과 유사
  - 순서가 없는 유니크한 값이 집합 
- 각 값들은 연관된 **score** 라는 숫자 데이터를 가지고 있고, score에 따라 정렬된다.
- 최댓값, 최솟값을 빠르게 구할 수 있다.
- 순위 계산, 랭크보드에 잘 사용된다.
- Set + Hash 와 비슷

모든 항목들은 score라는 floating point value를 가져서 정렬 가능

해커의 이름을 score로 사용될 생일과 함께 scored set에 추가해보기

```sh
    // 한개 혹은 다수의 값을 추가
    // sadd와 유사하지만 score라는 인자를 앞에 붙여준다.
    > zadd myrank 10 apple 20 banana
    (integer) 2

    // 특정 값 삭제


    -------------------------------------
    
    // 오름차순 기준 특정 범위 값 반환
    > zrange myrank 0 -1 
    1) "apple"
    2) "banana"

    // 내림차순 기준 특정 범위 값 반환
    > zrevrange myrank 0 -1 
    1) "banana"
    2) "apple"

    ---------------------------------------

    // 특정 범위 score도 같이 반환
    > zrange myrank 0 -1 withscores
    1) "apple"
    2) "10"
    3) "banana"
    4) "20"

    ------------------------------------

    // 특정 값의 score 까지 출력
    > zrangebyscore myrank -inf 15
    1) "apple"

    ------------------------------
    
    //  특정 값의 오름차순 기준 위치 반환. 0부터 시작.
    > zrank myrank apple
    (integer) 0

    // 특정 값의 내림차순 기준 위치 반환
    > zrevrank myrank apple
    (integer) 1
```    