## 정리

* 최신 언어 장점. 자바에서 10줄이 코틀린에서 2-3줄
* 구글 안드로이드 메인 언어
* 안드로이드에서 쓰는 java는 java와 비슷한 무언가
  * dalvik 코드
  * 예전 java api 복붙한 코드들. java8 일부분
  * syntax sugar
* 속도 차이는 별로 없고 보기에 좋다. 
* 컴파일 속도가 느리다. 
* 코틀린 컴파일러 개발은 jetbrain에서 
  * 보조 툴 annotation processor는 구글 젯브레인 협업
  * KSP 개발중.
* Unit test
  * 애매한 부분. 결과물이 java 클래스 파일로 나옴
  * Modifier 수정 못하는 final 형식으로 나옴.
  * unit test에서 쓸 때, mocking을 쓸 때, java 바이트 코드를 변경해서 쓰는데 
  * bytebuddy로 강제로 사용.
* kotlin companion object

## 출처 
https://www.youtube.com/watch?v=qFitd3Ukgcc