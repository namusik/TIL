# XML (eXtensible Markup Language)

> 최종 업데이트: 2026-05-11 | W3C XML 1.0 (5th Edition) / XML 1.1 기준

## 개념

XML은 **데이터를 태그로 감싸 구조화하는 마크업 언어**이다. HTML이 "문서를 사람이 보기 좋게" 표현하는 데 특화됐다면, XML은 "데이터를 기계와 사람 모두가 읽을 수 있게" 표현하는 데 특화돼 있다. 태그 이름을 **사용자가 직접 정의**할 수 있다는 점이 핵심 (그래서 "eXtensible").

> 비유: HTML은 "이미 정해진 양식 서류"(`<h1>`, `<p>` 등 태그가 고정), XML은 "내가 칸 이름까지 직접 만드는 빈 양식". `<주문>`, `<고객명>` 같은 태그를 마음대로 만들 수 있다.

## 배경/역사

- **1986년** SGML(Standard Generalized Markup Language)이 ISO 표준으로 채택. XML과 HTML의 공통 조상. 강력하지만 너무 복잡해서 일반 개발자가 다루기 어려움.
- **1996년** W3C에서 SGML의 복잡함을 덜어내고 웹에 맞는 마크업 언어를 만들자는 워킹 그룹 발족 (Jon Bosak 주도).
- **1998년** XML 1.0 W3C 권고안(Recommendation) 발표.
- **2000년대 초반** SOAP, WSDL, RSS, AJAX(이름의 X가 XML!) 등으로 **웹 표준의 중심**으로 부상. "XML = 데이터 교환의 미래"라는 분위기.
- **2004년** XML 1.1 발표 (유니코드 확장 등 소폭 개정, 실제로는 1.0이 여전히 더 많이 쓰임).
- **2006년 이후** REST + JSON 조합이 부상하면서 웹 API 영역에서는 점차 밀려남. 단, **문서형 데이터·엔터프라이즈·설정 파일**에서는 여전히 광범위하게 사용 중.

> 한때 "XML로 안 되는 게 없다"는 분위기였지만, 2010년대 들어 "장황해서 사람이 못 읽겠다"는 비판과 함께 JSON에 자리를 내줌. 그래도 SOAP/SAML/SVG/Office 문서 등은 여전히 XML.

## 기본 구조

```xml
<?xml version="1.0" encoding="UTF-8"?>
<order id="1001">
  <customer>nam</customer>
  <items>
    <item price="3000">아메리카노</item>
    <item price="4500">라떼</item>
  </items>
  <note><![CDATA[ 얼음 많이 & 시럽 추가 ]]></note>
  <!-- 주문은 오전 10시 이후에만 접수 -->
</order>
```

| 구성요소 | 예시 | 설명 |
|---|---|---|
| XML 선언 | `<?xml version="1.0" encoding="UTF-8"?>` | 맨 첫 줄, 버전·인코딩 명시 (선택이지만 권장) |
| 엘리먼트 | `<customer>nam</customer>` | 여는 태그 + 내용 + 닫는 태그. 데이터의 기본 단위 |
| 빈 엘리먼트 | `<br/>` | 내용 없을 때 자기-닫음 태그 |
| 속성 | `id="1001"` | 엘리먼트의 부가 정보. 따옴표 필수 |
| 텍스트 노드 | `nam` | 태그 사이의 실제 데이터 |
| CDATA 섹션 | `<![CDATA[...]]>` | 내부 내용을 **파싱하지 않고** 그대로 처리 (`<`, `&` 같은 특수문자 그대로 사용 가능) |
| 주석 | `<!-- ... -->` | HTML과 동일 |
| 처리 명령(PI) | `<?xml-stylesheet ...?>` | 파서 외부 도구에 전달하는 지시문 |

## 문법 규칙 (well-formed)

XML은 **JSON만큼이나 엄격**하다. 아래 중 하나라도 어기면 파서가 거부 (well-formed 아님).

| 규칙 | 유효 | 불유효 |
|---|---|---|
| 단일 루트 엘리먼트 필수 | `<root><a/><b/></root>` | `<a/><b/>` (루트 둘) |
| 모든 태그 닫기 강제 | `<br/>` 또는 `<p></p>` | `<br>`, `<p>` |
| 대소문자 구분 | `<Tag></Tag>` | `<Tag></tag>` |
| 속성값 따옴표 필수 | `id="1"` 또는 `id='1'` | `id=1` |
| 올바른 중첩 | `<a><b></b></a>` | `<a><b></a></b>` |
| 특수문자 엔티티 처리 | `&amp;`, `&lt;` | 본문에 `&`, `<` 그대로 |
| 한 엘리먼트에 같은 속성명 1회 | `<a x="1"/>` | `<a x="1" x="2"/>` |

