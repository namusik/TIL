# Docker 명령어

## Docker 기본 명령어
```sh
# 실행중인 도커 버전 확인
docker -v
Docker version 26.1.3, build b72abbb6f0
```

## Container 명령어
```sh
# 컨테이너 생성
docker create [image]
docker create nginx
0b7cc30d78cf67d36b53709fe72547070b34a64281bec46f60ed04dfbc925c04

# 컨테이너 시작
docker start [container 이름 OR container ID]

# image가 local에 없을 경우 자동으로 docker hub에서 pull 해옴. 컨테이너 생성 후 시작
docker run [image]
Unable to find image 'nginx:latest' locally
latest: Pulling from library/nginx

# docker run 주요 옵션
-i : interactive 모드 활성화. Docker가 컨테이너의 표준 입력 (stdin)을 열어둠. 호스트의 표준 입력을 컨테이너와 연결.
-t : 컨테이너에 TTY 모드 활성화하여 터미널 할당. Docker가 컨테이너에 가상 터미널을 연결. -i와 함께 사용할 때 효과적
--rm : 컨테이너 실행 종료 후 자동 삭제
-d : detached. 백그라운드 모드로 실행
--name helloworld : 컨테이너 이름 지정
-p 80:80 : 호스트 - 컨테이너 간 포트 바인딩
-v /opt/example:/example : 호스트 - 컨테이너 간 볼륨 바인딩

docker run -it nginx bash
docker run -it ubuntu:focal # exit : 컨테이너 종료시키고 빠져나옴. ctrl+p+q : 컨테이너 종료시키지 않고 빠져아놈
docker run -d --name my-nginx nginx

docker run -p 80:80 -d  nginx
f851a605c87e   nginx "/docker-entrypoint.…"   2 seconds ago        Up 2 seconds        0.0.0.0:80->80/tcp
curl localhost:80 # local에서 접속됨

docker run ubuntu:focal id
uid=0(root) gid=0(root) groups=0(root)
d67d556b7e5e   ubuntu:focal                          "id"  # command가 id로 변경됨

# 전체 컨테이너 목록
docker ps -a
# Continer ID에는 난수 앞 12자리
CONTAINER ID   IMAGE       COMMAND                  CREATED               STATUS                 PORTS                     NAMES
0b7cc30d78cf   nginx      "/docker-entrypoint.…"   8 seconds ago        Created                                     affectionate_wozniak
c4bc1ee0af1d   nginx      "/docker-entrypoint.…"   About a minute ago   Exited (0) 50 seconds ago                    hungry_lehmann

# 컨테이너 상세 정보
docker inspect [container] # 컨테이너에 문제가 생겼을 때 살펴보자

# 컨테이너 SIGTERM 종료
docker stop [container]
gracefully shutting down # 로그 확인가능

# 컨테이너 SIGKILL 종료
docker kill [container]

# 모든 컨테이너 종료
docker stop $(docker ps -a -q)

# 컨테이너 삭제 
docker rm 

# 컨테이너 강제 종료 후 삭제. SIGKILL 방식
docker rm -f 
```

## 도커 명령어의 엔트리포인트, 커맨드
```sh
docker run --entrypoint echo ubuntu:focal hello world

docker inspect [container]
"Cmd": [
    "hello",
    "world"
],
"Entrypoint": ["echo"],

```
- Dockerfile에서 설정된 ENTRYPOINT와 커맨드를 덮어쓴 것을 확인 가능

## 도커 컨테이너에 환경변수 주입 옵션
-e, --env list  : Set environment variables  
--env-file list : Read in a file of environment variables

```sh
docker run -it -e MY_HOST=hello ubuntu:focal bash

env
HOSTNAME=27c74ff7a735
MY_HOST=hello

docker inspect
"Env": [
    "MY_HOST=hello",
    "PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"
],
```

```sh
cat sample.env
MY_HOST=helloworld.com
MY_VAR=123
MY_VAR2=456

docker run -it --env-file ./sample.env ubuntu:focal env
PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
HOSTNAME=0d0252f01fd0
TERM=xterm
MY_HOST=helloworld.com
MY_VAR=123
MY_VAR2=456
HOME=/root
```

## 실행중인 컨테이너에 명령어 실행

```sh
docker exec [container] [cmd]
```


