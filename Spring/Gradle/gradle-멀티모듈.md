# Gradle 멀티모듈 (Multi-Module)

> 최종 업데이트: 2026-07-16 | Gradle + Spring Boot 3.x 기준

## 개념

멀티모듈은 **하나의 프로젝트를 여러 개의 모듈(하위 프로젝트)로 쪼갠 빌드 구조**다. 공통 코드, API 서버, 배치 등을 각각의 모듈로 나누고, 이들을 **하나의 루트가 묶어** 함께 빌드한다.

> 회사 조직에 비유할 수 있다. **본사(루트)** 는 조직도와 공통 규정만 갖고, 실제 일은 **각 사업부(서브모듈)** 가 한다. 공용팀(engine-common)이 만든 걸 영업팀(engine-api)이 가져다 쓰는 식이다.

나누는 이유는 분명하다.

- **관심사 분리** — 도메인·API·배치를 물리적으로 격리
- **재사용** — 공통 모듈을 여러 실행 모듈이 공유
- **의존 방향 통제** — "common은 api를 몰라야 한다" 같은 규칙을 빌드로 강제
- **빌드 효율** — 바뀐 모듈만 다시 빌드(증분 빌드·캐시)

## 구조 — 루트와 서브모듈

```
my-project/
├─ settings.gradle
├─ build.gradle
├─ engine-common/
│  └─ build.gradle
├─ engine-api/
│  └─ build.gradle
└─ engine-batch/
   └─ build.gradle
```

| 경로 | 역할 |
|------|------|
| `my-project/` | **루트** — `settings.gradle` 위치, 모듈 선언·공통 설정 |
| `engine-common/` | 서브모듈 — 공통 코드 (라이브러리) |
| `engine-api/` | 서브모듈 — **실행 모듈** (bootJar 생성) |
| `engine-batch/` | 서브모듈 — 배치 실행 모듈 |

**루트는 `settings.gradle`이 있는 최상단 디렉토리**다. 이 파일이 "이 프로젝트는 어떤 모듈들로 구성되는가"를 정의한다.

## settings.gradle — 모듈 선언

루트의 `settings.gradle`에서 `include`로 하위 모듈을 등록한다. 여기 없는 폴더는 빌드에 참여하지 않는다.

```gradle
// settings.gradle (루트)
rootProject.name = 'my-project'

include 'engine-common'
include 'engine-api'
include 'engine-batch'
```

## 루트 build.gradle — 공통 설정

루트의 `build.gradle`은 **모든 서브모듈에 공통으로 적용할 설정**을 모아둔다. `subprojects {}`(또는 `allprojects {}`) 블록을 쓴다.

```gradle
// build.gradle (루트) — 공통 설정만, 보통 실행 코드는 없음
subprojects {
    apply plugin: 'java'
    group = 'com.example'

    repositories { mavenCentral() }

    java { sourceCompatibility = JavaVersion.VERSION_21 }
}
```

## 서브모듈 build.gradle — 각자의 의존

각 모듈은 자신의 `build.gradle`에서 필요한 의존을 선언한다. **다른 모듈에 의존할 땐 `project(':모듈명')`**을 쓴다.

```gradle
// engine-api/build.gradle
dependencies {
    implementation project(':engine-common')   // 공통 모듈을 가져다 씀
    implementation 'org.springframework.boot:spring-boot-starter-web'
}
```

## 실행 모듈 — bootJar가 나오는 곳

Spring Boot 앱은 **실행 가능한 jar(bootJar)** 로 패키징된다. 이 **bootJar가 나오는 모듈이 "실행 모듈"** 이고, `org.springframework.boot` 플러그인이 붙은 자리다.

```gradle
// engine-api/build.gradle — 실행 모듈
plugins {
    id 'org.springframework.boot' version '3.x'   // ← 이게 붙으면 bootJar 생성
    id 'io.spring.dependency-management'
}
```

반대로 **공통 모듈은 실행되지 않는 라이브러리**이므로 bootJar가 필요 없다. Boot 플러그인을 붙이지 않거나, 붙이더라도 `bootJar`를 끄고 일반 `jar`만 만든다.

```gradle
// engine-common/build.gradle — 라이브러리 모듈
tasks.bootJar { enabled = false }   // 실행 파일 안 만듦
tasks.jar     { enabled = true }    // 일반 jar만 (다른 모듈이 의존)
```

| 모듈 | Boot 플러그인 | 산출물 | 성격 |
|------|--------------|--------|------|
| `engine-common` | 없음(또는 bootJar off) | 일반 jar | 라이브러리 — 남이 가져다 씀 |
| `engine-api` | **있음** | **bootJar** | 실행 모듈 — `main()`으로 구동 |

## "루트가 실행 모듈"이란

여기가 헷갈리는 지점이다. **보통 멀티모듈에서 루트는 껍데기**다 — `src/`가 없고 빌드 설정만 담으며, 코드와 실행은 전부 서브모듈에 있다.

| 방식 | 루트 | 소스·실행 |
|------|------|-----------|
| **일반적 멀티모듈** | **껍데기** — 빌드 설정만, `src/` 없음 | 전부 서브모듈에 |
| **"루트가 실행 모듈"** | 루트에 `src/`가 있고 거기서 bootJar | 루트 + 서브모듈 |

즉 **"루트가 실행 모듈"** 이라는 말은 → 루트 디렉토리에도 **소스 코드가 있고, 거기서 직접 실행 파일(bootJar)이 나온다**는 뜻이다. 루트가 관리자 역할만 하는 게 아니라 실행 주체를 겸하는, 상대적으로 드문 구성이다.

## 모듈 간 의존 방향 — 순환 금지

모듈 의존은 **한 방향으로만** 흘러야 한다. `engine-api → engine-common`은 되지만, 그 반대나 서로 물고 도는 **순환 의존은 빌드 오류**다.

```
engine-api  ──▶  engine-common      (OK)
engine-batch ─▶  engine-common      (OK)
engine-common ─▶ engine-api         (❌ 순환·역방향)
```

그래서 **공통·저수준 모듈일수록 아래(피의존)에, 실행·고수준 모듈일수록 위(의존)에** 둔다. 이 방향을 빌드가 강제해주는 것이 멀티모듈의 큰 이점이다.

## 관련 문서

- [gradle-개념](gradle-개념.md) — Gradle·빌드의 기본
- [build.gradle](build.gradle.md) — build.gradle 파일 구조(plugins·buildscript)
- [JAR과 WAR](../../Java/Java-Theory/JAR과-WAR.md) — bootJar가 만드는 실행 가능 아카이브
