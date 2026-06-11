# 문자 인코딩 (Character Encoding)

> 최종 업데이트: 2026-06-10 | Unicode 15.1, RFC 9110 기준

## 개념

**인코딩(Encoding)** 은 문자를 바이트로 변환하는 규칙이고, **디코딩(Decoding)** 은 바이트를 문자로 복원하는 규칙이다.

> 비유: 모스 부호. '가'라는 글자를 전신으로 보내려면 약속된 규칙(모스 부호표)에 따라 점·선 신호로 바꿔야 한다. 받는 쪽은 같은 규칙표로 신호를 다시 글자로 복원한다. 인코딩 = 글자 → 신호, 디코딩 = 신호 → 글자. **규칙표가 달리면 신호를 받아도 다른 글자가 나온다.**

컴퓨터 네트워크·파일 시스템에서 전달되는 것은 항상 **바이트(byte)** 다. "한글 자체", "순수한 텍스트"로 전송하는 방법은 없다. 바이트에 도달하는 순간, 인코딩은 이미 결정되어 있다.

```
사용자 입력 '가'
      ↓  (클라이언트가 인코딩)
 바이트: EA B0 80  ← UTF-8 인코딩된 '가'
      ↓  (네트워크 전송)
 서버 수신: EA B0 80  ← 바이트만 존재
      ↓  (서버가 디코딩)
 문자열 '가'
```

## 배경/역사

| 연도 | 사건 |
|------|------|
| 1963 | **ASCII** 표준화 (ANSI X3.4). 7비트 128자, 영문·제어문자 |
| 1980년대 | 각국이 ASCII 상위 128자(0x80~0xFF)를 자국어로 채워 사용 → **ISO-8859 시리즈**, **EUC-KR**, **Shift_JIS** 등 乱立 |
| 1991 | **Unicode Consortium** 설립. 전 세계 문자를 단일 집합으로 통합 목표 |
| 1993 | **UTF-8** 설계 (Ken Thompson · Rob Pike). ASCII 하위 호환 + 가변 길이 |
| 1996 | UTF-16 표준화. Java·Windows의 내부 문자열 표현으로 채택 |
| 2003 | RFC 3629 — UTF-8을 인터넷 표준 인코딩으로 확정, 최대 4바이트로 제한 |
| 2010년대 | 웹·리눅스·macOS 전반이 UTF-8 기본값으로 수렴. EUC-KR·Shift_JIS는 레거시로 퇴장 |

## 문자 추상화 3계층

```
추상 문자 (Abstract Character)
  └─ '가' — 인간의 언어적 개념. 바이트 없음.

코드 포인트 (Code Point)
  └─ U+AC00 — 유니코드가 '가'에 부여한 고유 번호. 아직 바이트 아님.

바이트 시퀀스 (Byte Sequence)
  └─ EA B0 80 — UTF-8로 U+AC00을 바이트로 변환한 결과. 이제 전송·저장 가능.
```

**유니코드(Unicode)는 인코딩이 아니다.** 문자에 고유 번호(코드 포인트)를 부여하는 **문자 집합(Character Set)** 표준이다. 실제로 바이트로 변환하는 인코딩 방식은 UTF-8, UTF-16, UTF-32 등이 별도로 존재한다.

| 공식 명칭 | 영문 약어 | 역할 | 예시 |
|----------|----------|------|------|
| 문자 집합 | **CCS** (Coded Character Set) | 문자 ↔ 번호 매핑표 | Unicode, ASCII |
| 인코딩 방식 | **CES** (Character Encoding Scheme) | 번호 → 바이트 변환 **규칙표** | UTF-8, UTF-16, EUC-KR |

UTF-8, EUC-KR 같은 것들이 바로 **CES** — 모스 부호의 규칙표에 해당한다. 실무에서는 CES를 그냥 **"인코딩"** 이라고 부르고, HTTP에서는 **"charset"** 이라고 쓴다.

> `charset`은 엄밀히 CCS+CES를 합쳐 부르는 실용적 줄임말이다. 기술적으로 정확한 표현은 아니지만 업계 관행상 "인코딩"과 동의어로 통용된다.
>
> ```
> Content-Type: charset=UTF-8   → "이 바이트는 UTF-8 규칙으로 해석하세요"
> Content-Type: charset=EUC-KR  → "이 바이트는 EUC-KR 규칙으로 해석하세요"
> ```

