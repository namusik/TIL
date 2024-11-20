# Yaml
https://yaml.org/

YAML Ain't Markup Language (마크업 언어가 아니다)

## 정의 
YAML is a **human-friendly** **data serialization language(데이터 직렬화 언어)** for all programming languages.

- 데이터 직렬화
  - 컴퓨터에서 데이터를 파일,메모리,데이터베이스 같은 특정 공간에 저장하는 과정
  - 직렬화 표준 언어 : json, yaml



## yq
https://github.com/mikefarah/yq

YAML 파일을 처리하는 명령줄 도구로, JSON, YAML 파일을 읽고, 쓸 수 있는 기능을 제공

yq는 주로 YAML 데이터를 추출, 수정, 변환, 비교하는 데 사용

## 주요 기능

1.	YAML 읽기 및 쓰기
-	yq는 YAML 파일을 읽어들이고, JSON과 유사한 방식으로 데이터를 처리할 수 있습니다.
-	YAML 형식의 데이터를 쿼리하고, 필터링하며, 수정할 수 있습니다.
2.	YAML 데이터 쿼리
-	yq를 사용하면 YAML 데이터를 쉽게 쿼리할 수 있습니다. 예를 들어, 특정 키를 찾거나 중첩된 데이터를 추출하는 등의 작업을 할 수 있습니다.
3.	YAML 수정
-	yq는 YAML 파일을 변경하고 업데이트하는 기능도 제공합니다. 특정 값을 추가하거나 수정할 수 있습니다.
4.	YAML 파일을 JSON으로 변환
-	yq를 사용하여 YAML 파일을 JSON으로 변환하거나 그 반대로 할 수 있습니다.
5.	배치 처리
-	yq는 파일을 하나씩 처리하거나 여러 파일을 한번에 처리할 수 있어, 대규모 데이터의 일괄 처리에도 유용합니다.


### 설치

```sh
// wget은 웹에서 파일을 다운로드하는 명령어
// -O 옵션은 다운로드한 파일을 지정된 경로에 저장하도록
sudo wget https://github.com/mikefarah/yq/releases/download/v4.19.1/yq_darwin_arm64 -O /usr/local/bin/yq

sudo chmod +x yq

혹은

brew install yq

# 버전 확인
yq --version
```

### 사용법

```sh
# YAML 파일 읽기
yq eval . myfile.yaml

# 특정 키 값 추출
yq eval '.name' myfile.yaml

# YAML 파일에서 값을 변경
yq eval '.name = "John"' -i myfile.yaml

# 중첩된 데이터 추출
yq eval '.address.city' myfile.yaml

# YAML 파일을 JSON으로 변환
yq eval -j myfile.yaml

# JSON 파일을 YAML로 변환
yq eval -P myfile.json
```