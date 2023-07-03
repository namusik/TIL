#LocaleResolver

## LocaleContextHolder

## LocaleResolver 종류 

## AcceptHeaderLocaleResolver

    Spring 기본 설정 Resolver

    웹브라우저의 locale 정보(Accept Language)에 따라
    application local 정보를 지정하게 됨. 

~~~java
@Bean
public AcceptHeaderLocaleResolver acceptHeaderLocaleResolver() {
    return new AcceptHeaderLocaleResolver();
}
~~~

### SessionLocaleResolver    

    처음에는 브라우저의 Accept-language로 값이 결정됨. 

    단, setDefaultLocale을 설정한다면 최우선 적용.

    세션으로 저장.

~~~java
@Bean
public SessionLocaleResolver sessionLocaleResolver() {
    SessionLocaleResolver sessionLocaleResolver = new SessionLocaleResolver();
    sessionLocaleResolver.setDefaultLocale(new Locale("en"));
    return sessionLocaleResolver;
}
~~~

Locale Set
~~~java
@GetMapping("/locale")
public void changeLocale(String language, HttpSession httpSession) {
    httpSession.setAttribute(SessionLocaleResolver.LOCALE_SESSION_ATTRIBUTE_NAME, new Locale(language));
}
~~~

### CookieLocaleResolver

    Cookie를 이용해서 Locale 정보를 담음.

    setLocale()을 통해 Locale 정보를 담은 Cookie를 생성하고 

    resolveLocale()에서는 Cookie로부터 locale정보를 가지고 옴.

    session의 경우 세션이 끊기면 언어 설정이 되돌아오지만, 

    쿠키의 값을 우선으로 불러옴.

Configuration
~~~java
@Bean
public CookieLocaleResolver cookieLocaleResolver() {
    CookieLocaleResolver cookieLocaleResolver = new CookieLocaleResolver();
    cookieLocaleResolver.setCookieName("lang"); //쿠키명
    cookieLocaleResolver.setDefaultLocale(new Locale("ko")); 
    cookieLocaleResolver.setCookieHttpOnly(true);
    return cookieLocaleResolver;
}
~~~

Locale Set
~~~java
Locale locale = new Locale(language); //Controller에서 받은 변수 language

cooKieLocaleResolver.setLocale(request, response, locale);
~~~
setLocale()으로 Cookie에 Locale 정보 담기

Locale Get
~~~java
Locale locale = cookieLocaleResolver.resolveLocale(request);
~~~
resolveLocale()으로 Cookie에 담긴 Locale 정보 가져오기


## 참고 

https://gist.github.com/dlxotn216/cb9fe1e40c7961da9d7147d9ebc876d6

https://oingdaddy.tistory.com/363