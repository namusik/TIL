# Terraform 파일 구조 나누는 기준

Terraform에서 파일을 main.tf, data.tf, backend.tf, provider.tf, variables.tf 등으로 나누는 기준은 코드의 구조화, 재사용성, 유지보수성을 높이기 위해서입니다. 이 기준은 엄격한 규칙이 있는 것은 아니며, 프로젝트 규모나 팀의 요구에 따라 유연하게 적용될 수 있습니다. 하지만 일반적으로 다음과 같은 기준을 따릅니다.

## main.tf
주요 인프라 리소스 정의

역할: 
- main.tf는 Terraform 프로젝트의 주요 리소스를 정의하는 파일입니다. AWS, GCP, Azure 등의 클라우드 리소스를 생성하거나 변경하는 모든 설정을 담습니다.

포함 내용:

- EC2 인스턴스, S3 버킷, VPC 등 구체적인 인프라 리소스.
- 리소스 간의 의존성을 설정하거나, 필요한 인프라의 상태를 관리하는 코드.

```sh
resource "aws_instance" "ec2_example" {
  ami           = data.aws_ami.amazon_linux2.id
  instance_type = "t2.micro"

  tags = {
    Name = "my-ec2-instance"
  }
}
```

분리 기준:

- 주요 리소스는 모두 main.tf 파일에 정의합니다.
- 인프라의 규모가 커질 경우 파일을 더 세분화할 수 있습니다. 예를 들어, 네트워크 리소스는 network.tf, 데이터베이스 리소스는 database.tf로 분리할 수 있습니다.

## data.tf 

외부 리소스 참조

역할: 
- data.tf는 AWS, GCP, Azure 등의 클라우드에서 이미 존재하는 외부 데이터 소스를 참조하는 코드가 들어갑니다. 예를 들어, AMI ID, VPC ID, 서브넷 ID 등 기존 리소스를 가져와 사용할 때 사용됩니다.

포함 내용:
-	외부에서 조회할 리소스(이미 존재하는 인프라)를 정의.
-	주로 data 블록을 사용하여, 외부에서 동적으로 정보를 가져오는 리소스.

```sh
data "aws_ami" "amazon_linux2" {
  most_recent = true
  owners      = ["amazon"]

  filter {
    name   = "name"
    values = ["amzn2-ami-hvm-*-x86_64-gp2"]
  }
}
```

분리 기준:

- 외부 리소스 데이터를 조회하는 모든 항목을 data.tf에 정리합니다.
-	data 블록만을 다루므로, 인프라 리소스를 정의하는 main.tf와 구분됩니다.


## backend.tf

Terraform 상태 파일 관리

역할: 
- backend.tf는 Terraform의 상태 파일을 어디에 저장할지 정의하는 파일입니다. 
- Terraform의 상태는 인프라가 어떻게 배포되어 있는지 추적하는 중요한 역할을 합니다. 보통 원격 상태 파일 저장소(S3, GCS 등)를 정의하고 잠금 기능을 설정합니다.
- **S3 버킷 (bucket)**
  - 역할: S3 버킷은 **Terraform의 상태 파일(state file)**을 저장하는 곳입니다. Terraform은 인프라의 현재 상태를 추적하기 위해 상태 파일을 유지하는데, 이 상태 파일을 S3 버킷에 저장함으로써 여러 사용자가 상태 파일을 공유하고 동기화할 수 있습니다.
  - 주요 기능:
    - 상태 파일 저장소: Terraform이 실행될 때마다 S3 버킷에 상태 파일을 저장하거나 업데이트합니다. 이 상태 파일은 리소스의 현재 상태(예: EC2 인스턴스, VPC 등)를 기록하고 추적합니다.
    - 버전 관리: S3 버킷을 사용하면 이전 상태 파일의 버전도 자동으로 관리할 수 있습니다. 즉, 잘못된 변경이 발생할 경우 과거의 상태로 쉽게 롤백할 수 있습니다(S3 버킷 버전 관리를 활성화했을 경우).
  - 저장 데이터
    - 상태 파일이 직접 저장됨
