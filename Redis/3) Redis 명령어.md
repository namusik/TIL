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

## redis-cli 명령어
```sh
// docker container 쉘 
docker exec -it my-redis /bin/sh

// redis-cli 실행
redids-cli

// 저장
set key1 banana
get key1

// 모든 key 조회
// 성능에 좋지 않기에 쓰지 않도록
keys *

// key 개수 조회
dbsize

// 모든 값 삭제
flushall

// redis-cli 종료
exit
```