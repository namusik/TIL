# React Hook Form

```javascript
import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import Select from 'react-select'; // react-select 라이브러리에서 Select 컴포넌트를 가져옵니다.

function FormExample() {
  const { register, handleSubmit, watch, control, formState: { errors } } = useForm({
    defaultValues: {
      firstName: "John",
      lastName: "Doe",
      email: "",
      favoriteColor: { value: 'blue', label: 'Blue' } // 기본값으로 'blue'를 선택합니다.
    },
    mode: "onBlur"
  });

  const onSubmit = data => console.log(data);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register("firstName")} placeholder="First Name" />
      <input {...register("lastName")} placeholder="Last Name" />
      <input {...register("email", { required: "Email is required" })} placeholder="Email" />
      {errors.email && <p>{errors.email.message}</p>}

      {/* Controller를 사용하여 react-select 컴포넌트를 폼에 통합합니다. */}
      <Controller
        name="favoriteColor"
        control={control}
        render={({ field }) => <Select
          {...field}
          options={[
            { value: 'blue', label: 'Blue' },
            { value: 'green', label: 'Green' },
            { value: 'red', label: 'Red' },
          ]}
          // react-select의 value와 onChange를 Controller의 field로부터 받습니다.
        />}
      />

      <button type="submit">Submit</button>
    </form>
  );
}

export default FormExample;
```

## 개념
폼 상태 관리, 유효성 검사, 폼 제출 처리 등을 효율적으로 할 수 있도록 도와주는 라이브러리

## useForm
- 폼을 관리하기 위한 훅

### 반환 객체
#### register 
- 폼 필드(예: input, select, textarea)를 React Hook Form에 등록하기 위한 함수
- 입력값을 등록
- 유효성 검사 규칙을 React Hook Form에 적용

#### handleSubmit
  * form 유효성 검사가 성공하면 form 데이터 처리
  * 이 함수에 콜백을 전달하여, 폼이 유효할 때 실행될 로직을 정의

#### formState
- 폼의 상태(예: isValid, errors 등)를 포함하는 객체
  - isValid : 폼의 유효성 상태를 나타내는 불리언 값입니다. 모든 필드가 유효한지 여부
  - errors : 폼 필드의 유효성 검사 에러를 포함하는 객체입니다. 필드별로 유효성 검사를 통과하지 못한 경우 해당 필드 이름을 키로 갖는 에러 메시지를 포함

####control
- 폼의 각 필드를 제어하기 위한 객체
- Controller 컴포넌트와 같이 사용됨.
- 외부 제어 컴포넌트(예: React-Select, Material-UI 등의 라이브러리에서 제공하는 컴포넌트)를 React Hook Form과 통합할 때 활용

#### watch
- 지정된 값을 관찰하고 반환
- 필드 값이 변경될 때마다 해당 값이 반환되어, 변화를 감지
- 입력 값을 렌더링하고 조건에 따라 렌더링할 내용을 결정하는데 유용
```js
watch('inputName')
watch(['inputName'])
```

#### setValue
- 지정된 필드의 값을 프로그래매틱하게 설정할 수 있는 함수 

#### reset
- 폼의 필드와 에러 상태를 초기화하는 함수
- 인자로 초기 값 객체를 전달할 수 있으며, 전달하지 않으면 defaultValues로 지정된 값으로 초기화

### useForm 옵션
#### defaultValues
  * 폼 필드의 초기 값 객체
  * 폼 필드를 처음 렌더링할 때 사용되는 기본 값들을 설정
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

#### mode
- 유효성 검사 모드를 설정하는 옵션
- 'all'로 설정된 경우, 모든 필드의 유효성 검사가 변경될 때마다 실행

#### resolver
- 유효성 검사 규칙을 정의하는 외부 유효성 검사 라이브러리(예: Yup)와 React Hook Form을 통합하기 위한 함수

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