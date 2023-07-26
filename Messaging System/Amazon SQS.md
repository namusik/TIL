# Amazon SQS
[공식문서](https://ap-northeast-2.console.aws.amazon.com/sqs/v2/home?region=ap-northeast-2#/)

## 개념 
메시지 대기열 서비스
![sqs](../images/messaging/sqs.png)
Producer가 메시지를 SQS Queue에 전송.

메시지는 SQS Queue에 저장됨. 

Cosumer가 새로운 메시지를 처리할 준비가 되면 SQS Queue에서 poll한다.