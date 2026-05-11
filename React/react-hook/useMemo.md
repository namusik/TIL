# useMemo

## 개념 
컴포넌트의 성능을 최적화 하는데 사용되는 훅.

memo == memorization

동일한 계산을 반복하지 않고 이전에 계산한 값을 메모리에 저장함.

## 예시 
```js
const value = useMemo(() => {
    return calculate();
},[item])
```
* 첫 번째 인자로 콜백 함수 혹은 값들.
  * 
* 두 번째 인자로 의존성 배열 
  * 이 값이 업데이트 될 때에만 콜백 함수를 다시 호출해서 메모리에 값을 업데이트 해준다.
  * **빈 배열**을 넣는다면, useEffect와 마찬가지로 마운트 될 때에만 useMemo가 실행된다. 이후에는 메모리의 값이 바뀌지 않음.


## 예시2
```js
import { useMemo, useEffect, useState } from "react";

function App() {
  const [number, setNumber] = useState(1);
  const [isKorea, setIsKorea] = useState(true);

  // 1번 location
  // setNumber를 통해 number state가 변경되어 App 컴포넌트가 리렌더링될 때, useEffect[location]가 실행되어 버린다. 
  // 이유는 자바스크립트에서 객체는 주소 값으로 저장되기 때문이다.
  // 그래서 const location의 주소값이 변경되어서 useEffect[location]이 실행되게 된다.
  const location = {
    country: isKorea ? "한국" : "일본"
  };

  // 2번 location
  // 
  const location = useMemo(() => {
    return {
      country: isKorea ? '한국' : '일본'
    }
  }, [isKorea])

  useEffect(() => {
    console.log("useEffect 호출!");
  }, [location]);

  return (
    <header className="App-header">
      <h2>하루에 몇 끼 먹어요?</h2>
      <input
        type="number"
        value={number}
        onChange={(e) => setNumber(e.target.value)}
      />
      <hr />

      <h2>내가 있는 나라는?</h2>
      <p>나라: {location.country}</p>
      <button onClick={() => setIsKorea(!isKorea)}>Update</button>
    </header>
  );
}

export default App;
```

## 참고
https://velog.io/@jinyoung985/React-useMemo%EB%9E%80