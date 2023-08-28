# HTML

## 정의

Hyper Text Markup Language

마크업 언어

## 형식

![htmltag](../Images/html/htmltag.png)

## 구조

```html
<!DOCTYPE html>
```

HTML5
현재 문서가 어떠한 버전으로 작성되어있는지.

html 문서 최상단

```html
<html lang="en"></html>
```

html태그 웹문서의 시작과 끝

lang : 문서가 어떤 언어로 작성되었는지

웹접근성이 향상된다.

## 태그 종류

`<strong>`과 `<em>`태그를 사용하자
웹접근성에 좋다.

`<ol>`
순서가 있는 목록

`<ul>`
순서가 없는 목록

`<li>`
하위 목록

`<table>`
표 태그. 표 전체를 감싼다.

`<caption>`
표의 제목이나 설명 태그

`<tr>`
행 태그
`<th>` 나 `<td>`가 반드시 있어야 한다.

`<th>`
표의 제목 열

`<td>`
열 태그

colspan : 열 병합
rowspan : 행 병합
대산 같은 group끼리만 가능

<colgroup>
<col>
테이블의 열 단위로 묶을 수 있다.

## 시멘틱 태그

semantic tag

[공식문서](https://developer.mozilla.org/ko/docs/Glossary/Semantics)

콘텐츠에 맞는 태그를 쓰자.

> 검색엔진 최적화
> 웹 접근성 최적화
> 가독성 향상
