# 리차드슨 성숙도 모델

> 최종 업데이트: 2026-04-08 | Richardson Maturity Model

## 개념

**Richardson Maturity Model(RMM)** 은 REST API가 얼마나 RESTful한지를 **4단계(Level 0~3)** 로 평가하는 모델이다.

REST 자체의 6가지 제약조건에 대해서는 [REST.md](./REST.md) 참고.

> **비유:** 음식점의 서비스 수준을 미슐랭 별점(0~3)으로 매기듯, REST API의 성숙도를 0~3 레벨로 매긴다고 생각하면 된다. 별이 많을수록 REST 원칙에 가깝다.

### 배경

- **Leonard Richardson**이 2008년 QCon 컨퍼런스에서 발표한 모델
- 이후 **Martin Fowler**가 자신의 블로그에서 정리하면서 널리 알려짐
- REST 아키텍처 스타일을 단계적으로 이해할 수 있는 실용적인 프레임워크로 자리잡음

### 전체 구조 다이어그램

```
Level 3 ── Hypermedia Controls (HATEOAS) ── 진정한 REST
  ▲
Level 2 ── HTTP Verbs + Status Codes    ── 대부분의 REST API
  ▲
Level 1 ── Resources (개별 URI)          ── 리소스 분리
  ▲
Level 0 ── The Swamp of POX             ── 단일 URI, RPC 스타일
```

### Level별 비교 표

| 구분 | URI | HTTP 메서드 | 상태 코드 | Hypermedia | 대표 예시 |
|---|---|---|---|---|---|
| **Level 0** | 단일 URI (`/api`) | POST만 사용 | 거의 200만 | X | SOAP, XML-RPC |
| **Level 1** | 리소스별 URI (`/doctors/123`) | POST만 사용 | 거의 200만 | X | 초기 REST 시도 |
| **Level 2** | 리소스별 URI | GET/POST/PUT/DELETE | 200/201/404 등 | X | 대부분의 REST API |
| **Level 3** | 리소스별 URI | GET/POST/PUT/DELETE | 200/201/404 등 | O (링크 포함) | 완전한 REST |

---

## Level 0: The Swamp of POX

> **비유:** 모든 민원을 하나의 창구에서 처리하는 관공서. 어떤 요청이든 같은 창구(URI)에 서류(POST body)를 제출한다.

- **하나의 URI**, **하나의 HTTP 메서드(POST)** 만 사용
- HTTP를 단순한 전송 터널로만 활용 (RPC 스타일)
- 요청의 종류는 Body 내부의 데이터로 구분
- 대표적인 예: **SOAP**, **XML-RPC**

### 요청/응답 예시

```
POST /api HTTP/1.1
```

```json
// 요청: 예약 가능한 시간 조회
{
  "action": "getOpenSlots",
  "doctorId": 123,
  "date": "2026-04-08"
}

// 응답
{
  "slots": [
    { "start": "14:00", "end": "14:50" },
    { "start": "16:00", "end": "16:50" }
  ]
}
```

```json
// 요청: 예약 생성 (같은 URI, 같은 메서드)
{
  "action": "createAppointment",
  "doctorId": 123,
  "start": "14:00",
  "patientId": 456
}
```

---

## Level 1: Resources

> **비유:** 관공서에 부서별 창구가 생겼다. 세금은 세무과, 주민등록은 주민과로 가지만, 아직 모든 요청을 "신청서(POST)"로만 처리한다.

- 각 리소스에 **개별 URI**를 부여
- 하지만 여전히 **POST만 사용** (HTTP 메서드의 의미를 활용하지 않음)
- Level 0 대비 개선점: 요청 대상이 URI로 명확해짐

### 요청/응답 예시

```
POST /doctors/123/slots HTTP/1.1
```

```json
// 요청: 예약 가능한 시간 조회 (리소스별 URI 사용)
{
  "date": "2026-04-08"
}

// 응답
{
  "slots": [
    { "id": "slot-1", "start": "14:00", "end": "14:50" },
    { "id": "slot-2", "start": "16:00", "end": "16:50" }
  ]
}
```

```
POST /slots/slot-1 HTTP/1.1
```

```json
// 요청: 예약 생성 (슬롯 리소스에 직접 요청)
{
  "patientId": 456
}
```

---

## Level 2: HTTP Verbs

> **비유:** 창구가 나뉜 데다가, 접수/조회/수정/삭제 같은 업무 유형에 따라 양식이 달라졌다. 조회는 열람 양식, 생성은 신청 양식을 쓰는 식이다.

- HTTP 메서드를 **의미에 맞게** 사용: `GET`, `POST`, `PUT`, `DELETE`
- HTTP 상태 코드를 **올바르게** 반환: `200`, `201`, `204`, `404`, `409` 등
- **안전한 연산(GET)** 과 **변경 연산(POST/PUT/DELETE)** 을 구분
- **실무에서 대부분의 REST API가 이 수준**에 해당

### 주요 HTTP 메서드와 용도

| 메서드 | 용도 | 안전성 | 멱등성 |
|---|---|---|---|
| `GET` | 리소스 조회 | O | O |
| `POST` | 리소스 생성 | X | X |
| `PUT` | 리소스 전체 수정 | X | O |
| `PATCH` | 리소스 부분 수정 | X | X |
| `DELETE` | 리소스 삭제 | X | O |

### 요청/응답 예시