## UTF-8 / UTF-16 / UTF-32

### UTF-8

- **가변 길이**: 1~4바이트
- ASCII(U+0000~U+007F): 1바이트 — ASCII와 완전 호환
- 한글(U+AC00~U+D7A3): **3바이트**
- 이모지·보조 평면(U+10000~): 4바이트
- 웹·리눅스·macOS 기본. RFC 3629로 인터넷 표준

```
'A'  U+0041 → 41              (1바이트)
'가' U+AC00 → EA B0 80        (3바이트)
'😀' U+1F600 → F0 9F 98 80   (4바이트)
```

### UTF-16

- **가변 길이**: 2 또는 4바이트 (서로게이트 페어)
- 한글: **2바이트** — UTF-8보다 효율적
- BOM(Byte Order Mark)으로 엔디언 구분: `FE FF`(BE) / `FF FE`(LE)
- Java `String` 내부, JavaScript 엔진, Windows API 기본 인코딩

```
'가' U+AC00 → AC 00 (UTF-16 BE, 2바이트)
```

### UTF-32

- **고정 길이**: 항상 4바이트
- 모든 코드 포인트를 동일 크기로 저장 → 인덱스 접근 O(1)
- 공간 낭비가 심해 파일·네트워크 전송에는 거의 미사용

| 인코딩 | '가' 바이트 수 | 특징 |
|--------|-------------|------|
| UTF-8 | 3바이트 | 웹 표준, ASCII 호환 |
| UTF-16 | 2바이트 | Java/JS 내부 표현 |
| UTF-32 | 4바이트 | 고정 길이, 공간 비효율 |
| EUC-KR | 2바이트 | 한글 2,350자만 |
| CP949 | 2바이트 | 한글 11,172자, Windows 레거시 |

## HTTP에서의 인코딩

HTTP 바디는 바이트 스트림이다. 서버는 바디를 받았을 때 어떤 인코딩인지 알아야 디코딩할 수 있다. 이 정보를 전달하는 것이 `Content-Type` 헤더의 `charset`이다.

```
Content-Type: application/json; charset=UTF-8
Content-Type: text/html; charset=EUC-KR
Content-Type: application/x-www-form-urlencoded; charset=UTF-8
```

**`charset`이 없으면?**

- HTTP/1.1 스펙(RFC 7231)은 `text/*` 타입의 기본값으로 ISO-8859-1을 명시했으나, 현실적으로는 클라이언트·서버 모두 UTF-8로 동작한다.
- Spring Boot 기준: `CharacterEncodingFilter`가 UTF-8을 기본 적용.
- 구형 Windows 환경의 HTML 폼은 `EUC-KR(CP949)`로 전송하는 경우가 있었음.

```java
// Spring Boot — 요청 인코딩 강제 설정
@Bean
public FilterRegistrationBean<CharacterEncodingFilter> encodingFilter() {
    CharacterEncodingFilter filter = new CharacterEncodingFilter();
    filter.setEncoding("UTF-8");
    filter.setForceEncoding(true);  // Content-Type charset 없어도 UTF-8 강제
    return new FilterRegistrationBean<>(filter);
}
```

## 인코딩 불일치와 깨짐 (Mojibake)

**깨짐의 원인은 항상 하나: 인코딩된 방식 ≠ 디코딩한 방식**

```
EUC-KR로 인코딩된 '가':  B0 A1

UTF-8 디코더로 읽으면:
  B0 = 1011 0000 → UTF-8 규칙상 유효하지 않은 시작 바이트
  → 교체 문자(U+FFFD, '?') 또는 쓰레기 문자
```

UTF-8이 해당 문자를 지원하지 않아서 깨지는 것이 **아니다.** UTF-8은 유니코드 전체(한글 11,172자 포함)를 지원한다. 바이트 해석 규칙이 달라서 잘못 읽히는 것이다.

올바른 변환 순서:

```
EUC-KR 바이트  →  EUC-KR 디코딩  →  유니코드 문자열  →  UTF-8 인코딩  →  UTF-8 바이트
   B0 A1      →      '가'        →     U+AC00        →    EA B0 80    →    EA B0 80
```

## 언어별 내부 문자열 표현

