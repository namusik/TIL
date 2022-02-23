## Redis Docker에 설치하기 

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