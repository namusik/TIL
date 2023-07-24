# messages.properties

## 용도
메세지 관리용 파일.

국제화를 위해 View에 표시되는 값을 하드코딩 하지않고 관리파일에 변수로 넣어서 Locale에 따라 다른 message 파일을 읽는다.

## 예시
messages.properties
messages_en.properties

이런 방식으로 Locale의 명을 뒤에 넣어서 만들어준다. 

~~~properties
label.name=aaa
label.param=bbb {0} {1}
~~~
Key, Value 형식으로 구성한다.

View에서 사용할 때는
~~~html
<th th:text="#{label.name}">ID</th>
<th th:text="#{label.param(${model 변수}, ${model 변수})}>
~~~
 #{}안에 key값을 넣어서 불러온다.

서버에서 값을 가져올 때는 
~~~java
messageSource.getMessage(메세지소스, new Object[]{매개변수1, 매개변수2}, Locale.언어상수)
~~~
를 이용해서 가져온다. 

## 주의
참고로 default인 messages.properties가 있어야 MessageSource의 auto-configuration이 적용된다.

## MessageSource
Message 파일을 관리하는 클래스.

공식문서
https://docs.spring.io/spring-framework/reference/core/beans/context-introduction.html#context-functionality-messagesource

스프링Boot에서는 자동으로 messageSource를 빈으로 등록을 해준다. 구현체 중에서 ResourceBundleMessageSource를 사용한다. 

MessageSourceAutoConfiguration의 생성자를 확인해보면 알 수 있다.

## 사용법

~~~properties
spring.messages.basename=error, messages
~~~

어떤 메세지 관리파일을 MessageSource에서 읽을지 설정해 줄 수 있다.

error.properties와 messages.properties 파일을 읽게 된다.

~~~java
messageSource.getMessage("메세지 변수명", args, locale)
~~~
메세지 파일에서 값을 불러오는 메서드이다. 
이때, locale 정보가 없으면 Locale.getDefault()를 가져온다. 

## SpringMessageResolver

~~~java
resolveMessage(
    return this.messageSource.getMessage(key, messageParameters, context.getLocale());
)
~~~

타임리프가 렌더링 될때, SpringMessageResolver가 동작하고, 그 안에서 메세지를 가져온다.
