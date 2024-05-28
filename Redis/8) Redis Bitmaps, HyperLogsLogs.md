# Redis Bitmaps

비트맵은 실제 데이터 타입은 아님

문자열 타입으로 정의된 비트 지향 동작들의 집합

정보를 저장할 떄 공간을 극적으로 아낄 수 있음

    > setbit key 10 1
    (integer) 1
    > getbit key 10
    (integer) 1
    > getbit key 11
    (integer) 0

주로 실시간 분석이나 객체 ID와 연관한 boolean 정보를 저장하기 위해 효율적, 고성능으로 사용


# HyperLogLogs

고유한 것을 세는 데 사용되는 확률적 데이터 구조

