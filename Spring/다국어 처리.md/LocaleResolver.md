# LocaleResovler

## Accept-Language
웹 브라우저의 언어 설정 우선 순위를 변경하면 바뀌는 값. 
기본적으로 스프링에서 messageSource는 Accept-Language 값을 읽는것이 Default이다. 
이때 쓰이는 것이 **AcceptHeaderLocaleResolver**.

## 원리
Locale 선택방식을 변경할 수 있도록 도와주는 인터페이스.

요청이 들어오면 DispatcherServlet이 localeResolver를 찾는다. 
발견하면, locale을 세팅한다. 

interceptor를 hanlder mapping에 넣어서 locale을 변경하도록 커스텀 할 수 있다.

Locale 선택방식을 변경하기 위해서는 LocaleResovler 구현체를 Bean으로 등록해줘야 한다. 이때 이름은 **localeResolver**로 등록해줘야 한다. 

## 메서드
~~~java
Locale resolveLocale(HttpServletRequest request);
~~~
Resolve the current locale via the given request.

현재 요청의 locale을 반환

~~~java
void setLocale(HttpServletRequest request, @Nullable HttpServletResponse response, @Nullable Locale locale);
~~~
requet와 response의 Locale을 주어진 locale로 설정.

## Locale Resolve 전체적인 흐름
~~~java
<LocaleContextResolver>
LocaleContext resolveLocaleContext(HttpServletRequest request);
~~~
LocaleContextResolver에는 resolveLocaleContext라는 메서드가 있다. 

Cookie, Session, Fixed Resolver들은 LocaleContextResolver를 상속받아서(중간에 abstract Class가 껴있긴 하지만) 사용한다. 각, resolver가 Locale을 resolve 해오는 방식은 서로 다르다. 

~~~java
<DispatcherServlet>
@Override
protected LocaleContext buildLocaleContext(final HttpServletRequest request) {
    LocaleResolver lr = this.localeResolver;
    if (lr instanceof LocaleContextResolver localeContextResolver) {
        return localeContextResolver.resolveLocaleContext(request);
}
}
~~~
DispatcherServlet의 buildLocaleContext()에서 resolveLocaleContext() 호출해 LocaleContext를 반환한다. 

~~~java
<FrameworkServlet>
LocaleContext localeContext = buildLocaleContext(request);

initContextHolders(request, localeContext, requestAttributes);

private void initContextHolders(HttpServletRequest request,
@Nullable LocaleContext localeContext, @Nullable RequestAttributes requestAttributes) {
if (localeContext != null) {
LocaleContextHolder.setLocaleContext(localeContext, this.threadContextInheritable);
}
}
~~~
FrameworkServlet은 LocaleContext를 반환받아 
LocaleContextHolder에 setLocaleContext 메서드로 저장해주는 것을 확인할 수 있다.

결론적으로, Request가 들어왔을 때 DispatcherServlet에서 LocaleResolver를 호출하고, 각 LocaleResolver가 가져온 Locale값을 LocaleContextHolder에 저장된다. 

~~~java
public static Locale getLocale(@Nullable LocaleContext localeContext) {
    if (localeContext != null) {
        Locale locale = localeContext.getLocale();
        if (locale != null) {
            return locale;
        }
    }
}
~~~
LocaleContextHolder.getLocale()을 통해 resolve한 Locale값을 가져올 수 있다.

알게된 점은 이미 DispatcherServlet시점에 Locale 정보가 LocaleContextHolder에 저장된다는 점이다. MessageSrouce에서 사용하는 Locale은 이때 저장된 LocaleContextHolder에서 가져온다.

## Locale Set 전체 흐름

~~~java
<LocaleChangeInterceptor>
prehandle(
    try {
        localeResolver.setLocale(request, response, parseLocaleValue(newLocale));
    }
)
~~~
먼저, LocaleChangeInterceptor의 prehandle()에서 LocaleContextResolver의 setLocale을 호출한다. 

~~~java
default void setLocale(HttpServletRequest request, @Nullable HttpServletResponse response, @Nullable Locale locale) {
    setLocaleContext(request, response, (locale != null ? new SimpleLocaleContext(locale) : null));
}
~~~
그러면 LocaleContextResolver는 setLocaleContext()를 호출하는데 

