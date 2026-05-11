# 로그인 후 요청 페이지로 redirect

로그인을 하지 않을 상태에서, 인증이 필요한 url에 요청을 보내면 보통 로그인 페이지로 이동하게 된다. 

로그인을 하고 나면 유저에게 어떤 페이지를 보여주는 것이 유저 친화적일지 생각해보면, 기존에 요청한 페이지로 redirect 해주는 것이 이상적이다. 

interceptor와 login handler의 조합으로 설정해줄 수 있다.

~~~java
String requestURI = request.getRequestURI();
//로그인으로 redirect
response.sendRedirect("/login?redirectURL=" + requestURI);
return false;
~~~
interceptor에서 인증이 실패하면 false를 반환하고 보통 로그인페이지로 이동하는 handler로 redirect 해준다. 

이때, 기존 요청 URI를 쿼리 파라미터로 붙여줘서 기억을 해둔다.

~~~java
PostMapping("/login")
public String loginV4(
    @RequestParam(defaultValue = "/") String redirectURL){
        return "redirect:"+redirectURL;
    }
~~~
그리고 redirect받은 Handler에서 URI 쿼리파라미터를 받아준다. 쿼리파라미터가 없을 때는 위해 default값을 지정해준다.

그리고 return redirect에 쿼리파라미터를 써준다. 없으면 default 경로로, 있으면 로그인 전에 했던 요청 URI로 넘어간다.