## 도커 네트워크 명령어
```sh
docker run -p [HOST IP:PORT]:[CONTAINER PORT] [container]

# nginx 컨테이너의 80번 포트를 호스트 모든 IP의 80번 포트와 연결하여 실행
$ docker run -d -p 80:80 nginx
CONTAINER ID   IMAGE     COMMAND                   CREATED         STATUS         PORTS                NAMES
2553f61c840d   nginx     "/docker-entrypoint.…"   4 seconds ago   Up 3 seconds   0.0.0.0:80->80/tcp   suspicious_mcnulty

# nginx 컨테이너의 80번 포트를 호스트 127.0.0.1 IP의 80번 포트와 연결하여 실행
$ docker run -d -p 127.0.0.1:80:80 nginx
CONTAINER ID   IMAGE     COMMAND                   CREATED         STATUS        PORTS                  NAMES
588f9faf3820   nginx     "/docker-entrypoint.…"   2 seconds ago   Up 1 second   127.0.0.1:80->80/tcp   reverent_varahamihira

# nginx 컨테이너의 80번 포트를 호스트의 사용 가능한 포트와 연결하여 실행
$ docker run -d -p 80 nginx
CONTAINER ID   IMAGE     COMMAND                   CREATED         STATUS         PORTS                   NAMES
837cbf24be39   nginx     "/docker-entrypoint.…"   3 seconds ago   Up 3 seconds   0.0.0.0:63765->80/tcp   nervous_brahmagupta

# 명시적으로만 적용. 실제 포트가 매핑되지 않음.
$ docker run -d --expose 80 --name nginx-expose nginx
3d03c8329ef3   nginx     "/docker-entrypoint.…"   2 seconds ago   Up 1 second    80/tcp                 nginx-expose
```

## 도커 네트워크 드라이버 명령어
```sh
## none 네트워크
docker run -i -t --net none ubuntu:focal

"NetworkSettings": {
            "Bridge": "",
            "IPAddress": "", 비어있음
            "Networks": {
                "none": {
                .....
                    "DriverOpts": null, null 확인

## 호스트 네트워크
docker run -d --network=host grafana/grafana

"Networks": {
    "host": {
        "NetworkID": "d34a854922c43803f58601c63dac7af035b7312c447e96fb54b7a8fcaf1365d7", host네트워크 id 확인

## 브릿지 네트워크 생성
docker network create --driver=bridge hello

docker network ls
NETWORK ID     NAME            DRIVER    SCOPE
5a24d32f1974   bridge          bridge    local
083883ee24f5   hello           bridge    local

docker run -d --network=hello --net-alias=grafana grafana/grafana
docker run -d --network=hello --net-alias=hello nginx 
```

## 도커 볼륨
```sh
# 호스트 볼륨 마운트
docker run -d -v $(pwd)/html:/usr/share/nginx/html -p 80:80 nginx

# 볼륨 컨테이너
docker run -d -it -v $(pwd)/html:/usr/share/nginx/html --name web-volue ubuntu:focal
docker run -d --name nginx1 --volumes-from web-volume

"VolumesFrom": [
    "web-volume"
],
"Mounts": [
    {
        "Type": "bind",
        "Source": "/host_mnt/Users/ioi01-ws_nam/Documents/GitHub/facam-docker-part1/3-docker-kubernetes/2-docker-volume/html",
        "Destination": "/usr/share/nginx/html",
        "Mode": "",
        "RW": true,
        "Propagation": "rprivate"
    }
]

# 도커 볼륨 생성
docker volume create --name db

# 볼륨 확인
docker volume ls

# 볼륨 inspect
docker volume inspect db
[
    {
        "CreatedAt": "2024-12-16T09:20:54Z",
        "Driver": "local",
        "Labels": null,
        "Mountpoint": "/var/lib/docker/volumes/db/_data",
        "Name": "db",
        "Options": null,
        "Scope": "local"
    }
]

# 생성한 볼륨을 사용
docker run -d --name mysql2 -e MYSQL_DATABASE=root -e MYSQL_ROOT_PASSWORD=root -v db:/var/lib/mysql -p 3306:3306 mysql
```

## 엔트리포인트 (EntryPoint)
- 도커 컨테이너가 실행할 떄 고정적으로 실행되는 스크립트 혹은 명령어
- 생략될 수 있다.
- 생략되면 커맨드에 지정된 명령어로 수행됨
- 덧붙여서 실행할 인자를 추가 가능

## 커맨드
- 기본적으로 실행할 명령어와 인자를 정의
- docker run 명령어에서 추가로 지정된 명령어가 있으면 그 명령어로 덮어씌워진다.
- ENTRYPOINT가 설정되어 있으면 CMD는 ENTRYPOINT의 **인자로 사용됨**.

```dockerfile
ENTRYPOINT ["python3", "app.py"]
CMD ["--help"]
```
- ENTRYPOINT는 python3 app.py를 실행하도록 설정
- CMD는 기본적으로 --help를 인자로 전달
- 컨테이너를 실행할 때 docker run <container> --version과 같이 명령어를 추가하면 CMD의 --help 대신 --version을 인자로 사용