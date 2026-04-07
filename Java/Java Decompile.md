# Java Decompile (디컴파일)

> 2026-04 기준 정리

## 개괄

디컴파일은 컴파일된 바이너리(`.class`, `.jar`)를 사람이 읽을 수 있는 소스코드(`.java`)로 복원하는 과정이다.

> 완성된 케이크(바이너리)를 보고 레시피(소스코드)를 역으로 추정하는 것과 같다. 100% 원본은 아니지만, 재료와 순서를 대부분 알아낼 수 있다.

---

## 컴파일 vs 디컴파일 vs 디스어셈블

```
        컴파일 (javac)         디스어셈블 (javap)
.java ──────────────→ .class ──────────────→ 바이트코드 텍스트 (사람이 읽을 수 있는 명령어)
                        │
                        │  디컴파일 (CFR 등)
                        └──────────────→ .java (복원된 소스코드)
```

| 방향 | 과정 | 입력 | 출력 | 도구 |
|------|------|------|------|------|
| **컴파일** | 소스 → 바이트코드 | `.java` | `.class` | `javac` |
| **디스어셈블** | 바이트코드 → 명령어 텍스트 | `.class` | 바이트코드 읽기 가능 형태 | `javap` |
| **디컴파일** | 바이트코드 → 소스 | `.class` / `.jar` | `.java` (복원) | CFR, Procyon 등 |

- **디스어셈블**: 바이트코드를 있는 그대로 텍스트로 표현. 정보 손실 없음
- **디컴파일**: 바이트코드를 분석해서 원본 Java 소스를 추정/복원. 일부 정보 손실 가능

Java는 기계어가 아닌 **바이트코드(Bytecode)**로 컴파일되기 때문에, C/C++ 같은 네이티브 언어보다 디컴파일 복원률이 훨씬 높다.

> 바이트코드는 JVM이 읽는 중간 언어인데, 변수명이나 메서드 시그니처 같은 메타정보가 상당 부분 보존된다. 그래서 원본에 가까운 소스 복원이 가능하다.

---

## JAR 파일과의 관계

JAR(Java ARchive)는 여러 `.class` 파일을 하나로 묶은 **ZIP 형식의 압축 파일**이다.

```
KShotAgent2.2.6.jar
├── META-INF/MANIFEST.MF
├── com/kpmobile/kshotagent/SendThread.class
├── com/kpmobile/kshotagent/ReceiveThread.class
├── com/kpmobile/kshotagent/SendManager.class
└── ...
```

> JAR = 클래스 파일들의 택배 박스. 디컴파일러는 이 박스를 열고 각 클래스를 소스로 복원한다.

JAR 안의 클래스 목록만 보고 싶다면:

```bash
jar tf MyApp.jar | grep '\.class$'
```

---

## 바이트코드 분석 (javap)

> 디컴파일이 "소스 복원"이라면, `javap`는 "바이트코드를 있는 그대로 읽는 것". X-ray로 내부 구조를 직접 보는 것과 같다.

`javap`는 **JDK에 기본 내장**된 디스어셈블러로, `.class` 파일의 바이트코드를 사람이 읽을 수 있는 형태로 보여준다. 디컴파일러가 "추정"하는 것과 달리, 바이트코드 그 자체를 보여주므로 **정보 손실이 없다.**

```bash
# 클래스 구조 확인 (public 멤버)
javap MyClass.class

# 전체 멤버 확인 (private 포함)
javap -p MyClass.class

# 바이트코드 명령어까지 출력
javap -c MyClass.class

# 바이트코드 + 상수 풀 + 라인 넘버 등 모든 정보
javap -v MyClass.class

# JAR 안의 특정 클래스 분석
javap -c -cp MyApp.jar com.example.MyClass
```

### javap 출력 예시

```java
// 원본 소스
public int add(int a, int b) {
    return a + b;
}
```

```
// javap -c 출력
public int add(int, int);
  Code:
     0: iload_1        // 첫 번째 인자(a) 로드
     1: iload_2        // 두 번째 인자(b) 로드
     2: iadd           // 두 값을 더함
     3: ireturn        // 결과 반환
```

### javap vs 디컴파일러 비교

