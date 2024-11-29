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

"Cmd": [
    "hello",
    "world"
],
"Entrypoint": ["echo"],

```
- Dockerfile에서 설정된 ENTRYPOINT와 커맨드를 덮어쓴다.


 
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