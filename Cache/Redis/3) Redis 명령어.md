# Redis 명령어


## docker redis 설치
- 소스와 바이너리 형태로 제공됨
- 소스는 C로 되어있음
- 주로 Linux에 설치해 사용

```sh
// redis 이미지 불러오기
docker pull redis

// redis 실행
docker run --name my-redis -d -p 6379:6379 redis

// redis 중단
docker stop my-redis
```

## Redis Docker에 설치하기 다른버전

1. Docker Hub에서 redis 이미지 다운
2. 바로 image run해도 되지만, 
3. redis-cli도 함께 구동시키려면 2개의 컨테이너를 실행해야함.
4. 또한, 그 2개의 컨테이너 연결을 위해 docker network를 구성해야 함.
```
    <도커 네트워크 생성>
    docker network create redis-net

    <도커 네트워크 리스트 확인>
    docker network ls
```

```
    <redis 이미지 run>
    docker run --name redisCont -p 6379:6379 --network redis-net -d redis redis-server --appendonly yes

    
```
```
    <redis-cli로 redisCont 접속해서 실행시키기>
    docker run -it --network redis-net --rm redis redis-cli -h redisCont
```
5. redis-cli가 실행되서 redis 명령어 사용가능.


## redis-cli 명령어
![rediscli](../../images/Redis/rediscli.png)
- redis-server : 레디스가 동작하는 서버
- redis-cli : 레디스 서버에 커맨드를 실행할 수 있는 인터페이스
  - Container안에서 redis-cli를 실행해야 한다.


```sh
// docker container 쉘 실행
docker exec -it my-redis /bin/sh

// redis-cli 실행
redids-cli

// redis cluster에서 master/slave 구분 출력
redis-cli cluster nodes
f49e011004b0a78d9be958ad029801771e4e911d 10.0.146.248:6379@16379 master - 0 1741756729000 7 connected 0-5460
139299097a2833486a428e5a42ea3b4811ec54d8 10.0.145.21:6379@16379 slave c28a638151fda937a99d8eac37d82f372b636369 0 1741756729000 3 connected
8353277eaa9534d7e74cc11783e81cbd15e7389a 10.0.149.121:6379@16379 master - 0 1741756729285 2 connected 5461-10922
cc3afee46df762bf69f779771cd9fb7101703030 10.0.128.249:6379@16379 slave 8353277eaa9534d7e74cc11783e81cbd15e7389a 0 1741756729000 2 connected
3d964a7240bdc72edaab46cb3c43aafce3a64f95 10.0.149.157:6379@16379 myself,slave f49e011004b0a78d9be958ad029801771e4e911d 0 0 7 connected
c28a638151fda937a99d8eac37d82f372b636369 10.0.129.92:6379@16379 master - 0 1741756730290 3 connected 10923-16383


// --raw 옵션을 사용하면 실제 바이너리 데이터를 그대로 출력. 한글 인코딩 안깨지도록
redis-cli --raw

// 저장
set key1 banana
get key1

// 모든 key 조회
// KEYS * 명령은 매칭되는 모든 키를 한 번에 찾아 반환. 
// 만약 데이터베이스에 키가 매우 많다면, 이 명령이 실행되는 동안 서버가 전체 키 공간을 스캔하게 되어 다른 요청들이 블로킹되기에 성능에 좋지 않기에 쓰지 말자
keys *

// SCAN 명령은 커서를 이용해 일정량의 키만 반환
scan 0 count 100

// 특정 캐시의 key 조회
keys userAgeCache*
1) "userAgeCache::A"

// key 개수 조회
dbsize

// 모든 값 삭제
flushall

// redis-cli 종료
exit
```