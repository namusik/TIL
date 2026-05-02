# ChatGPT(OpenAI) fine-tunning API

## 장점 

일반적으로 제공되는 모델들은 "few-shot learning"이다. 
이 모델에서 내가 원하는 응답을 얻기 위해서는 많은 예제를 넣어야만 했다. 

하지만, fine-tuned를 잘 시키면 더이상 예제를 넣을 필요 없이 바로 원하는 형식의 대답을 얻을 수 있다.

## 단계

   1. Prepare and upload training data
   2. Train a new fine-tuned model
   3. Use your fine-tuned model

## 사용 가능 모델 
gpt3에서만 가능
base models에만 가능하다.
davinci, curie, babbage, ada 

## 설명
We recommend having at least a couple hundred examples. 
최소 백개이상의 prompt가 좋다.

## 사용 코드
~~~python
//openai 설치
pip install --upgrade openai

//API KEY 입력
//env에서 가져오는 방식으로 해도 됨
export OPENAI_API_KEY="<OPENAI_API_KEY>"

//training data 준비
JSONL 형식이어야 한다.
{"prompt": "<prompt text>", "completion": "<ideal generated text>"}
{"prompt": "<prompt text>", "completion": "<ideal generated text>"}

//data 준비 tool
openai tools fine_tunes.prepare_data -f <LOCAL_FILE> 
// prompt, completion을 column으로 가지고 있으면 알아서 형식을 만들어줌

//fine-tuned model 만들기
openai api fine_tunes.create -t <TRAIN_FILE_ID_OR_PATH> -m <BASE_MODEL> --suffix "custom model name"
//해당 명령어를 통해서 작업이 시작된다.

//tunning 작업 재시작
//혹시 종료되었을 때, 다시 시작할 수 있음.
openai api fine_tunes.follow -i <YOUR_FINE_TUNE_JOB_ID>

//fine-tunned 리스트 불러오기
openapi api fine_tune.list

~~~

## Data formatting

1. 모든 "prompt"는 고정된 구분자로 끝나야 한다. prompt의 끝과 completion의 시작을 알려주기 위해. \n\n###\n\n 이 일반적으로 사용됨.
2. 각각의 completion은 공백으로 시작해야 된다. tokenization을 위해
3. 모든 completion을 고정된 끝을 나타내는 구분자로 끝나야 한다. 주로 /n 이나 ###을 쓰면 된다.

## Use case 가이드 라인

### Classification

시작하기 가장 쉬운 모델
ada 추천

각각의 prompt는 미리 정의된 classes로 분류시키는 모델

prompt의 끝에 \n\n###\n\n 사용 추천. 물론, 추후 실제 request를 보낼때도 붙어있어야 한다.

token 길이가 1인 class를 찾자. 그래서 max_tokens=1 설정을 줄 수 있다.

prompt와 completon 길이가 2048토큰이 넘지 않도록.

각 class당 적어도 100개의 예제를 넣자

To get class log probabilities you can specify logprobs=5 (for 5 classes) when using your model

if logprobs is 5, the API will return a list of the 5 most likely tokens.

~~~
//Product: 부분이 빠져있으면 no 응답이 오도록 학습
{"prompt":"Company: BHFF insurance\nProduct: allround insurance\nAd:One stop shop for all your insurance needs!\nSupported:", "completion":" yes"}
{"prompt":"Company: Loft conversion specialists\nProduct: -\nAd:Straight teeth in weeks!\nSupported:", "completion":" no"}
~~~

## Conditional generation

주어진 인풋의 내용에 따라서 응답이 만들어져야 하는 형태
ex) paraphrasing, summarizing, entity extraction, product description writing given specifications, chatbots and many others

prompt 끝에 '\n\n###\n\n' 사용을 추천

completion의 끝에 'END'와 같은 엔딩 토큰 사용을 추천

stop sequence로의 엔딩 토큰으로는 'stop=[" END"]' 추천

최소 500개 예제 학습

Using Lower learning rate and only 1-2 epochs 더 잘 동작하는 경향이 있다.

예제
~~~
//위키피디아 글을 가지고 매력적인 광고문구를 작성하는 예제
{"prompt":"Samsung Galaxy Feel\nThe Samsung Galaxy Feel is an Android smartphone developed by Samsung Electronics exclusively for the Japanese market. The phone was released in June 2017 and was sold by NTT Docomo. It runs on Android 7.0 (Nougat), has a 4.7 inch display, and a 3000 mAh battery.\nSoftware\nSamsung Galaxy Feel runs on Android 7.0 (Nougat), but can be later updated to Android 8.0 (Oreo).\nHardware\nSamsung Galaxy Feel has a 4.7 inch Super AMOLED HD display, 16 MP back facing and 5 MP front facing cameras. It has a 3000 mAh battery, a 1.6 GHz Octa-Core ARM Cortex-A53 CPU, and an ARM Mali-T830 MP1 700 MHz GPU. It comes with 32GB of internal storage, expandable to 256GB via microSD. Aside from its software and hardware specifications, Samsung also introduced a unique a hole in the phone's shell to accommodate the Japanese perceived penchant for personalizing their mobile phones. The Galaxy Feel's battery was also touted as a major selling point since the market favors handsets with longer battery life. The device is also waterproof and supports 1seg digital broadcasts using an antenna that is sold separately.\n\n###\n\n", "completion":"Looking for a smartphone that can do it all? Look no further than Samsung Galaxy Feel! With a slim and sleek design, our latest smartphone features high-quality picture and video capabilities, as well as an award winning battery life. END"}
~~~
## 출처

https://platform.openai.com/docs/guides/fine-tuning

https://platform.openai.com/docs/api-reference/fine-tunes