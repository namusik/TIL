# Profile 

스프링은 profile을 지정해줄 수 있다. 

## @Profile("{...}")
~~~java
@Profile("test")
public void test(){
    ...
}

@Profile("local")
public void local(){
    ...
}
~~~
@Profile을 붙여주면, 해당 Profile이 active에 맞는 메서드가 실행된다.
메서드, 클래스에 붙을 수 있다.

## @ActiveProfiles("{...}")
Test class에서 사용되는 애노테이션.
해당 테스트가 실행될 때, 어떤 profile로 구동할지 정해준다. 

이렇게 되면 applicaton-test.properties를 우선순위로 참조한다. 

만약 test.properties가 없으면 디폴트인 application.properties를 참조한다.

## application-{...}.properties

기본적으로 스프링은 application.properties의 값을 참조하는데 

application-{profile}.properties의 형태로 파일을 만들 수 있다. 

이러면, 스프링이 해당 profile로 구동할 때, 위의 properties를 우선적으로 참조한다. 

그리고, default.properties의 값을 참조한다. 이때, 동일한 내용의 설정이 있을 때는 application-{profile}.properties의 값을 우선 적용한다. 공식문서에서는 overriden이란 표현을 쓴다. a last-wins strategy applies

공식문서
https://docs.spring.io/spring-boot/docs/3.1.0/reference/htmlsingle/#features.external-config.files.profile-specific

## spring.profiles.active={...}
특정 profile을 active 해줄 수 있는 설정이다. 

Similar to spring.profiles.active, spring.profiles.include can only be used in non-profile specific documents. This means it cannot be included in profile specific files or documents activated by spring.config.activate.on-profile.

spring.profiles.active는 무조건 application.properties에만 쓸 수 있다. 만약 profile을 특정한 application-test.properties에 적어주면 오류가 발생한다.

## spring.config.activate.on-profile
하나의 properties안에서 Profile 별로 구분을 지을 때 사용을 한다. 해당 Profile로 서버가 구동될때, 값을 참조한다.

~~~properties
 #---
 spring.config.activate.on-profile=local
 .
 .

 #---
 spring.config.activate.on-profile=dev
 .
 .
~~~

**그리고, spring.profiles.active와는 공존할 수 없다.**

## Profile Groups
비슷한 profile들을 그룹화할 수 있다. 
~~~properties
spring.profiles.group.dev=db,schedule
~~~
이러면, dev Profile로 동작할 때, db와 schedule Profile들을 한번에 activate할 수 있다. 
공식문서
https://docs.spring.io/spring-boot/docs/3.1.0/reference/htmlsingle/#features.profiles.groups

## 여러가지 상황테스트
상황1
test코드에 @ActiveProfiles("test")를 적용
application-test.properties를 test/resources에 생성
-->  test.properties 값을 정상적으로 참조한다. 그리고 main에 있는 application.properties의 값도 참조한다. 

상황2
test코드에 @ActiveProfiles("test")를 적용
application.properties를 test/resources에 생성
--> test경로의 default properties를 정상적으로 참조한다. 
profile명을 굳이 안넣어도 같은 test 경로에 있는 properties를 우선적으로 참조하는 것 확인.
이때 main의 default properties는 참조하지 않는다. 

상황3
test코드에 @ActiveProfiles("test")를 작성 x
application-test.properties를 test/resources에 생성.

--> main에 있는 application.properties를 참조한다. 
Profile을 지정해주지 않으면, default로 구동이 돼서 main에 있는 properties를 참조. 

상황4
test코드에 @ActiveProfiles("test")를 작성x
application.properties를 test/resources에 생성

--> 이때는 test 경로에 있는 application.properties를 참조한다. 
이유는 application-test.properties는 아예 profile이 test인 경우에만 참조하도록 명시를 해놨기 때문에, 오히려 뺐을 때 test경로에 있는 default properties를 참조한 것이다. 
이때는 main에 있는 default properties는 참조하지 않는다.

상황5 
test코드에 @ActiveProfiles("test")를 작성
main 경로의 application.properties에 spring.config.activate.on-profile=test를 작성.

--> 정상적으로 on-profile이 test인 경우의 설정을 참조.
