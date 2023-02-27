# Amazon CloudFront

## 정의 

CDN(Content Delivery Network) 서비스 

* 웹페이지, 이미지, 동영상 등의 컨텐츠를 서버에서 받아 캐싱
* 요청이 들어오면 캐싱에서 제공
* 서버와 요청의 거리가 멀거나, 통신 환경이 안 좋은경우 근처의 CDN을 통해 빠르게 응답 가능
* 서버의 부하를 낮출 수 있음.

## Amazon Edge Location

아마존에서 만든 컨텐츠가 캐싱되고 유저에게 제공되는 지점

## 동작 방식 

* 요청 받은 컨텐츠가 엣지 로케이션에 있다면, 바로 전달
* 없다면, 근원 서버에서 제공받아 전달 (캐싱도 진행)

![edgelocation](../../images/AWS/엣지로케이션.png)

## 구성 

### Origin
    실제 컨텐츠가 존재하는 근원 (ec2, s3)
    AWS 서비스
    온프레미스 서버

### Distribution

CloudFront의 CDN 구분 단위. 여러 엣지 로케이션

## 설정 및 용어

#### TTL
* time to live
* 캐싱된 아이템이 살아 있는 시간. (TTL초 이후 캐싱에서 삭제됨)

#### 파일 무효화(invalidate)
* TTL이 지나기 전에 강제로 캐시 삭제
* 잘못된 파일이 캐싱됐을 경우.
* 대신 비용이 발생함. 1000건 이상부터

#### Cache Key
* 캐싱 기준
* URL
* header, cookie, 쿼리스트링 등등 


## 기능 

#### 1. 정적/동적 컨텐츠 모두 최적화 


![dynamic](../../images/AWS/cloudfrontdynamic.png)

* 정적(static)
이미지/css/서버가 필요없는 내용들
캐싱으로 접근 속도 최적화

* 동적(Dynamic)
서버계산, DB조회가 필요한 내용
네트워크 최적화(DNS Lookup, TCP connection, Time to First Byte 최적화) : 서버로부터 파일을 받기 전에 하는 전처리 과정
![dns](../../images/AWS/dns.png)

#### 2. HTTPS 지원

* origin에서 HTTPS를 지원하지 않더라도 HTTPS통신을 지원하도록 구성 가능
* s3 static hosting 할 때, 특히 유용

![cfhttps](../../images/AWS/cfhttps.png)

#### 3. Lambda@edge

* 람다 사용 
![cflambda](../../images/AWS/cflambda.png)

#### 4. 리포팅
* cloudfront 이용지표 확인
* 캐시상태, 가장 많은 요청받은 컨텐츠, top referrer

#### 5. 정책 설정

* cache control
  * 캐싱 방법 및 압축
  * TTL / Cache key 

* Origin Request
  * Origin에 쿠키, 헤더, 쿼리스트링 중 어떤 것을 보낼지

* 뷰어에게 보낼 HTTP header 정의

#### 6. Origin Access Identity
* S3의 컨텐츠를 CloudFront를 사용해서만 볼 수 있도록 제한
* CloudFront만 권한을 가지고 S3에 접


## 실습 
amazon linux
ec2 접속
~~~sh
sudo -s
yum install httpd
service httpd start
~~~

샘플 페이지 접속 

~~~sh
cd /var/log/httpd
tail -f access_log
~~~
새로고침을 누르면 접속 로그가 갱신되는 것을 볼 수 있음. 
![accesslog](../../images/AWS/cfaccesslog.png)

CloudFront 배포 생성

![cf1](../../images/AWS/cf1.png)
* ec2 dns 주소 입력

![cf2](../../images/AWS/cf2.png)

배포
![cf3](../../images/AWS/cf3.png)

index.html 생성
~~~sh
sudo -s
vim /var/www/html/index.html
hello world
~~~

ec2 주소와 cloudFront 주소로 모두 접속해보기

![cf4](../../images/AWS/cf4.png)

cloudFront로 접속하면 최초에만 로그가 남고 

그뒤로는 아무리 새로고침을 해도 로그가 남지 않는다. 

캐싱에서 접근하기 때문

index.html 내용을 바꾸면?

hello world2라고 변경 후, 접속하면 ec2에서는 hello world2라고 보이지만 cloudFront에서는 여전히 hello world라고 보인다.

이때, invalidation 무효화를 해줘야 한다. 

![cf5](../../images/AWS/cf5.png)

캐싱된 파일이 삭제되고 cloudFront는 새롭게 요청을 보내 새롭게 캐싱을 한다.

## 출처

https://us-east-1.console.aws.amazon.com/cloudfront/v3/home?region=ap-northeast-2#/welcome

https://www.youtube.com/watch?v=6C9284C-zP4
