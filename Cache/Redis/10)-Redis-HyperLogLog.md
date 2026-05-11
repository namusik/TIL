# HyperLogLog

## 정의
- 유니크한 값의 개수를 비트맵보다 더 효율적으로 구할 수 있는 데이터 타입
- 확률적 자료구조를 사용
  - 100%를 보장하지 않지만 약간의 오차 덕분에 2^64개의 매우 큰 데이터를 다룰 수 있다.
- 겨우 12KB
- 0.81%의 오차율
- 비트맵은 0,1만 가능했지만 String을 사용할 수 있음.
- 주로 카운팅 용도.
- 내부에 값을 저장하진 않는다.


```sh
// 값을 추가
> pfadd hyper jay peter jane
(integer) 1

// 입력된 값들의 cardinality(유일값의 수)를 반환
> pfcount hyper
(integer) 3

// 복수개의 hyperloglog를 병합
> pfmerge result2 hyper hyper2
OK
> pfcount result2
(integer) 6
```