| 항목 | `javap` | 디컴파일러 (CFR 등) |
|------|---------|-------------------|
| 출력 | 바이트코드 명령어 | Java 소스코드 |
| 정확도 | 100% (있는 그대로) | 추정이므로 오차 가능 |
| 가독성 | 낮음 (JVM 명령어 지식 필요) | 높음 (Java 소스) |
| 용도 | 성능 분석, 컴파일러 동작 확인 | 소스 복원, 로직 분석 |
| 설치 | JDK에 포함 | 별도 설치 필요 |

### javap 활용 사례

- **컴파일러 최적화 확인** — `String` 연결이 `StringBuilder`로 변환되는지 확인
- **제네릭 Type Erasure 확인** — 런타임에 제네릭 타입이 실제로 어떻게 처리되는지 확인
- **synchronized 블록의 바이트코드** — `monitorenter`/`monitorexit` 명령어 확인
- **람다/메서드 레퍼런스의 내부 구현** — `invokedynamic` 호출 확인

---

## 주요 디컴파일러 도구

| 도구 | 특징 | 사용 방식 | 최신 Java 지원 |
|------|------|-----------|---------------|
| **CFR** | 최신 Java 문법(람다, record, sealed 등) 지원이 가장 좋음 | CLI | Java 21+ |
| **Vineflower** | Fernflower의 현대판 포크. 출력 품질이 크게 향상됨 | CLI / IDE 플러그인 | Java 21+ |
| **Procyon** | 제네릭, enum 복원이 우수 | CLI | Java 8 수준 |
| **JD-GUI** | GUI로 JAR를 열어서 바로 탐색 가능 | GUI | Java 12 수준 |
| **Fernflower** | IntelliJ IDEA 내장 디컴파일러 | IDE 내장 | Java 17+ |
| **jadx** | Android DEX/APK 파일 지원에 특화 | CLI / GUI | - |

> Fernflower는 JetBrains가 IntelliJ를 위해 만든 오픈소스 디컴파일러인데, 커뮤니티가 이를 포크하여 출력 품질을 대폭 개선한 것이 **Vineflower**이다. 현재 독립 사용 시에는 Vineflower가 권장된다.

### CFR 사용법

```bash
# 설치 (macOS)
brew install cfr-decompiler

# 단일 클래스 디컴파일
cfr-decompiler MyClass.class

# JAR 전체 디컴파일 → 디렉토리 출력
cfr-decompiler MyApp.jar --outputdir ./decompiled

# 특정 클래스만 디컴파일
cfr-decompiler MyApp.jar --methodname run
```

### Vineflower 사용법

```bash
# JAR 다운로드 후 실행
java -jar vineflower.jar MyApp.jar ./decompiled

# 단일 클래스 디컴파일
java -jar vineflower.jar MyClass.class ./output/
```

### JD-GUI 사용법

```bash
# 설치 (macOS)
brew install --cask jd-gui

# 실행 후 JAR 파일을 드래그 앤 드롭하면 소스를 탐색할 수 있다
```

### IntelliJ에서 디컴파일

별도 설치 없이 IntelliJ에서 `.class` 파일이나 `.jar`를 열면 **Fernflower가 자동으로 디컴파일**하여 소스를 보여준다.

1. Project Structure → Libraries에 JAR 추가
2. 또는 JAR 파일을 프로젝트에 드래그 앤 드롭
3. 클래스 파일 더블클릭 → 디컴파일된 소스 확인

- 의존성 라이브러리의 클래스를 `Ctrl + Click`으로 들어가면 자동으로 디컴파일된 소스가 보이는 것도 이 기능 덕분

---

## 디컴파일 결과의 특징

디컴파일된 코드는 원본과 완전히 동일하지 않다.

### 복원되는 것

- 클래스 구조, 메서드 시그니처, 필드
- 제어 흐름 (if, for, while, switch)
- 문자열 리터럴, 상수값
- 어노테이션 (런타임 유지 정책인 경우)

### 복원되지 않는 것

| 항목 | 이유 |
|------|------|
| **지역 변수명** | 컴파일 시 디버그 정보가 없으면 `var1`, `var2`로 표시됨 |
| **주석** | 컴파일 과정에서 완전히 제거됨 |
| **원본 포매팅** | 들여쓰기, 줄바꿈 등은 복원 불가 |
| **일부 제네릭 정보** | Type Erasure로 인해 손실 가능 |
| **인라인된 상수** | `static final int MAX = 100`은 사용처에서 `100`으로 치환됨 |
| **람다의 원래 형태** | 경우에 따라 익명 클래스로 복원되기도 함 |