> **well-formed vs valid**: 위 문법만 지키면 **well-formed**. 추가로 DTD/XSD 스키마까지 만족하면 **valid**. JSON에는 없는 개념의 분리.

## 사전 정의 엔티티

본문에 그대로 못 쓰는 5개 문자는 엔티티로 치환:

| 문자 | 엔티티 |
|---|---|
| `<` | `&lt;` |
| `>` | `&gt;` |
| `&` | `&amp;` |
| `"` | `&quot;` |
| `'` | `&apos;` |

```xml
<expr>a &lt; b &amp;&amp; c &gt; d</expr>
```

CDATA 섹션 안에서는 이런 엔티티 처리 없이 그대로 쓰면 됨.

## 네임스페이스 (Namespaces)

여러 XML 어휘를 한 문서에 섞을 때 **태그 이름 충돌**을 막기 위한 장치. `xmlns:prefix="URI"`로 선언하고 `prefix:tag`로 사용.

```xml
<root xmlns:order="http://example.com/order"
      xmlns:cust="http://example.com/customer">
  <order:item>아메리카노</order:item>
  <cust:item>VIP 고객</cust:item>
</root>
```

URI는 **식별자**일 뿐 실제로 그 주소에 접속하지는 않는다 (혼동 포인트).

## 스키마 (구조 검증)

XML 문서의 "허용되는 구조"를 명시적으로 정의하는 별도 파일.

| 스키마 | 설명 | 현재 위치 |
|---|---|---|
| **DTD** (Document Type Definition) | XML 자체에 내장된 최초 스키마 언어. 문법이 XML과 다름 | 레거시, 보안 이슈로 점차 비활성화 |
| **XSD** (XML Schema Definition) | W3C 표준 스키마. **자체가 XML로 작성됨**. 타입·제약 풍부 | **사실상 표준** |
| **RELAX NG** | XSD보다 단순한 대안. OASIS 표준 | DocBook 등 일부에서 사용 |
| **Schematron** | 규칙 기반(assertion) 검증. XSD와 병행 사용 가능 | 비즈니스 규칙 검증 |

```xml
<!-- XSD 예시 일부 -->
<xs:element name="order">
  <xs:complexType>
    <xs:sequence>
      <xs:element name="customer" type="xs:string"/>
      <xs:element name="amount" type="xs:decimal"/>
    </xs:sequence>
    <xs:attribute name="id" type="xs:int" use="required"/>
  </xs:complexType>
</xs:element>
```

> JSON Schema가 등장하기 전까지 "스키마로 데이터 구조를 강제한다"는 개념을 만든 게 XSD. JSON Schema는 XSD의 아이디어를 JSON으로 가져온 것.

## XPath / XQuery / XSLT

XML 생태계 고유의 강력한 도구 3종.

| 도구 | 역할 | 비유 |
|---|---|---|
| **XPath** | XML 트리 내 노드 경로 표현/추출 | "JSON의 JSONPath" — `$.users[*].name` ↔ `/users/user/name` |
| **XQuery** | XML용 쿼리 언어 | "XML용 SQL" |
| **XSLT** | XML → 다른 형식(HTML/XML/텍스트) 변환 | "스타일시트로 데이터 변환" |

```xml
<!-- XPath 예시 -->
/order/items/item[@price>3000]/text()
<!-- "3000원 초과 item의 텍스트 노드 추출" -->
```

```xml
<!-- XSLT 한 줄 맛보기: XML → HTML 변환 규칙 -->
<xsl:template match="customer">
  <h1>고객: <xsl:value-of select="."/></h1>
</xsl:template>
```

## 파싱 방식 — DOM vs SAX vs StAX

XML은 크기가 커질 수 있어 **파싱 전략 선택**이 중요. JSON에는 거의 없는 고민.

