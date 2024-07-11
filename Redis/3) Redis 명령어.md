# Redis 명령어


## docker redis 설치
- 소스와 바이너리 형태로 제공됨
- 소스는 C로 되어있음
- 주로 Linux에 설치해 사용

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


## 참고
https://giles.tistory.com/38

```sh
// redis 이미지 불러오기
docker pull redis

// redis 실행
docker run --name my-redis -d -p 6379:6379 redis

// redis 중단
docker stop my-redis
```

## redis-cli 명령어
![rediscli](../images/Redis/rediscli.png)
- redis-server : 레디스가 동작하는 서버
- redis-cli : 레디스 서버에 커맨드를 실행할 수 있는 인터페이스
  - Container안에서 redis-cli를 실행해야 한다.


```sh
// docker container 쉘 실행
docker exec -it my-redis /bin/sh

// redis-cli 실행
redids-cli

// 저장
set key1 banana
get key1

// 모든 key 조회
// 성능에 좋지 않기에 쓰지 않도록
keys *

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