프로그래밍 언어에서 소스코드의 `String` 변수는 바이트가 아닌 **유니코드 코드 포인트의 시퀀스**로 관리된다. 인코딩 개념이 등장하는 시점은 외부(파일·네트워크)와 교환할 때다.

| 언어 | 내부 표현 | 인코딩 발생 시점 |
|------|----------|--------------|
| Java | UTF-16 (Java 9+: Compact Strings로 Latin-1 최적화) | `getBytes()`, I/O 스트림 |
| Python 3 | UCS-4 (CPython 3.3+: PEP 393으로 동적 압축) | `encode()`, 파일 read/write |
| JavaScript | UTF-16 (V8 엔진) | `TextEncoder`, `fetch` body |
| Go | UTF-8 바이트 슬라이스 | 처음부터 UTF-8 |
| Rust | UTF-8 바이트 슬라이스 (`str`) | 처음부터 UTF-8 |

```java
String s = "가";           // 내부: UTF-16, 아직 바이트 아님
byte[] utf8  = s.getBytes(StandardCharsets.UTF_8);   // [EA, B0, 80]
byte[] euckr = s.getBytes("EUC-KR");                 // [B0, A1]

// 읽을 때도 인코딩 명시 필수
String back = new String(euckr, "EUC-KR");           // '가'
String broken = new String(euckr, StandardCharsets.UTF_8);  // 깨짐
```

## Java UTF-16 vs HTTP UTF-8 — 왜 안 깨지나

HTTP는 UTF-8을 쓰고 Java는 내부적으로 UTF-16을 쓴다. 얼핏 보면 불일치처럼 보이지만, **층위가 다르다.**

```
[HTTP 수신] UTF-8 바이트 (EA B0 80)
      ↓  CharacterEncodingFilter / HttpServletRequest
      ↓  UTF-8 디코딩
[Java 메모리] UTF-16 String "가"  ← Java가 처리하는 층위
      ↓  response.getWriter() / ObjectMapper
      ↓  UTF-8 인코딩
[HTTP 송신] UTF-8 바이트 (EA B0 80)
```

Java는 네트워크 경계(I/O)에서 **자동으로 변환**한다. 내부에서 UTF-16으로 처리하든 상관없이, 밖으로 나갈 때는 지정된 인코딩(기본 UTF-8)으로 변환해서 내보낸다.

> 비유: 공장 내부에서 미터법으로 작업하고, 수출 시에는 인치 단위로 변환해서 내보내는 것과 같다. 내부 단위와 외부 단위가 달라도 경계에서 변환만 정확히 하면 문제없다.

| 층위 | 인코딩 | 담당 |
|------|--------|------|
| HTTP 네트워크 | UTF-8 | Content-Type charset |
| Java 메모리 내부 | UTF-16 | JVM |
| 경계 변환 | UTF-8 ↔ UTF-16 | Servlet 컨테이너 / Spring |

**Java가 내부적으로 UTF-16을 쓰는 이유**: BMP(U+0000~U+FFFF) 범위 문자(한글 포함)가 고정 2바이트라 인덱스 접근·문자열 연산이 빠르다. UTF-8은 가변 길이라 n번째 문자를 찾으려면 앞부터 순회해야 한다. 내부 처리 효율과 외부 전송 표준(UTF-8) 사이의 트레이드오프 설계다.

## URL 인코딩 (Percent-Encoding)

URL은 ASCII만 허용하는 규격(RFC 3986)이다. 한글·특수문자를 URL에 포함하려면 **퍼센트 인코딩**으로 바이트를 `%XX` 형태로 표현한다.

```
'가' → UTF-8 바이트: EA B0 80 → URL: %EA%B0%80
검색어 "한글" → %ED%95%9C%EA%B8%80
```

브라우저 주소창에 한글을 입력하면, 브라우저가 자동으로 UTF-8 → 퍼센트 인코딩 변환을 수행한다.

## 관련 문서

- [한글-인코딩.md](한글-인코딩.md) — 한글 인코딩 역사 (조합형/완성형/EUC-KR/CP949)
- [데이터-포맷/Image-Format.md](데이터-포맷/Image-Format.md)

## 출처

- Unicode Standard 15.1 — unicode.org
- RFC 3629: UTF-8, a transformation format of ISO 10646
- RFC 9110: HTTP Semantics (Content-Type)
- Ken Thompson, Rob Pike — UTF-8 설계 원문 (1993)
