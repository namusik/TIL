# Azure OpenAI GPT4 model

## 차이점
gpt3
 text-in and text-out
accepted a prompt string and returned a completion to append to the prompt.

gpt4 
conversation-in and message-out
 expect input formatted in a specific chat-like transcript format, and return a completion that represents a model-written message in the chat.


## 옵션 
1. Chat Completion API.
   1. only way to access the new GPT-4 models.
2. Completion API with Chat Markup Language (ChatML)

## request 파라미터 
logprobs, best_of, and echo 
현재 gpt4 에서는 사용 불가

## request message format
~~~json
{"role": "system", "content": "Provide some context and/or instructions to the model."},
{"role": "user", "content": "Example question goes here."},
{"role": "assistant", "content": "Example answer goes here."},
{"role": "user", "content": "First question/message for the model to actually respond to."}
~~~

## system role
aka system message
provides the initial instructions to the model

## message prompt examples
1. basic example
~~~json
{"role": "system", "content": "Assistant is a large language model trained by OpenAI."},
{"role": "user", "content": "What's the difference between garbanzo beans and chickpeas?"}
~~~

2. add instructions
give additional instructions to define guardrails for what the model is able to do.
~~~json
{"role": "system", "content": "Assistant is an intelligent chatbot designed to help users answer their tax related questions.
Instructions: 
- Only answer questions related to taxes. 
- If you're unsure of an answer, you can say "I don't know" or "I'm not sure" and recommend users go to the IRS website for more information. "},
{"role": "user", "content": "When are my taxes due?"}
~~~

3. add Context
include relevant data or information in the system message to give the model extra context for the conversation
작은 내용의 정보라면 이처럼 하드코딩이 가능하지만, 
내용이 너무 방대하면, embeddings를 사용하자
~~~json
{"role": "system", "content": "Assistant is an intelligent chatbot designed to help users answer technical questions about Azure OpenAI Serivce. Only answer questions using the context below and if you're not sure of an answer, you can say 'I don't know'.

Context:
- Azure OpenAI Service provides REST API access to OpenAI's powerful language models including the GPT-3, Codex and Embeddings model series.
- Azure OpenAI Service gives customers advanced language AI with OpenAI GPT-3, Codex, and DALL-E models with the security and enterprise promise of Azure. Azure OpenAI co-develops the APIs with OpenAI, ensuring compatibility and a smooth transition from one to the other.
},
{"role": "user", "content": "What is Azure OpenAI Service?"}
~~~

4. Few shot learning
include a series of messages between the user and the assistant in the prompt as few shot examples.
미리 질문과 응답형식을 집어넣는 것
~~~json
{"role": "system", "content": "Assistant is an intelligent chatbot designed to help users answer their tax related questions. "},
{"role": "user", "content": "When do I need to file my taxes by?"},
{"role": "assistant", "content": "In 2023, you will need to file your taxes by April 18th. The date falls after the usual April 15th deadline because April 15th falls on a Saturday in 2023. For more details, see https://www.irs.gov/filing/individuals/when-to-file."},
{"role": "user", "content": "How can I check the status of my tax refund?"},
{"role": "assistant", "content": "You can check the status of your tax refund by visiting https://www.irs.gov/refunds"}
~~~

ex)
A brief description of the assistant
Personality traits of the assistant
Instructions or rules you would like the assistant to follow
Data or information needed for the model, such as relevant questions from an FAQ


## 출처
https://learn.microsoft.com/en-us/azure/cognitive-services/openai/how-to/chatgpt?pivots=programming-language-chat-completions#working-with-the-chatgpt-and-gpt-4-models-preview