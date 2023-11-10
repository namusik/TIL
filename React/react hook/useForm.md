# useForm

## 개념
form을 쉽게 관리하기 위한 custom hook

## useForm

### register 
  * 입력값을 등록
  * 유효성 검사 규칙을 React Hook Form에 적용

### handleSubmit
  * form 유효성 검사가 성공하면 form 데이터 처리

### formState
  * 전체 form 상태(유효성, 변경 여부, 에러메시지)에 대한 정보 포함.

### defaultValues
  * form의 기본값 설정
  * 전체 form을 다 해주길 권장함.
  * `undefined`를 값으로 사용하지 말자
  * 캐싱이 된다.
  * 기본적으로 제출 결과에 포함됨.
  * 
```js
useForm({
  defaultValues: {
    firstName: '',
    lastName: ''
  }
})

// set default value async
useForm({
  defaultValues: async () => fetch('/api-endpoint');
})
```

### control

### watch
- 지정된 값을 관찰하고 반환
- 입력 값을 렌더링하고 조건에 따라 렌더링할 내용을 결정하는데 유용
```js
watch('inputName')
watch(['inputName'])
```

### setValue

### reset

## useFieldArray

- 필드 배열(동적 양식)을 위한 Custom Hook

### fields
```js
// 전체 출력
console.log(JSON.stringify(fields))

// 요소 하나하나 출력
fields.map((field, index) => {
  console.log("field == " + JSON.stringify(field))
  console.log("mbnum == " + field.mbnum)
  for(let key in field.varJson){
    console.log("varJson key === " + key + " varJson value == " + field.varJson[key]  )
  }      
    })
```

### props
- name
  - field array의 이름
  - 여기서 동적 이름을 지원하지는 않는다.

- control
  - 


## 출처
https://react-hook-form.com/docs/useform

https://www.nextree.io/react-hook-form/