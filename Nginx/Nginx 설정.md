# Nginx 다양한 설정들

## 마스터 프로세스와 워커 프로세스

![nginxprocess](../images/nginx/process.png)

명령어를 통해 현재 열려있는 프로세스를 확인할 수 있음. 
~~~
ps aux --forest 
~~~

![forest](../images/nginx/forest.png)

nginx.conf 파일에 접속하면

worker_processes auto; 로 설정되있는 것을 볼 수 있는데

숫자로 바꿔주면 개수를 직접 설정할 수 있다. 

## 설정파일

/etc/nginx/nginx.conf

디렉티브(directives)로 관리 

![nginxConf](../images/nginx/nginxConf.png)

    간단 디렉티브 

        user nginx; 처럼 {}으로 안감싸져 있는 것들.

    블럭 디렉티브 

        http{} 처럼 블록으로 감싸져 있는 것들

설정의 끝은 세미콜론;

include를 사용해서 설정파일을 분리해서 관리 

    include /etc/nginx/conf.d/*.conf;


## Server block

서버 기능을 설정하는 블록

어떤 주소 port로 요청을 받을지 결정

![serverblock](../images/nginx/serverblock.png)

listen : 포트번호 설정
server_name : 받을 도메인 설정

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

## http block 

http 프로토콜을 사용하겠다는 블록

*.conf는 http블록 안에 include 되어있기 때문에 자동으로 http block을 자동으로 내포하고 있음.

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



## 참고 

https://www.youtube.com/watch?v=hA0cxENGBQQ

https://sonman.tistory.com/25