```
GET /doctors/123/slots?date=2026-04-08 HTTP/1.1
```

```json
// 응답: 200 OK
{
  "slots": [
    { "id": "slot-1", "start": "14:00", "end": "14:50" },
    { "id": "slot-2", "start": "16:00", "end": "16:50" }
  ]
}
```

```
POST /doctors/123/appointments HTTP/1.1
```

```json
// 요청
{
  "slotId": "slot-1",
  "patientId": 456
}

// 응답: 201 Created
{
  "id": "appt-789",
  "doctorId": 123,
  "slotId": "slot-1",
  "patientId": 456,
  "status": "confirmed"
}
```

```
DELETE /appointments/appt-789 HTTP/1.1

// 응답: 204 No Content
```

---

## Level 3: Hypermedia Controls (HATEOAS)

> **비유:** 관공서 창구에서 서류를 처리하면, 직원이 "다음에 할 수 있는 일"을 안내문으로 알려준다. 예: "취소하려면 3번 창구로", "확인서 출력은 5번 창구로". 클라이언트가 다음 행동을 스스로 알 필요 없이 서버가 알려준다.

- **HATEOAS**: Hypermedia As The Engine Of Application State
- 응답에 **다음 가능한 액션의 링크(hypermedia controls)** 를 포함
- 클라이언트가 URI를 하드코딩하지 않고, 응답에 포함된 링크를 따라가며 상호작용
- Roy Fielding이 말하는 **진정한 REST**의 조건
- REST.md의 [HATEOAS 섹션](./REST.md)에서 제약조건으로서의 HATEOAS를 간략히 언급

### 핵심 원리 흐름도

```
클라이언트                          서버
   │                                │
   │── GET /doctors/123/slots ─────▶│
   │                                │
   │◀── 200 OK + slots + _links ───│
   │    (각 슬롯에 "예약하기" 링크)     │
   │                                │
   │── POST /slots/slot-1/book ────▶│  ← 응답에서 받은 링크 사용
   │                                │
   │◀── 201 Created + _links ──────│
   │    ("취소" 링크, "변경" 링크)      │
   │                                │
   │── DELETE (cancel 링크) ────────▶│  ← 역시 응답에서 받은 링크 사용
   │                                │
```

### 요청/응답 예시

```
GET /doctors/123/slots?date=2026-04-08 HTTP/1.1
```

```json
// 응답: 200 OK
{
  "slots": [
    {
      "id": "slot-1",
      "start": "14:00",
      "end": "14:50",
      "_links": {
        "book": {
          "href": "/slots/slot-1/book",
          "method": "POST"
        }
      }
    }
  ],
  "_links": {
    "self": { "href": "/doctors/123/slots?date=2026-04-08" },
    "next": { "href": "/doctors/123/slots?date=2026-04-09" }
  }
}
```

```
POST /slots/slot-1/book HTTP/1.1
```

```json
// 요청
{
  "patientId": 456
}

// 응답: 201 Created
{
  "id": "appt-789",
  "doctorId": 123,
  "slot": "slot-1",
  "patientId": 456,
  "status": "confirmed",
  "_links": {
    "self": { "href": "/appointments/appt-789" },
    "cancel": { "href": "/appointments/appt-789", "method": "DELETE" },
    "reschedule": { "href": "/appointments/appt-789/reschedule", "method": "PUT" },
    "doctor": { "href": "/doctors/123" }
  }
}
```

---

## 실무에서의 위치

### 대부분의 API는 Level 2

- 현실에서 **Level 2**가 사실상 표준이다. GitHub API, Stripe API, AWS REST API 등 대부분의 유명 API가 Level 2에 해당한다.
- Level 2만으로도 리소스 설계와 HTTP 의미론을 충분히 활용할 수 있다.

### Level 3(HATEOAS)는 드물다

- 구현/유지보수 비용이 높고, 클라이언트가 링크를 동적으로 따라가는 설계가 복잡하다.
- 실제 적용 사례: **PayPal API**, **GitHub API**(일부 `_links` 제공)
- Roy Fielding은 "HATEOAS가 없으면 REST가 아니다"라고 주장하지만, 실무에서는 현실적 타협이 일반적이다.

### Spring HATEOAS 라이브러리

| 항목 | 내용 |
|---|---|
| 프로젝트 | [Spring HATEOAS](https://spring.io/projects/spring-hateoas) |
| 역할 | Spring MVC/WebFlux 기반 API에 hypermedia 링크를 쉽게 추가 |
| 핵심 클래스 | `EntityModel`, `CollectionModel`, `Link`, `WebMvcLinkBuilder` |
| 지원 미디어 타입 | HAL (`application/hal+json`), HAL-FORMS, Collection+JSON 등 |

```java
// Spring HATEOAS 간단 예시
@GetMapping("/appointments/{id}")
public EntityModel<Appointment> getAppointment(@PathVariable Long id) {
    Appointment appt = service.findById(id);
    return EntityModel.of(appt,
        linkTo(methodOn(AppointmentController.class).getAppointment(id)).withSelfRel(),
        linkTo(methodOn(AppointmentController.class).cancel(id)).withRel("cancel")
    );
}
```

---

## 참고

https://en.wikipedia.org/wiki/Richardson_Maturity_Model

https://martinfowler.com/articles/richardsonMaturityModel.html

https://spring.io/projects/spring-hateoas
