# Redis Bitmaps

- **비트 백터(비트 배열)**과 동의어
![bitmap](../images/Redis/bitmap.png)
  - 0과 1로 이뤄진 비트를 컴팩트하게 저장하는 데이터구조
  - 공간을 효율적으로 저장하기 위해 사용함.
  - 길이가 5인 비트벡터가 있고, 각각의 index에 들어가는 값은 0, 1이다.
  - 컴퓨터에서 2^32 = 4바이트 (32비트. 1바이트는 8비트). 
  - 4바이트는 보통 Integer. 이 공간에 42억개의 비트를 저장할 수 있음.
  - ex) 특정일에 유저들의 방문 현황을 저장한다면, index가 유저 번호 일때, 방문한 고객의 index를 1로 바꾸면 42억명의 데이터는 2^32에 불과함.
- 하나의 비트맵이 가지는 공간은 2^32-1
- 비튼 연산이 가능하다
  - 어제 방문 bitmap과 오늘 방문 bitmap이 있을 때 이 2개의 비트맵에 and 연산을 하면 둘다 1인 bitmap만 뽑을 수 있음.

```sh
    // 비트맵의 특정 오프셋에 값을 변경
    > setbit visit 10 1
    (integer) 0
    
    // 비트맵의 특정 오프셋의 값을 반환
    > getbit visit 10
    (integer) 1

    > getbit visit 11
    (integer) 0 

    // 비트맵에서 set(1) 상태인 비트의 개수를 반환
    > bitcount visit
    (integer) 1

    // 비트맵들간의 비트 연산을 수행하고 결과를 다른 비트맵에 저장한다.
    > bitop and result visit yesterday
    (integer) 2

```