# XSS

## XSS란? 

Cross-Site Scripting

웹 보안 취약점 중 하나. 

공격하려는 사이트에 악성 스크립트를 삽입할 수 있는 보안 취약점

XSS를 통해 C&C(좀비 PC에 명령을 내리거나 악성 코드를 제어하는 서버)로 리다이렉트 하거나 사용자의 쿠키를 탈취하여 세션 하이재킹 공격을 할 수 있음. 

## 종류 

### Stored XSS

공격자가 제공한 데이터가 서버에 저장된 후 지속적으로 서비스를 제공하는 정상 페이지에서 다른 사용자에게 스크립트가 노출되는 기법

### Reflected XSS

웹 어플리케이션의 지정된 파라미터를 사용할 때 발생하는 취약점을 이용

검색어 같은 쿼리스트링을 URL에 담아 전송했을 때, 서버가 필터링 거치지 않고 쿼리에 포함된 스크립트를 응답 페이지에 담아 전송함으로써 발생 

공격용 스크립트가 대상 웹사이트에 있지 않고 다른 매체에 포함됨. 

Stored XSS와는 다르게 DB에 스크립트가 저장되지 않음. 

## XSS 공격 방지 기법

### 1. XSS취약점이 있는 innerHTML 사용을 자제한다. 

HTML5에서는 innerHTML을 통해 주입한 스크립트는 실행되지 않음.

    <script>alert('hello');</script>

하지만, onerror 이벤트 속성을 통한 스크립트 주입은 가능

    <img src=x onerror=alert('xss attack')>

그러므로 꼭 필요한 경우가 아니라면 innerHTML을 통해 검증되지 않은 데이터를 넣지 않기. 

textContent, innerText를 사용하면 스크립트가 주입되지 않음. 

### 2. 쿠키에 HttpOnly 옵션을 활성화한다. 

활성화하지 않으면 스크립트를 통해 쿠키에 접근할 수 있어 Session Hijacking 취약점 발생 

    https://hacker.site?name=<script>alert(document.cookie);</script>

악의적인 클라이언트가 쿠키에 저장된 정보 (세션ID, 토큰)에 접근하는 것을 차단.

Local