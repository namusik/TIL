// 변수

//문자는 항상 따옴표 안에
//자바스크립트 예약어는 변수명으로 사용할 수 없다.
//https://www.w3schools.com/js/js_reserved.asp

//let
//이미 사용하고 있는 변수임을 알려줄 수 있다.
let myName = "mike";
let age = 30;

// Cannot redeclare block-scoped variable 'myName'
// let myName = "john"
// let 변수의 값을 바꾸려면 앞에 let을 빼고 작성하면 된다.
myName = "john";

// alert(myName); code runner로는 실행이 안됨. html에서 go live로 해야됨
console.log(myName)

//const
//절대 바뀌지 않는 상수
//대문자를 사용
const LIMIT = 30;

//수정이 불가능
//TypeError: Assignment to constant variable.
// LIMIT = 40;

//정리
//변하지 않는 값은 const, 변할 수 있는 값은 let
//tip : 처음에 다 const로 선언하고 나중에 바꿀 변수만 let으로 수정
// 변수는 문자, 숫자, $, _ 만 사용


// 자료형
// 문자형
const name1 = "nam";
const name2 = 'nam';
const name3 = `nam`;

const message = "I'm a boy.";
//역슬러시를 앞에 쓰면 특수문자로 인식된다.
const message2 = 'I\'m a boy.';
//백틱은 문자열과 ${}변수를 함께 쓸 때 편리
const message3 = `My name is ${name1}`;
console.log(message3)

//${}안에 표현식을 넣을 수 도 있다.
const message4 = `My age is ${40+1}`;
console.log(message4);




// 객체
const superman = {
  name : 'clark',
  age : 30,
}

superman.hairColor = 'black'
superman['hobby'] = 'football'

delete superman.age

console.log(superman)
console.log(superman.name)
console.log(superman['age'])

function makeObject(name, age){
  return {
    name,
    age,
    hobby : 'football'
  }
}

const mike = makeObject("mike", 30)
console.log(mike)

console.log("age" in mike)
console.log("birthday" in mike)

function isAdult(user){
  if(!('age' in user) ||  // user 객체에 age 프로퍼티가 없거나
      user.age < 20){
    return false
  }
  return true
}

const John  = {
  name : "john",
  age : 30,
}

const bob = {
  name : "bob",
}

console.log(isAdult(John))
console.log(isAdult(bob))

const aa = {
  name : "mike",
  age : 30,
}

for (x in aa){
  console.log(x)
  console.log(aa[x])
}

let boy = {
  name : 'mike',
  showName : function(){
    // console.log(boy.name)
    console.log(this.name)
  }
}

boy.showName()

let man = boy

man.name = 'TOM'

console.log(boy.name)
man.showName()
boy = null
man.showName() 
// console.log(boy.name)
// TypeError: Cannot read properties of null (reading 'name')


// array
let days = ['aa', 'bb', 'cc']

console.log(days[1])

days[1] = 'afaf'

console.log(days)

for(let day of days){
  console.log(day)
}

days.map((day) => {
  console.log(day)  
})




