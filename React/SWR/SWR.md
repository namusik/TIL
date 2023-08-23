# SWR
Stale-While-Revalidate 

[공식문서](https://swr.vercel.app/ko)

## 정의
vercel에서 개발
데이터를 가져오기 위한 React Hooks 모듈

## 특징
HTTP 캐시 무효 전략인 `stale-while-revalidate`에서 유래됨

> 먼저 **캐시(stale)**로부터 데이터를 반환한 후, **fetch요청(revalidate)**을 하고, 최종적으로 최신화된 데이터를 가져오는 전략입니다.

>SWR을 사용하면 컴포넌트는 지속적이며 자동으로 데이터 업데이트 스트림을 받게 됩니다.
그리고 UI는 항상 빠르고 반응적입니다.

## 사용법
설치
~~~js
npm i swr
~~~

import
~~~js
import useSWR from 'swr'
~~~