### 디버그 정보와 복원 품질

```bash
# 디버그 정보 포함 컴파일 (지역 변수명, 라인 번호 보존)
javac -g MyClass.java

# 디버그 정보 없이 컴파일 (운영 배포 시 일반적)
javac -g:none MyClass.java
```

- `-g` 옵션을 포함해 컴파일한 클래스는 지역 변수명까지 복원된다
- 운영 배포 시에는 보통 디버그 정보를 빼므로 변수명이 `var1`, `var2`로 나오는 경우가 많다

---

## 실전 활용 사례

### 외부 라이브러리 / 에이전트 분석

소스가 제공되지 않는 서드파티 JAR의 내부 동작을 확인할 때 유용하다.

```bash
# 예: 외부 에이전트의 CPU 과점유 원인 분석
cfr-decompiler Agent.jar --outputdir ./decompiled
```

디컴파일 후 `while` 루프에 `Thread.sleep()`이 없는 **busy-wait 패턴**을 발견하는 식으로, 성능 문제의 근본 원인을 코드 레벨에서 확인할 수 있다.

### 장애 분석

운영 중인 서버에서 돌아가는 JAR의 정확한 소스 버전을 알 수 없을 때, 실제 배포된 JAR를 디컴파일하여 현재 동작하는 로직을 확인한다.

### 호환성 확인

사용 중인 라이브러리가 내부적으로 deprecated API를 쓰고 있는지, 특정 Java 버전에 의존하는지 등을 확인할 때 활용한다.

### 바이트코드 레벨 성능 분석

`javap -c`로 컴파일러가 코드를 어떻게 최적화했는지 직접 확인한다.

```bash
# String 연결이 어떻게 컴파일되는지 확인
javap -c StringTest.class

# synchronized 블록의 실제 바이트코드 확인
javap -c -p SyncExample.class
```

---

## 난독화 (Obfuscation)

> 디컴파일을 어렵게 만드는 것. 자물쇠를 채워서 레시피를 쉽게 못 읽게 하는 것과 같다. 열 수는 있지만 읽기가 매우 어려워진다.

디컴파일 자체를 막을 수는 없지만, 복원된 코드를 분석하기 어렵게 만드는 기법이다.

### 주요 기법

| 기법 | 설명 |
|------|------|
| **이름 치환** | 클래스명, 메서드명을 `a`, `b`, `c` 등으로 변경 |
| **제어 흐름 변환** | 불필요한 분기를 추가하여 로직을 복잡하게 만듦 |
| **문자열 암호화** | 문자열 리터럴을 암호화하여 디컴파일 시 바로 보이지 않게 함 |
| **불필요 코드 삽입** | 실행되지 않는 dead code를 삽입하여 분석을 방해 |

### 주요 난독화 도구

| 도구 | 대상 | 특징 |
|------|------|------|
| **ProGuard** | Java / Android | 난독화 + 코드 축소(shrink) + 최적화. 가장 널리 사용 |
| **R8** | Android | Google이 ProGuard를 대체하기 위해 만든 도구. Android Gradle Plugin에 기본 내장 |
| **DashO** | Java | 상용 난독화 도구. 탬퍼 감지 등 추가 보호 기능 |

- Android 프로젝트에서는 R8이 기본이며, `minifyEnabled true` 설정으로 활성화
- 서버 사이드 Java에서는 ProGuard를 직접 사용하거나, 상용 솔루션을 사용

> 난독화된 JAR도 디컴파일 자체는 가능하지만, 복원된 코드가 `a.b(c.d())` 같은 형태라 분석이 매우 어려워진다. 다만 난독화되지 않은 JAR는 원본에 거의 가까운 수준으로 복원된다.

---

## 법적 참고사항

- 한국 저작권법에서는 **호환성 확보를 위한 역공학(리버스 엔지니어링)** 을 허용한다 (저작권법 제101조의4)
- 다만 **소스 코드 복제/재배포** 목적의 디컴파일은 저작권 침해에 해당할 수 있다
- 라이브러리의 라이선스 조건에서 역공학을 금지하는 경우도 있으므로 확인이 필요
- 실무에서는 주로 장애 분석, 호환성 확인, 보안 점검 등 정당한 목적으로 사용
