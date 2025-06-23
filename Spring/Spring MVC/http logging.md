# HTTP 요청 관련 로깅

~~~properties
logging.level.org.apache.coyote.http11=debug
~~~
HTTP 요청 메세지가 로그로 남음.
![httploggin](../../images/Java/httplogging.png)

~~~properties
-Djava.net.preferIPv4Stack=true
~~~
VM options에 넣어주면, request.getRemoteHost()할 때, Ipv4로 보여줌.