- **DynamoDB 테이블 (dynamodb_table)**
  - 역할: DynamoDB 테이블은 **상태 잠금(locking)**을 관리하는 데 사용됩니다. 여러 사용자가 동시에 Terraform을 실행할 때, 상태 파일이 동시에 수정되는 것을 방지하기 위해 DynamoDB 테이블을 통해 잠금 기능을 제공합니다.
  - 주요 기능:
    - 상태 잠금 관리: Terraform이 실행될 때 DynamoDB 테이블을 사용하여 잠금을 설정합니다. 잠금이 설정되면 다른 사용자는 해당 상태 파일을 수정하거나 적용할 수 없으며, 이는 충돌을 방지합니다.
    - 경쟁 조건 방지: 여러 사용자가 동시에 terraform apply를 실행할 때 상태 파일이 동시에 업데이트되는 경쟁 조건을 방지합니다. 하나의 사용자가 작업을 끝낼 때까지 다른 사용자는 잠긴 상태에서 기다리게 됩니다.
  - 저장 데이터
    - 잠금 정보만 저장됨 (예: 작업 중인 사용자 정보 등)
- S3는 상태 파일을 저장하고 관리하는 저장소 역할을 하고, DynamoDB는 동시에 여러 사용자가 상태 파일을 수정하려는 경우 이를 방지하는 잠금 관리 시스템 역할을 합니다.


포함 내용:

-	S3, Azure Blob 등 원격 상태 파일을 저장할 위치 정의.
-	DynamoDB나 GCS 버킷을 이용한 상태 파일 잠금 설정.


```sh
terraform {
  backend "s3" {
    bucket         = "my-tf-state-bucket"
    key            = "terraform/state"
    region         = "ap-northeast-2"
    dynamodb_table = "terraform-lock"
    encrypt        = true
  }
}
```

분리 기준:

-	Terraform의 상태 관리에 관한 설정은 모두 backend.tf에 분리하여 정의합니다.
-	백엔드 설정은 인프라 리소스 생성과는 별개로 매우 중요하므로, 별도로 파일을 나누어 관리하는 것이 좋습니다.


## provider.tf

프로바이더 설정

역할: 
- Terraform이 사용할 프로바이더(AWS, GCP, Azure 등)의 설정을 정의하는 파일입니다. 
- 프로바이더는 Terraform이 어떤 클라우드 플랫폼과 상호작용할지 결정하며, 인증 정보와 리전 등의 설정을 포함합니다.

포함 내용:

- AWS, GCP, Azure 등의 클라우드 제공자의 설정.
-	인증 정보, 리전, 버전 등의 정보.

```sh
provider "aws" {
  region  = var.region
  profile = "my-profile"
}
```

분리 기준:

-	프로바이더 설정은 인프라 리소스와는 별도로, 해당 클라우드 환경에 대한 설정이므로 provider.tf로 분리하여 관리합니다.
-	여러 프로바이더를 사용할 경우 각 프로바이더에 대한 설정을 한 곳에서 관리할 수 있습니다.

## variables.tf 

변수 정의

역할: 
- variables.tf는 프로젝트에서 **변수(variable)**를 정의하는 파일입니다. 
- 이 파일은 코드의 재사용성을 높이고, 환경에 따라 설정 값을 변경할 수 있도록 도와줍니다.

포함 내용:

-	인프라에 사용되는 변수들의 정의(예: 리전, 인스턴스 타입, 태그 등).
-	기본값을 설정하거나 필요에 따라 값을 주입할 수 있도록 구성.


```sh
variable "region" {
  description = "The AWS region to deploy resources in"
  default     = "ap-northeast-2"
}

variable "instance_type" {
  description = "Instance type for EC2"
  default     = "t2.micro"
}
```

분리 기준:

-	변수는 리소스나 설정을 정의하는 파일과는 별도로 변수 정의 파일에서 관리합니다.
-	variables.tf에 모든 변수를 정의하고, 다른 파일에서 참조하여 코드의 가독성과 유지보수성을 높입니다.

## outputs.tf 

출력값 정의

역할: 
- outputs.tf는 Terraform이 적용된 후 출력값을 정의하는 파일입니다. 
- 특정 리소스의 속성(예: EC2 인스턴스의 IP 주소, S3 버킷 이름 등)을 출력하도록 설정할 수 있습니다.

포함 내용:

-	인프라 리소스의 속성을 출력하여 다른 곳에서 사용할 수 있도록 정의.


```sh
output "instance_public_ip" {
  description = "The public IP of the EC2 instance"
  value       = aws_instance.ec2_example.public_ip
}
```

분리 기준:

-	출력값은 리소스 정의와는 별도로 출력만을 다루므로 outputs.tf로 분리하여 관리합니다.


요약

-	main.tf: 주요 인프라 리소스를 정의하는 파일.
-	data.tf: 기존 리소스를 참조하는 데이터 소스 정의 파일.
-	backend.tf: Terraform 상태 관리 설정 파일.
-	provider.tf: 클라우드 프로바이더(AWS, GCP 등) 설정 파일.
-	variables.tf: 변수 정의 파일.
-	outputs.tf: 리소스 출력값 정의 파일.