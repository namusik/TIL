# Springboot Session Redis

## 의존성
```gradle
implementation 'org.springframework.session:spring-session-data-redis'

implementation 'org.springframework.boot:spring-boot-starter-data-redis'
```

## @EnableRedisHttpSession
```java
@SpringBootApplication
@EnableRedisHttpSession
public class RedisSessionApplication {
  .........
}
```

## 세션 저장
```java
@RestController
public class LoginController {
    @GetMapping("/login")
    public String login(HttpSession session, @RequestParam String name) {
        session.setAttribute("name", name);

        return "saved";
    }

    @GetMapping("/myName")
    public String myName(HttpSession session) {

        return (String) session.getAttribute("name");
    }
}
```
- HttpSession을 그대로 이용

## SESSION
- JSESSIONID가 아니라 SESSION 이름으로 http header에 전달됨