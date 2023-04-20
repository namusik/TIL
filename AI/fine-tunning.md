# fine-tunning

## 개념
AI에 미세한 조정과정을 통해 작동을 원할하게 하는 것.

### Pre-training(사전 학습 모델)
fine tunning을 알기전, Pre-training을 알 필요가 있다. 

A라는 모델이 있다. 

먼저, A에 <감정 분석 문제>를 학습 시켰다.

그다음, 위 학습을 통해 얻은 정보(가중치)를 <텍스트 유사도 예측>에 활용하였다. 

이때, <감정 분석 문제>를 사전 학습 문제 (pre-train task)

사전에 학습한 가중치를 활용해 학습하고자 하는 <텍스트 유사도 예측>을 하위 문제(downstream task)라고 한다.

### fine-tunning

사전 학습한 모든 가중치와 더불어 downstream task를 위한 최소한의 가중치를 추가해서 모델을 추가로 학습시키는 방법

즉, <감정 분석 문제>의 가중치와 더불어 <텍스트 유사도 예측>을 위한 가중치를 추가해서 학습시키는 것.

## Transfer Learning(전이학습)
사전학습-파인튜닝을 하는 학습 과정

https://lsjsj92.tistory.com/656

https://wooiljeong.github.io/python/chatgpt-api/

https://velog.io/@soyoun9798/Pre-training-fine-tuning