| 방식 | 동작 | 장점 | 단점 |
|---|---|---|---|
| **DOM** | 전체를 트리로 메모리에 적재 | 임의 접근 자유, XPath 사용 가능 | 메모리 사용량 큼 |
| **SAX** | 이벤트 기반 push (startElement 등 콜백) | 메모리 적음, 스트리밍 | 코드 복잡, 되돌아가기 불가 |
| **StAX** | 이벤트 기반 pull (커서를 직접 전진) | 메모리 적음 + 코드 단순 | DOM보다 임의 접근 불편 |

자바에서는 `javax.xml.parsers`(DOM/SAX)와 `javax.xml.stream`(StAX) 표준 제공. 라이브러리는 Jackson XML, JAXB, dom4j, JDOM 등.

## 다른 데이터 포맷과 비교

| 포맷 | 가독성 | 크기 | 스키마 | 주 용도 |
|---|---|---|---|---|
| **XML** | 보통 | 큼 | **강함** (XSD/DTD/RELAX NG) | SOAP, 문서형(Office/SVG), 엔터프라이즈 |
| JSON | 좋음 | 중 | 약함 (JSON Schema 별도) | REST API, 설정, 로그 |
| YAML | 매우 좋음 | 작음 | 약함 | 사람 편집 설정 (k8s, CI) |
| Protocol Buffers | 없음(binary) | 매우 작음 | 강제 (.proto) | gRPC |

> **XML이 JSON에 밀린 이유**: ① 장황함(태그 두 번씩 적음), ② 속성 vs 엘리먼트 설계 결정 부담, ③ 네임스페이스 복잡도. **여전히 쓰이는 이유**: ① 강력한 스키마(XSD), ② XPath/XSLT 같은 성숙한 도구, ③ 문서·혼합 콘텐츠(텍스트 + 마크업) 표현력은 JSON으로 흉내내기 어려움.

## 속성 vs 엘리먼트 — 영원한 논쟁

같은 데이터를 두 방식으로 표현 가능:

```xml
<!-- 속성 스타일 -->
<user id="1" name="nam" age="30"/>

<!-- 엘리먼트 스타일 -->
<user>
  <id>1</id>
  <name>nam</name>
  <age>30</age>
</user>
```

| 기준 | 추천 |
|---|---|
| 값에 구조가 있거나 자식이 생길 수 있음 | 엘리먼트 |
| 단순 메타데이터 (id, lang, type 등) | 속성 |
| 반복 가능한 데이터 | 엘리먼트 (속성은 한 엘리먼트당 하나만) |
| 순서가 의미 있음 | 엘리먼트 (속성은 순서 보장 안 됨) |

> JSON에는 이 고민이 아예 없다 (속성 개념 자체가 없음). XML의 표현력이 더 풍부한 만큼 설계 부담도 늘어남.

## 실무 사용 시나리오

| 영역 | 예시 |
|---|---|
| 웹 서비스 | **SOAP** 메시지 본문, **WSDL** 인터페이스 정의 |
| 피드 | **RSS**, **Atom** |
| 인증/보안 | **SAML** (SSO 토큰), **XML Signature**, **XML Encryption** |
| 문서 포맷 | **Office Open XML**(`.docx`, `.xlsx`), **ODF**, **DocBook** |
| 그래픽 | **SVG** (벡터 이미지 = XML) |
| 자바 생태계 | **Maven `pom.xml`**, **Spring `applicationContext.xml`**(레거시), JAXB/Jackson XML 매핑 |
| 안드로이드 | **레이아웃 XML**, `AndroidManifest.xml` |
| 출판 | DITA, TEI |

## 흔한 함정

### 1. XXE (XML External Entity) 공격 — 가장 중요한 보안 이슈

XML은 외부 엔티티를 선언해 외부 파일/URL을 끌어올 수 있는 기능이 있다. 이를 악용하면 **서버 파일 유출·SSRF·DoS** 가능.

```xml
<?xml version="1.0"?>
<!DOCTYPE foo [
  <!ENTITY xxe SYSTEM "file:///etc/passwd">
]>
<foo>&xxe;</foo>
```

→ 파서가 `&xxe;`를 치환하면서 서버의 `/etc/passwd` 내용을 응답에 포함. **외부 입력 XML을 파싱하는 모든 서비스의 기본 위협**.

**방어**: 파서 설정에서 `disallow-doctype-decl=true`, `external-general-entities=false`, `external-parameter-entities=false`. 자바 표준 파서는 기본값이 안전하지 않으므로 **명시적으로 꺼야 함**.

