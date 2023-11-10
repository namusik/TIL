# 변수

- 문자는 항상 따옴표 안에
- 자바스크립트 예약어는 변수명으로 사용할 수 없다.
  - 예약어 목록
  - https://www.w3schools.com/js/js_reserved.asp

## let
- 이미 사용하고 있는 변수임을 알려줄 수 있다.
```js
let myName = "mike";
let age = 30;

// 에러 발생 : Cannot redeclare block-scoped variable 'myName'
let myName = "john"

// let 변수의 값을 바꾸려면 앞에 let을 빼고 작성하면 된다.
myName = "john";
```

```js
alert(myName) // code runner로는 실행이 안됨. html에서 go live로 해야됨 

console.log(myName) 
```

## const
- 절대 바뀌지 않는 상수
- 대문자를 사용
```js
const LIMIT = 30;
```

- 수정이 불가능
```js
// TypeError: Assignment to constant variable.
LIMIT = 40;
```

### 정리
- 변하지 않는 값은 **const** , 변할 수 있는 값은 **let**
- **tip** : 처음에 다 **const**로 선언하고 나중에 바꿀 변수만 **let**으로 수정
-  변수는 문자, 숫자, $, _ 만 사용


## 자료형
###  문자형
```js
const name1 = "nam";
const name2 = 'nam';
const name3 = `nam`;

const message = "I'm a boy.";

// 역슬러시를 앞에 쓰면 특수문자로 인식된다.
const message2 = 'I\'m a boy.';

// 백틱은 문자열과 ${}변수를 함께 쓸 때 편리
const message3 = `My name is ${name1}`;
console.log(message3)

// ${}안에 표현식을 넣을 수 도 있다.
const message4 = `My age is ${40+1}`;
console.log(message4);
```


##  객체(Object)
- 중괄호로 자것ㅇ
- key와 value로 구성된 프로퍼
- 각 프로퍼티는 쉼표로 구분
  - 마지막 쉼표는 없어도 되지만, 있는게 수정/삭제/이동에 유리
```js
const superman = {
  name : 'clark',
  age : 33,
}

// 접근
superman.name // 'clark' 
superman[age] // 33

// 추가
superman.gender = 'male'
superman['hairColor'] = 'black'

// 삭제 
delete superman.hairColor  
```

- 단축 프로퍼티
```js
const name = 'clark'
const age = 33

const superman = {
  name,  // name : name 동일
  age,   // age : age   동일
  gender : 'male',
}
```

- 프로퍼티 존재 여부 확인 - in
  - 어떤 값이 나올지 확신할 수 없을 때 **in**을 쓴다
```js
const superman = {
  name : 'clark',
  age : 33,
}

// undefined
superman.birthDay 

'birthDay' in superman // false

'age' in superman // true

for(let key in superman){
  console.log(key)
  console.log(superman[key])
}
```

### method
  - 객체 프로퍼티로 할당 된 함수
```js
const superman = {
  name : 'clark',
  age : 33,
  fly : function(){
    console.log('날아간다')
  }
  work(){ // : function 생략 가능  
    console.log('일한다')
  }  
}
```

### this
- 해당 객체를 의미
-  실행하는 시점 runtime에 결정됨
-  화살표 함수 안에 있다면 동작 안함.
   -  자신만의 this를 가지지 않음.
   -  외부에서 전역객체 this 변수를 가져오게 됨.
```js
const user = {
  name : 'mike',
  sayHello,
}

sayHello : function(){
  console.log('hello, i am ${this.name}')
}
```

-  js 객체는 immutable 속성.
-  input의 값을 변경하는 대신, 새로운 객체를 할당해 주어야 함.
```js
const [inputs, setInputs] = useState({
  username: "",
  city: "",
});

const { username, city } = inputs;
```
```js
const onChange = (e) => {
  const { name, value } = e.target;
  setInputs({
    ...inputs,
    [name]: value,
  });
};
```

```js
const onChange = (e) => {
  const { name, value } = e.target;
  setInputs({    
    [name]: value,
    // 이러면 기존 input
  });
};
```


## 배열(Array)
- 대괄호를 사용
- 쉼표로 구분
- 문자열, 숫자, 객체, 함수 등도 포함 가능
```js
let students = ['aa', 'bb', 'cc']

let arr = ['vg',  3, {name:'john', age:30}, function(){console.log('함수')}]

// 인덱스로 접근 가능
students[0] = 'dd'

// length : 배열의 길이
students.length
```

- 배열 조작
```js
let days = ['월', '화', '수']
// 배열 끝에 요소 추가
days.put('목')

// 배열 끝 요소 제거
days.pop()

// unshift : 배열 앞에 추가
days.unshift('일')

// shift : 배열 앞에 제거
days.shift()
```

- 배열 반복문
```js
let days = ['월', '화', '수']
for(let index=0; index<days.length; index++>){
  console.log(days[index])
}

for(let day of days){
  console.log(day)
}
```
