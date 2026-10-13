# TypeScript

> 최종 업데이트: 2026-09-17 | TypeScript 5.x 기준

## 개념

**TypeScript**는 **JavaScript에 정적 타입 시스템을 얹은 언어**다. **JavaScript의 상위집합(superset)** — 모든 JavaScript 코드는 그대로 유효한 TypeScript 코드지만, 역은 성립하지 않는다(타입 문법은 JavaScript에 없다).

> 비유하면 — JavaScript가 **자유 양식 계약서**(뭐든 적어도 통과)라면, TypeScript는 **양식이 정해진 계약서**다. "이 칸엔 숫자만, 이 칸엔 이름만" 하고 미리 규칙을 정해두면, **틀리게 적는 순간(컴파일 시점) 바로 걸러준다.** 계약서 양식만 다를 뿐 결국 같은 계약(같은 로직)이다.

## 배경/역사

**Anders Hejlsberg**(C# 설계자, Turbo Pascal·Delphi 창시자로도 유명)가 **Luke Hoban**과 함께 Microsoft에서 주도해 개발했다. 2년의 내부 개발을 거쳐 **2012년 10월 v0.8로 최초 공개**됐으며, Apache License 2.0으로 오픈소스 공개됐다. 대규모 JavaScript 애플리케이션에서 겪는 복잡성 문제 — 타입 없는 동적 언어의 한계로 IDE 자동완성·리팩토링·런타임 오류 예방이 어려웠던 문제를 풀기 위해 만들어졌다.

- **2014년** — TypeScript 1.0, Visual Studio 완전 통합
- **2016년** — TypeScript 2.0, null 안전성(`strictNullChecks`) 도입. 같은 해 **Angular 2**가 TypeScript를 기본 언어로 채택하며 대중화가 크게 가속됨
- **현재** — React·Vue 등 프런트엔드 프레임워크 생태계 전반과 Node.js 백엔드에서 사실상 표준급으로 채택됨

## JavaScript와의 관계 — 상위집합(Superset)

```typescript
// 아래는 JavaScript 코드 그대로 — TypeScript로도 100% 유효하다
function greet(name) {
    return "Hello, " + name;
}

// 타입 정보를 더하면 TypeScript만의 코드가 된다 — JS엔 이 문법이 없다
function greetTyped(name: string): string {
    return "Hello, " + name;
}
```

기존 JS 코드베이스를 파일 확장자만 바꾸는 것으로 시작해, 점진적으로 타입을 추가해나갈 수 있다(**gradual typing**) — 이 점이 실무 도입 장벽을 크게 낮췄다.

## 실행 방식 — "실행"이 아니라 "JS로 변환 후 실행"

브라우저도 Node.js도 TypeScript를 직접 이해하지 못한다. 오직 JavaScript만 실행할 수 있다.

```mermaid
flowchart LR
    A[".ts 파일"] --> B["tsc(컴파일러)가<br/>타입 검사"]
    B --> C["타입 정보 제거<br/>(transpile)"]
    C --> D[".js 파일"]
    D --> E["브라우저/Node.js가<br/>실행"]
```

이 과정에서 **타입 오류를 컴파일 시점에 미리 잡아내고**, 최종 `.js`에는 타입 정보가 하나도 안 남는다 — 런타임에 타입을 검사하는 게 아니라 순전히 **개발 단계의 안전장치**다. [컴파일과 바이트코드](../../Java/Java-Theory/컴파일과-바이트코드.md#컴파일-타임-vs-런타임)의 "컴파일 타임 vs 런타임" 구분과 같은 원리 — Java의 `javac`가 하는 역할을 TS는 `tsc`가 한다.

## 타입 시스템 — 구조적 타이핑(Structural Typing)

TypeScript의 타입 시스템에서 가장 특이한 지점이다. Java·C#은 **이름 기반(nominal typing)**이라 타입이 명시적으로 같은 이름(같은 클래스/인터페이스)을 구현해야 호환되지만, TypeScript는 **구조가 같으면 호환**된다.

```typescript
interface Point { x: number; y: number; }

function printPoint(p: Point) { console.log(p.x, p.y); }

// Point를 명시적으로 구현하지 않았지만, 구조(x, y 필드)가 같아 통과
printPoint({ x: 10, y: 20, z: 30 });   // ✅ 컴파일 성공 (초과 필드는 허용)
```

이 밖에 핵심 기능은 다음과 같다.

| 기능 | 설명 |
|------|------|
| **타입 추론(inference)** | `let x = 10;`처럼 명시 안 해도 컴파일러가 타입을 자동으로 판단 |
| **제네릭(generics)** | `Array<T>`처럼 타입을 매개변수화해 재사용 가능한 타입 안전 코드 작성 |
| **인터페이스/타입 별칭** | `interface`, `type`으로 객체 모양을 정의 |
| **점진적 타이핑** | `any`로 특정 부분만 타입 검사를 건너뛸 수 있어 기존 JS와 섞어 쓰기 쉬움 |

## Node.js와의 관계 — 최근 크게 바뀐 지점

전통적으로 Node.js는 **순수 JavaScript 런타임**이라 `.ts` 파일을 직접 실행할 수 없었다. `ts-node`·`tsx` 같은 서드파티 도구나, `tsc`로 미리 `.js`로 컴파일해두는 절차가 필수였다.

**최근 Node.js 자체가 이 간극을 좁히고 있다.**

| Node.js 버전 | 지원 |
|--------------|------|
| ~22.5 이전 | `.ts` 직접 실행 불가 — 별도 도구 필요 |
| 22.6+ | `--experimental-strip-types` 플래그로 **타입 스트리핑(type stripping)** 실험 지원 |
| **22.18.0+** | 플래그 없이 **`node example.ts`가 기본으로 동작** |

**단, 중요한 함정이 있다** — 이건 "타입 검사"가 아니라 **"타입 표기만 지워버리고 나머지 JS를 그대로 실행"**하는 것뿐이다. `node`로 `.ts`를 돌려도 **타입 오류를 잡아주지 않는다.** 진짜 타입 검사는 여전히 별도로 `tsc --noEmit`을 돌려야 한다. 또한 `enum`이나 런타임 코드가 있는 `namespace`처럼 "지워도 되는 문법이 아닌" 것은 이 방식으로 실행이 안 된다. Node.js 자체에 대해서는 → [Node.js](../Node.js/Node.js.md).

## 정리

> **TypeScript = JavaScript의 상위집합에 정적 타입 시스템을 더한 언어.** Microsoft의 Anders Hejlsberg가 주도해 2012년 공개했으며, 모든 JS 코드는 유효한 TS 코드지만 역은 아니다. `tsc`가 타입을 검사하고 제거해 순수 JS로 변환해야 실제로 실행되며, 구조적 타이핑·타입 추론·제네릭이 핵심 기능이다. Node.js는 원래 JS만 실행 가능했지만 최근(22.18.0+) **타입 스트리핑**으로 `node example.ts`가 동작하게 됐다 — 다만 이건 타입 제거일 뿐 타입 검사가 아니므로 `tsc`를 별도로 병행해야 한다.

## 관련 문서

- [Node.js](../Node.js/Node.js.md) — TypeScript 실행 환경으로서의 Node.js, 타입 스트리핑
- [컴파일과 바이트코드](../../Java/Java-Theory/컴파일과-바이트코드.md) — 컴파일 타임 vs 런타임 구분의 Java 쪽 대응 사례
- [비동기 처리](../문법/비동기-처리.md) · [Promise](../문법/promise.md) — TypeScript가 타입을 얹는 대상인 JavaScript 자체의 비동기 문법

## 출처

- [Wikipedia — TypeScript](https://en.wikipedia.org/wiki/TypeScript)
- [TypeScript 공식 문서](https://www.typescriptlang.org/docs/)
- [Node.js — Running TypeScript Natively](https://nodejs.org/en/learn/typescript/run-natively)