### 2. Billion Laughs / Quadratic Blowup (DoS)

엔티티가 엔티티를 참조하는 식으로 재귀 정의하면 **메모리 폭발**.

```xml
<!ENTITY lol "lol">
<!ENTITY lol2 "&lol;&lol;&lol;&lol;&lol;&lol;&lol;&lol;&lol;&lol;">
<!ENTITY lol3 "&lol2;&lol2;&lol2;&lol2;&lol2;&lol2;&lol2;&lol2;&lol2;&lol2;">
<!-- ...lol9까지 가면 10^9 = 10억 개 -->
```

→ 엔티티 확장 횟수 제한 옵션을 켜야 함(자바 `FEATURE_SECURE_PROCESSING` 등).

### 3. 인코딩 선언과 실제 인코딩 불일치

`<?xml version="1.0" encoding="UTF-8"?>`로 선언했는데 파일은 EUC-KR로 저장한 경우 → 한글 깨짐. 선언과 실제 인코딩을 반드시 일치시킬 것.

### 4. 공백(whitespace) 처리

엘리먼트 사이의 줄바꿈/들여쓰기 공백도 **텍스트 노드로 취급**되는 경우가 있음. `xml:space="preserve"` 또는 파서 옵션으로 명시 제어 필요.

### 5. 네임스페이스 무시한 XPath

네임스페이스가 있는 문서에서 `/order/item`은 매치되지 않을 수 있음 (실제 노드 이름은 `{URI}item`). XPath 평가 시 네임스페이스 컨텍스트를 등록해야 함 — 흔히 빠뜨리는 실수.

### 6. 속성에 큰 데이터 / 멀티라인 넣기

속성값은 단일 라인의 단순값을 위한 것. 멀티라인·HTML 조각 등은 엘리먼트나 CDATA로 옮기는 게 정석.

## 동작 흐름 — 직렬화/역직렬화

```mermaid
flowchart LR
  JavaObj[자바 객체] -- JAXB / Jackson XML --> XmlStr1[XML 문자열]
  XmlStr1 -- HTTP / SOAP 전송 --> XmlStr2[XML 문자열]
  XmlStr2 -- 파서 DOM/SAX/StAX --> Other[다른 언어 객체]
  Other -- 직렬화 --> XmlStr3[XML 문자열]
  XmlStr3 -- 응답 --> JavaObj2[자바 객체]
```

JSON과 마찬가지로 **언어 간 공통 포맷** 역할이지만, JSON 대비 **스키마 검증·변환(XSLT)·쿼리(XPath)** 같은 부가 도구 체인이 풍부하다는 게 차별점.

## 자주 쓰는 도구

| 도구 | 용도 |
|---|---|
| **xmllint** | CLI에서 well-formed/valid 검사, XPath 평가 (`xmllint --xpath`) |
| **xmlstarlet** | XML용 jq 같은 CLI 변환기 |
| **Saxon** | XSLT/XQuery 엔진 (사실상 표준) |
| **JAXB / Jackson XML** | 자바 객체 ↔ XML 매핑 |
| **lxml** (Python) | 빠른 XML/HTML 파서 |

```bash
# well-formed 검사
xmllint --noout order.xml

# XSD로 validation
xmllint --schema order.xsd order.xml --noout

# XPath 추출
xmllint --xpath "//item[@price>3000]/text()" order.xml
```

## 한 줄 요약

> **XML = 사용자 정의 태그로 데이터를 구조화하는 마크업 언어, 강력한 스키마(XSD)와 도구 체인(XPath/XSLT/XQuery)이 장점.** JSON에 웹 API 자리는 내줬지만 문서·엔터프라이즈·설정 영역에서 여전히 현역.

## 관련 문서
- [[JSON]] — 더 가볍고 현대 API의 표준이 된 대안 포맷

## 참조
- W3C XML 1.0 (5th Edition): https://www.w3.org/TR/xml/
- W3C XML 1.1: https://www.w3.org/TR/xml11/
- W3C XML Schema (XSD): https://www.w3.org/TR/xmlschema11-1/
- W3C XML Namespaces: https://www.w3.org/TR/xml-names/
- XPath 3.1: https://www.w3.org/TR/xpath-31/
- OWASP XXE Prevention Cheat Sheet: https://cheatsheetseries.owasp.org/cheatsheets/XML_External_Entity_Prevention_Cheat_Sheet.html
