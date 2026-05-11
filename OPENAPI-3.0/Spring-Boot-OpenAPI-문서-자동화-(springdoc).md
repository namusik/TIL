# Spring Boot OpenAPI 문서 자동화 (springdoc)

> 최종 업데이트: 2026-03-23 | 기준: Spring Boot 3.4, springdoc-openapi 2.8.6

## springdoc-openapi란?

Spring Boot 컨트롤러를 스캔하여 OpenAPI 스펙을 자동 생성하고, SmartBear의 Swagger UI를 내장하여 브라우저에서 바로 확인할 수 있게 해주는 오픈소스 라이브러리.

```
Spring Boot Controller (어노테이션 스캔)
        ↓
springdoc-openapi  →  OpenAPI 스펙(JSON/YAML) 자동 생성
        ↓
Swagger UI (내장)  →  브라우저에서 시각화 및 테스트
```

## 라이브러리 선택

| 라이브러리 | 상태 | 비고 |
|-----------|------|------|
| Springfox | 2020년 이후 업데이트 중단 | 사용 지양 |
| **springdoc-openapi** | 활발히 유지보수 중 | Spring Boot 3.x 지원, 권장 |

## 의존성 추가

### Gradle

```groovy
// Spring Boot 3.x (Spring-MVC)
implementation 'org.springdoc:springdoc-openapi-starter-webmvc-ui:2.8.6'

// Spring Boot 3.x (WebFlux)
implementation 'org.springdoc:springdoc-openapi-starter-webflux-ui:2.8.6'
```

### Maven

```xml
<dependency>
    <groupId>org.springdoc</groupId>
    <artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>
    <version>2.8.6</version>
</dependency>
```

## 기본 설정

의존성만 추가하면 별도 설정 없이 Swagger UI가 자동 활성화된다.

- Swagger UI: `http://localhost:8080/swagger-ui.html`
- API docs (JSON): `http://localhost:8080/v3/api-docs`
- API docs (YAML): `http://localhost:8080/v3/api-docs.yaml`

### application.yml 커스터마이징

```yaml
springdoc:
  api-docs:
    path: /v3/api-docs
  swagger-ui:
    path: /swagger-ui.html
    tags-sorter: alpha           # 태그 알파벳 정렬
    operations-sorter: method    # HTTP 메서드 순 정렬
  default-consumes-media-type: application/json
  default-produces-media-type: application/json
```

## API 문서 정보 설정

```java
@Configuration
public class SwaggerConfig {

    @Bean
    public OpenAPI openAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("My API")
                        .version("1.0.0")
                        .description("API 설명"));
    }
}
```

## 주요 어노테이션

| 어노테이션 | 위치 | 설명 |
|-----------|------|------|
| `@Tag` | 클래스 | API 그룹 이름/설명 |
| `@Operation` | 메서드 | API 요약/설명 |
| `@Parameter` | 파라미터 | 파라미터 설명 |
| `@ApiResponse` | 메서드 | 응답 코드별 설명 |
| `@Schema` | DTO 필드 | 필드 설명, 예시값 |
| `@Hidden` | 클래스/메서드 | Swagger에서 숨김 |

## 적용 예시

### Controller

```java
@RestController
@RequestMapping("/api/users")
@Tag(name = "User", description = "사용자 API")
public class UserController {

    @Operation(summary = "사용자 조회")
    @ApiResponse(responseCode = "200", description = "성공")
    @ApiResponse(responseCode = "404", description = "사용자 없음")
    @GetMapping("/{id}")
    public UserResponse getUser(
            @Parameter(description = "사용자 ID") @PathVariable Long id) {
        return userService.findById(id);
    }

    @Operation(summary = "사용자 생성")
    @PostMapping
    public UserResponse createUser(@RequestBody UserRequest request) {
        return userService.create(request);
    }
}
```

### DTO

```java
@Schema(description = "사용자 요청")
public record UserRequest(
        @Schema(description = "이름", example = "홍길동")
        @NotBlank String name,

        @Schema(description = "이메일", example = "hong@example.com")
        @Email String email
) {}
```

## 트러블슈팅

### /v3/api-docs 한글 깨짐

응답의 `Content-Type`에 charset이 지정되지 않아 발생한다.

```yaml
# 방법 1: 서블릿 인코딩 강제
server:
  servlet:
    encoding:
      charset: UTF-8
      enabled: true
      force: true

# 방법 2: springdoc 설정
springdoc:
  default-produces-media-type: application/json;charset=UTF-8
```

## 환경별 Swagger 비활성화

운영 환경에서는 Swagger를 비활성화하는 것이 일반적이다.

```yaml
# application-prod.yml
springdoc:
  api-docs:
    enabled: false
  swagger-ui:
    enabled: false
```

## Spring Security 연동

Swagger UI 경로를 Security에서 허용해야 한다.

```java
@Bean
public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
    http.authorizeHttpRequests(auth -> auth
            .requestMatchers(
                    "/swagger-ui/**",
                    "/v3/api-docs/**"
            ).permitAll()
            .anyRequest().authenticated()
    );
    return http.build();
}
```

Bearer 토큰 인증을 Swagger UI에서 사용하려면:

```java
@Bean
public OpenAPI openAPI() {
    return new OpenAPI()
            .info(new Info().title("My API").version("1.0.0"))
            .addSecurityItem(new SecurityRequirement().addList("Bearer"))
            .components(new Components()
                    .addSecuritySchemes("Bearer",
                            new SecurityScheme()
                                    .type(SecurityScheme.Type.HTTP)
                                    .scheme("bearer")
                                    .bearerFormat("JWT")));
}
```
