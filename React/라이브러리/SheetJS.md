# SheetJS

[공식문서](https://docs.sheetjs.com/docs/)

## 무엇인가
SheetJS는 거의 모든 복잡한 스프레드시트에서 유용한 데이터를 추출하고 레거시 및 최신 소프트웨어에서 모두 작동하는 새로운 스프레드시트를 생성할 수 있는 실전에서 검증된 오픈 소스 솔루션.

엑셀 

## 설치
```js
npm i --save https://cdn.sheetjs.com/xlsx-0.20.0/xlsx-0.20.0.tgz
```

## import
```js
import * as XLSX from 'xlsx'
```

## 주요 함수
- 엑셀로 만드려는 데이터 예시
```js
const rows = [
  { Name: "Bill Clinton", Index: 42 },
  { Name: "GeorgeW Bush", Index: 43 },
  { Name: "Barack Obama", Index: 44 },
  { Name: "Donald Trump", Index: 45 },
  { Name: "Joseph Biden", Index: 46 }
]
```
- workbook 생성
```js
const worksheet = XLSX.utils.json_to_sheet(rows);
```

- aoa_to_sheet
```js
const worksheet = XLSX.utils.aoa_to_sheet([fixedSentences, variables])
```