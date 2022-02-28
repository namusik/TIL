# Redis 유의사항

## Max memory 설정 

    Redis 메모리의 한계는 maxmemory값으로 설정할 수 있음. 

    max를 넘어서면 maxmemory policy에 따라 추가 메모리 확보

    /proc/sys/vm/overcommit_memory=1로 설정해야 추가 메모리 할당 가능.

    Maxmemory 초과로 인해 데이터가 지워지게 되는 것을 eviction이라 함.

    Redis에서 INFO 명령어를 친후, evicted_keys 수치를 보면 eviction이 발생했는지 알 수 있음.

## 컬렉션 안에 너무 많은 아이템을 사용하지 않는다 

    명령어 수행에 걸리는 시간이 증가하여 퍼포먼스가 떨어진다

    1만개 이하 수준으로 유지하기

## Expire는 전체 Collection에 대해 걸린다

## 메모리를 철저하게 관리하라

    Redis Server가 피지컬 메모리 이상으로 사용하게 되면 장애가 발생
    
    이상으로 사용하게 되면 스왑이 발생하는데, 디스크를 사용하게 됨

## Redis는 자기가 사용하는 정확한 메모리를 모른다

    모니터링은 필수 

    메모리 파편화가 발생하므로 메모리 관리를 해줘야 함

## 작은 인스턴스 여러개로 사용하라

    Redis를 사용하다 보면 필연적으로 포크가 발생

## 다양한 사이즈를 가지는 데이터보다 유사한 크기의 데이터를 사용하라

    메모리 파편화 때문에 유사한 크기의 데이터를 사용하는게 관리에 유리

## Ziplist를 사용하자

    속도는 느리자만 메모리 관리에 유리

    돈이 많으면 hash, sorted set, set 사용하자 

## O(n) 관련 명령어에 주의하기 

    싱글 스레드이므로, 시간이 오래 걸리는 명령어에 주의하기

    데이터를 호출할 떄는 하나당 몇천개 이내로만 호출하는 것이 좋음

## redis.conf 설정

    Maxclient 설정 50000

    RDB/AOF 설정 off

    특정 command disable 
        keys
        save


## 모니터링 해줘야 하는 지표

    1. rss
    2. used memory
    3. connection number
    4. tps
    5. cpu
    6. disk
    7. network rk 