여기서, Cookie, Session, Fixed LocaleResolver들의 setLocaeContext()가 실행된다. 

## AcceptHeaderLocaleResolver
스프링에서 default로 등록하는 localeResolver.
Http 헤더인 Accep-Language를 읽어서 locale을 정한다. 

AcceptHeaderLocaleResolver와 아래 3개의 Resolver와의 큰 차이점은 LocaleContextResolver를 상속하지 않는다는 점이다. 

~~~java
@Override
protected LocaleContext buildLocaleContext(final HttpServletRequest request) {
    LocaleResolver lr = this.localeResolver;
    if (lr instanceof LocaleContextResolver localeContextResolver) {
        return localeContextResolver.resolveLocaleContext(request);
    }
    else {
        return () -> (lr != null ? lr.resolveLocale(request) : request.getLocale());
    }
}
~~~
요청이 들어왔을 때, locale을 resolve하는 과정을 보면, buildLocaleContext에서 LocaleContextResolver를 상속받지 않기 때문에 
resolveLocaleContext()가 아닌 resloveLocale()을 호출한다. 

#### resolveLocale()
~~~java
Locale requestLocale = request.getLocale();
~~~
여러 조건이 있지만, 핵심적으로 request.getLocale()를 써서 Accept-Language 헤더의 Locale을 반환한다. 만약 값이 없다면 서버의 default locale을 반환한다.

#### setLocale()
headerResolver는 setLocale이 불가능하다. 왜냐하면 Accept-Language는 client의 세팅에 의해서만 변경할 수 있기 때문이다. 
사용시 아래의 Exception 반환.
~~~java
throw new UnsupportedOperationException(
    "Cannot change HTTP Accept-Language header - use a different locale resolution strategy");
~~~

## CookieLocaleResolver
[공식문서](https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-servlet/localeresolver.html#mvc-localeresolver-cookie)

쿠키에서 Locale정보가 특정돼있는지 찾은 후, Locale 설정.

useful for stateless applications without user sessions. (서버에 상태를 저장하지 않기 때문에, 모든 요청에 Cookie를 이용하는 것이 나을 것이다.)

#### resolveLocale
~~~java
@Override
public LocaleContext resolveLocaleContext(final HttpServletRequest request) {
    parseLocaleCookieIfNecessary(request);
    return new TimeZoneAwareLocaleContext() {
        public Locale getLocale() {
            return (Locale) request.getAttribute(LOCALE_REQUEST_ATTRIBUTE_NAME);
        }
    };
}
~~~
먼저, parseLocaleCookieIfNecessary()를 호출해서 Cookie에서 Locale을 읽은 후, request의 Attribute에 값을 넣어준다.

HttpServletRequest의 LOCALE_REQUEST_ATTRIBUTE_NAME(CookieLocaleResolver.class.getName() + ".LOCALE")의 이름을 가진 Attribute를 가져와 Locale을 resolve한다.

#### setLocaleContext()
~~~java
public void setLocaleContext(HttpServletRequest request, @Nullable HttpServletResponse response,
    @Nullable LocaleContext localeContext) {
    locale = localeContext.getLocale()
}
response.addHeader(HttpHeaders.SET_COOKIE, this.cookie.toString());
request.setAttribute(LOCALE_REQUEST_ATTRIBUTE_NAME,
        (locale != null ? locale : this.defaultLocaleFunction.apply(request)));
}
~~~
CookieLocaleResolver setLocale 과정이다. 
핵심만 설명하자면, LocaleContext에 저장된 locale을 가져와 다른 정보와 조합후 String으로 만들어서, set_cookie 이름으로 header에 집어 넣는다. 이제 브라우저는 이 쿠키를 기억해서 request마다 전송한다.

그리고 HttpServletRequest Attribute에 locale값을 넣어준다.





## SessionLocaleResolver
[공식문서](https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-servlet/localeresolver.html#mvc-localeresolver-session)

locale setting을 서블릿 컨테이너의 HttpSession에 저장.

당연히 세션이 종료되면 Locale 세팅도 사라진다.

##  참고
https://terry9611.tistory.com/304

https://velog.io/@chlee4858/spring-LocaleResolver-%EA%B0%9C%EC%9A%94