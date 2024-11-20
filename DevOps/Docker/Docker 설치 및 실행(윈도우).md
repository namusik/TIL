# 도커 실치 및 실행 

## 도커 docs

도커 명령어 보는 곳

https://docs.docker.com/engine/reference/commandline/pull/

## 도커 허브

도커 이미지 다운받는 곳

https://hub.docker.com/search?type=image


## 도커 설치 

https://docs.docker.com/engine/install/ubuntu/

받은 후, 실행

!!wsl 미설치시 아래 설명에 따라 설치해주기

https://docs.microsoft.com/ko-kr/windows/wsl/install-manual#step-4---download-the-linux-kernel-update-package


완료되면 docker desktop 실행됨.
</br>
</br>
</br>
powershell을 통해 제대로 설치된 것을 확인 가능

```
PS C:\Users\nswoo> docker images

REPOSITORY          TAG          IMAGE ID       CREATED        SIZE
namusik             ubuntu-git   d53f0eefa9b4   2 months ago   206MB
namusik/python3     1.0          4465c63da8bf   2 months ago   143MB
wordpress           latest       e3a452c0a154   2 months ago   616MB
web-server-build    latest       f222fae2c5ac   2 months ago   143MB
mysql               5.7          8b43c6af2ad0   2 months ago   448MB
web-server-commit   latest       cafb6a26120a   3 months ago   143MB
httpd               latest       1132a4fc88fa   3 months ago   143MB
ubuntu              20.04        ba6acccedd29   4 months ago   72.8MB
ubuntu              latest       ba6acccedd29   4 months ago   72.8MB
```

## 이미지 pull

docker hub에서 이미지를 다운받는 것을 pull이라 함.

https://hub.docker.com/search?type=image

원하는 컨테이너들 검색한다.

![dockerhub](../images/docker/dockerhub.jpg)

우측 명령어를 복사해서 컨테이너의 이미지를 pull 할 수 있음.

```
docker pull redis
```

다운을 확인하려면 도커 데스크탑의 images 탭을 클릭하거나 

docker images 명령어를 실행시켜본다.

</br>
</br>

## 이미지 Run 

#### 도커 데스크탑 

    1. images 우측에 run 클릭
    2. container 이름 설정해주기
    3. container가 생성되고 실행되는 중으로 변함.
    4. 멈추고싶으면 stop 하면 됨

#### 명령어
```
    <이미지 Run>
    docker run [OPTIONS] IMAGE [COMMAND]

    ex) docker run --name redisTest redis
```
```
    <실행중인 container 확인>
    docker ps
```
```
    <컨테이너 stop>
    docker stop [OPTIONS] CONTAINER [CONTAINER...]

    ex) docker stop redisTest
```
```
    <전체 container 확안>
    docker ps -a
```
```
    <container 다시 실행시키기>
    docker start [OPTIONS] CONTAINER [CONTAINER...]
    
    ex) docker start redisTest
```
```
    <container 삭제하기>
    docker rm [OPTIONS] CONTAINER [CONTAINER...]

    먼저 중지 시키고 삭제해야함

    ex) docker rm redisTest
```
``` 
    <이미지 삭제하기>
    docker rmi [OPTIONS] IMAGE [IMAGE...]

    docker rmi redis
```

## 도커로 웹서버 구성
</br>

![dockerhost](../images/docker/dockerhost.png)

#### 과정 

    1. 웹서버가 container에 설치됨.
    2. 이 Container가 설치된 운영체제를 Docker Host라 부름. 
    3. container와 host 모두 독립적인 port와 file system을 가지고 있음
    4. 웹 브라우저에서 접속을 하려면 
    5. host의 80번과 container의 80번 port를 연결시켜야 함
    6. docker run -p 80(host의 포트):80(container의 포트) httpd
    7. host의 80번으로 들어온 요청이 container의 80번 포트로 이동함.
    8. 이것을 포트포워딩이라 함.

#### 포트 번호 지정한 container

도커 데스크탑

    1. local host : host의 포트번호
    2. container port : 이미지가 설치될 container의 포트번호

명령어

    docker run --name ws1 -p 8080:80 httpd

브라우저에서 localhost:8080 접속하면 container 안에 있는 index.html을 읽어드림.

## Container 안에 있는 파일 수정하기 

docker desktop 

1. container 클릭 후 우측 상단에 cli 클릭
2. container 안에서 명령을 실행 시킬 수 있게 됨

powershell 

```
    docker exec [OPTIONS] CONTAINER COMMAND [ARG...]

    ex) docker exec -it ws1 /bin/bash 혹은 /bin/sh

    -it : interactive, tty 조합해서 만든 옵션. 컨테이너와 지속적으로 연결을 유지할 때

    shell 프로그램 실행. 사용자가 입력한 명령을 받아서 OS에 전달해주는 일종의 창구

    <container와 연결 종료>
    exit
```
```
    httpd의 index.html이 있는 위치로 이동.

    apt update
    apt install nano
    nano index.html 
    수정하고 컨트롤 O. 나갈떄는 컨트롤 X
```

## Host의 파일을 Container가 반영할 수 있도록 

    docker run -p 8082:80 -v C:\Users\nswoo\Desktop\docker\htdocs\:/usr/local/apache2/htdocs/ httpd
   

## 참고

https://www.youtube.com/watch?v=Ps8HDIAyPD0
