# Nginx 다양한 설정들

## 마스터 프로세스와 워커 프로세스

![nginxprocess](../images/nginx/process.png)

명령어를 통해 현재 열려있는 프로세스를 확인할 수 있음. 
~~~
ps aux --forest 
~~~

## conf.d 폴더

보통 nginx.conf에서 include하는 conf파일들을 보관하는 곳.

## nginx.conf

/etc/nginx/nginx.conf

nginx의 설정이 들어가는 핵심 파일

nginx의 configuration 옵션을 디렉티브(directives)로 부름.

![nginxframe](../images/nginx/nginxframe.png)


간단 디렉티브 

    user nginx; 처럼 {}으로 안감싸져 있는 것들.

블럭 디렉티브 

    http{} 처럼 블록으로 감싸져 있는 것들

설정의 끝은 세미콜론;

include를 사용해서 설정파일을 분리해서 관리 

    include /etc/nginx/conf.d/*.conf;

## Core 모듈 설정

nginx.conf 맨 윗부분들. 

nginx 설정값을 정해준다. 

![forest](../images/nginx/forest.png)

worker_process 

    몇개의 워크 프로세스를 생성할 것인지 지정하는 지시어. 

    1이면 모든 요청을 하나의 프로세스로 실행하겠다는 뜻. 보통 auto로 함. 


## Events block 

네트워크 동작방법과 관련된 설정

worker_connections : 하나의 프로세스가 처리할 수 있는 커넥션의 수

최대 동시접속 = worker_process * worker_connections

## http block 

http 프로토콜을 사용하겠다는 블록

하위에 server, location block을 가지는 **루트 블록**

*.conf는 http블록 안에 include 되어있기 때문에 자동으로 http block을 자동으로 내포하고 있음.

## Server block

서버 기능을 설정하는 블록

하나의 웹사이트를 선언하는데 사용

서버블록이 여러개면 한대의 호스트에서 여러 웹사이트를 서빙할 수 있음. 

    일종의 가상 호스트. 

    각각의 사이트는 같은 IP 머신으로 연결되지만 다른 페에지를 보여주도록 설정 가능.

어떤 주소 port로 요청을 받을지 결정

![serverblock](../images/nginx/serverblock.png)

listen : 포트번호 설정
server_name : 클라이언트가 접속하는 서버. request의 header값과 일치여부 확인함.

#### 연습. 

conf.d 다렉토리에 새로운 hello.conf 파일 만들어주기. default.conf 복사해서 위에 바꿔줌.

~~~
server {
	listen   82;
    listen  [::]82
	server_name helloworld.com;
        .
        .
        .
        .
        .
}
~~~

helloworld.com의 82번 포트로 연결이 들어오면 nginx를 열어준다는 뜻.
</br>
~~~ 
curl helloworld.com:82
~~~
를 호출하면 아무런 응답이 없음. 

왜냐면, helloworld.com은 실제 있는 도메인이기에 82포트로 들어가는 것이 불가.

우리 nginx를 호출해야 하기때문에 hosts 파일 변경 필요 

~~~
vi /etc/hosts
~~~

~~~
127.0.0.1 helloworld.com
~~~

를 추가해준다. 이러면 localhost의 ip주소의 이름을 helloworld.com으로 지정해줘서 

helloworld.com을 요청하면 자동으로 localhost가 열리게 됨.


## 문법 검사 

해당 디렉토리에서 nginx -t

## location block

요청 URI 파라미터에 대한 세부 설정

![location](../images/nginx/locationblock.png)

Server block 안에 location block을 만들어 주면 됨.

http://helloworld.com:82   ->   helloworld 리턴
http://helloworld.com:82/a/ ->  helloworld-a 리턴

새로운 conf.d 파일을 만들어준다.
~~~
server{
    listen *:82;
    server_name "helloworld.com";

    location / {
        return 200 "helloworld";
    }

    location /a/ {
        return 200 "helloworld-a";
    }
    
    location /b/ {
        return 200 "helloworld-b";
    }
}
~~~

현재 상태에서는 문제가 있음. 

helloworld.com:82/a/aa로 요청해도 helloworld-a를 리턴하게 됨. 

exact match를 사용해야 함. 

~~~
server{
    listen *:82;
    server_name "helloworld.com";

    location = / {
        return 200 "helloworld";
    }

    location = /a/ {
        return 200 "helloworld-a";
    }
    
    location = /b/ {
        return 200 "helloworld-b";
    }
}
~~~

curl helloworld.com:82/a/aa 를 접속하면 NOT FOUND가 발생.

#### 쿠버네티스

쿠버네티스 ingress에서도 경로 유형을 정할 수있다. 

## file return

문자열이 아닌 파일을 리턴하기

![filereturn](../images/nginx/filereturn.png)

root 파일경로

file.conf 만들어줌.
~~~
server {
    listen *:82;

    location = / {
        return 200 "helloworld";
    }

    # case1: 정규식(대소문자 구분 x)
    # 준비 mkdir -p /tmp/images
    #      touch /tmp/images/a.jpg    
    # curl helloworld.com:82/images/a.jpg
    location /images {
        root /tmp;
        try_files $uri =404;
    }
}
~~~

만들어준 a.jpg에 내용을 추가해줌. 

##upstream block

![upstream](../images/nginx/upstream.png)

origin 서버. 


 

## 참고 

https://www.youtube.com/watch?v=hA0cxENGBQQ

https://sonman.tistory.com/25

https://juneyr.dev/nginx-basics

https://architectophile.tistory.com/12

https://hhseong.tistory.com/218