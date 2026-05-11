# useEffect

## 개념
컴포넌트가 렌더링 될 때, 특정 작업을 실행할 수 있도록 하는 Hook

## 특징
* 함수 컴포넌트에서도 side effect를 사용 가능.
  * 라이프사이클 훅 대체 가능

## 사용방법
```js
import { useEffect } from 'react'
useEffect(effect, [])
```
* effect
  * 컴포넌트 렌더링 이후 실행할 함수
  * 리액트는 이 함수를 