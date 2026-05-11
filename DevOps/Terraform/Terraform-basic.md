# Terraform

https://www.terraform.io/

## Terraform 소개
- HashiCorp에서 개발한 오픈 소스 IaC(Infrastructure as Code) 도구
- 사용자가 사람이 읽을 수 있는 언어(HCL - HashiCorp Configuration Language)로 구성을 작성하여 클라우드 리소스를 관리할 수 있게 해주는 선언적 도구
- 인프라 프로비저닝을 단순화하여 AWS, Azure, GCP 등과 같은 다양한 클라우드 제공업체에서 대규모 배포를 더 쉽게 자동화하고, 버전 제어하고, 관리할 수 있도록 해줌.


## 명령어 

### terraform init
```sh
terraform init

-reconfigure : 한번 실행 후에 백엔드 구성(back-end configuration)이 변경되면 프로젝트를 처음 설정하거나 기존 상태를 유지할 필요가 없을 경우:

-upgrade: 사용 중인 모듈과 프로바이더의 최신 버전으로 업그레이드합니다.
```


•	terraform init은 Terraform 작업을 시작하기 전에 프로젝트를 초기화하는 명령어입니다. 이 명령어는 Terraform 설정을 읽고, 필요한 백엔드(원격 상태 파일 저장소)와 프로바이더(예: AWS, Azure, GCP 등)를 다운로드하고 설정합니다.
•	init 명령어는 Terraform 프로젝트를 처음 실행할 때 반드시 실행해야 합니다.

주요 역할:

•	백엔드 초기화: 상태 파일을 저장할 S3, Azure Blob, 로컬 디스크 등 백엔드 구성을 설정합니다.
•	프로바이더 설치: Terraform에서 사용할 AWS, GCP, Azure 등의 클라우드 프로바이더 플러그인을 설치합니다.
•	모듈 초기화: 외부 모듈이 있는 경우 모듈을 다운로드합니다.


### terraform plan
```sh
terraform plan

-out=planfile: 계획 결과를 파일로 저장하여 나중에 terraform apply에서 사용할 수 있습니다.
-var-file=variables.tfvars: 특정 변수 파일을 명시적으로 지정하여 계획을 세웁니다.

data.aws_ami.amazon_linux_2023: Reading...
data.aws_ami.amazon_linux_2023: Read complete after 0s [id=ami-02c329a4b4aba6a48]

Terraform used the selected providers to generate the following execution plan. Resource actions are indicated with the following symbols:
  + create

Terraform will perform the following actions:

  # aws_instance.ec2_example will be created
  + resource "aws_instance" "ec2_example" {
      + ami                                  = "ami-02c329a4b4aba6a48"
      + arn                                  = (known after apply)
      + associate_public_ip_address          = (known after apply)
      + availability_zone                    = (known after apply)
      + cpu_core_count                       = (known after apply)
      + cpu_threads_per_core                 = (known after apply)
      + disable_api_stop                     = (known after apply)
      + disable_api_termination              = (known after apply)
      + ebs_optimized                        = (known after apply)
      + get_password_data                    = false
      + host_id                              = (known after apply)
      + host_resource_group_arn              = (known after apply)
      + iam_instance_profile                 = (known after apply)
      + id                                   = (known after apply)
      + instance_initiated_shutdown_behavior = (known after apply)
      + instance_state                       = (known after apply)
      + instance_type                        = "t2.micro"
      + ipv6_address_count                   = (known after apply)
      + ipv6_addresses                       = (known after apply)
      + key_name                             = (known after apply)
      + monitoring                           = (known after apply)
      + outpost_arn                          = (known after apply)
      + password_data                        = (known after apply)
      + placement_group                      = (known after apply)
      + placement_partition_number           = (known after apply)
      + primary_network_interface_id         = (known after apply)
      + private_dns                          = (known after apply)
      + private_ip                           = (known after apply)
      + public_dns                           = (known after apply)
      + public_ip                            = (known after apply)
      + secondary_private_ips                = (known after apply)
      + security_groups                      = (known after apply)
      + source_dest_check                    = true
      + subnet_id                            = (known after apply)
      + tags                                 = {
          + "Name" = "megabird-tf-ec2-example"
        }
      + tags_all                             = {
          + "Application" = "myapp"
          + "Environment" = "dev"
          + "Name"        = "megabird-tf-ec2-example"
          + "Terraform"   = "true"
        }
      + tenancy                              = (known after apply)
      + user_data                            = (known after apply)
      + user_data_base64                     = (known after apply)
      + user_data_replace_on_change          = false
      + vpc_security_group_ids               = (known after apply)
    }

Plan: 1 to add, 0 to change, 0 to destroy.

Note: You didn't use the -out option to save this plan, so Terraform can't guarantee to take exactly these actions if you run "terraform apply" now.
```

- 실제 리소스를 생성하거나 변경하기 전에 예상 결과를 보여줍니다. 이 명령어는 Terraform이 작성한 인프라 구성 파일을 분석하고, 현재 상태와 비교하여 어떤 변경이 필요한지 계획을 수립합니다.
-	plan 명령어는 실제로 리소스를 생성하거나 변경하지는 않습니다. 변경 사항을 미리 검토할 수 있기 때문에 오류나 의도하지 않은 변경을 방지하는 데 유용합니다.

주요 역할:

-	변경 사항 미리보기: Terraform이 실행될 때 추가될 리소스, 삭제될 리소스, 변경될 리소스를 미리 보여줍니다.
-	인프라 변경 검토: 팀에서 인프라 변경을 적용하기 전에 상호 검토할 수 있습니다.

### terraform apply
```sh
terraform apply

-auto-approve: 프롬프트 없이 변경 사항을 자동으로 적용합니다.

planfile: 이전에 terraform plan으로 생성한 파일을 사용하여 변경 사항을 적용할 수 있습니다.


data.aws_ami.amazon_linux_2023: Reading...
data.aws_ami.amazon_linux_2023: Read complete after 0s [id=ami-02c329a4b4aba6a48]

Terraform used the selected providers to generate the following execution plan. Resource actions are indicated with the following symbols:
  + create

Terraform will perform the following actions:

  # aws_instance.ec2_example will be created
  + resource "aws_instance" "ec2_example" {
      + ami                                  = "ami-02c329a4b4aba6a48"
      + arn                                  = (known after apply)
      + associate_public_ip_address          = (known after apply)
      + availability_zone                    = (known after apply)
      + cpu_core_count                       = (known after apply)
      + cpu_threads_per_core                 = (known after apply)
      + disable_api_stop                     = (known after apply)
      + disable_api_termination              = (known after apply)
      + ebs_optimized                        = (known after apply)
      + get_password_data                    = false
      + host_id                              = (known after apply)
      + host_resource_group_arn              = (known after apply)
      + iam_instance_profile                 = (known after apply)
      + id                                   = (known after apply)
      + instance_initiated_shutdown_behavior = (known after apply)
      + instance_state                       = (known after apply)
      + instance_type                        = "t2.micro"
      + ipv6_address_count                   = (known after apply)
      + ipv6_addresses                       = (known after apply)
      + key_name                             = (known after apply)
      + monitoring                           = (known after apply)
      + outpost_arn                          = (known after apply)
      + password_data                        = (known after apply)
      + placement_group                      = (known after apply)
      + placement_partition_number           = (known after apply)
      + primary_network_interface_id         = (known after apply)
      + private_dns                          = (known after apply)
      + private_ip                           = (known after apply)
      + public_dns                           = (known after apply)
      + public_ip                            = (known after apply)
      + secondary_private_ips                = (known after apply)
      + security_groups                      = (known after apply)
      + source_dest_check                    = true
      + subnet_id                            = (known after apply)
      + tags                                 = {
          + "Name" = "megabird-tf-ec2-example"
        }
      + tags_all                             = {
          + "Application" = "myapp"
          + "Environment" = "dev"
          + "Name"        = "megabird-tf-ec2-example"
          + "Terraform"   = "true"
        }
      + tenancy                              = (known after apply)
      + user_data                            = (known after apply)
      + user_data_base64                     = (known after apply)
      + user_data_replace_on_change          = false
      + vpc_security_group_ids               = (known after apply)
    }

Plan: 1 to add, 0 to change, 0 to destroy.

Do you want to perform these actions?
  Terraform will perform the actions described above.
  Only 'yes' will be accepted to approve.

  Enter a value: yes

aws_instance.ec2_example: Creating...
aws_instance.ec2_example: Still creating... [10s elapsed]
aws_instance.ec2_example: Creation complete after 13s [id=i-0d9fbe4d1ff7b85a7]

Apply complete! Resources: 1 added, 0 changed, 0 destroyed.
```

- terraform apply 명령어는 Terraform의 구성 파일을 실제 인프라에 적용하여 리소스를 생성, 수정, 삭제하는 역할을 합니다. 이 명령어는 terraform plan의 결과를 적용하여 클라우드 리소스를 구성합니다.
- apply 명령어는 사용자가 수립한 계획대로 리소스를 실제로 프로비저닝(생성/변경/삭제)합니다.

주요 역할:

-	리소스 생성: 구성 파일에 정의된 리소스(예: EC2 인스턴스, VPC 등)를 클라우드 환경에 생성합니다.
-	변경 사항 적용: 기존 리소스에 대해 정의된 변경 사항을 실제로 적용합니다.
-	리소스 삭제: 불필요한 리소스를 삭제합니다.

### terraform destroy

```sh
terraform destroy

-auto-approve: 삭제 전 프롬프트를 생략하고 자동으로 삭제를 진행합니다.
-target='리소스 이름': 특정 리소스만 선택적으로 삭제할 수 있습니다.

data.aws_ami.amazon_linux_2023: Reading...
data.aws_ami.amazon_linux_2023: Read complete after 1s [id=ami-02c329a4b4aba6a48]
aws_instance.ec2_example: Refreshing state... [id=i-0d9fbe4d1ff7b85a7]

Terraform used the selected providers to generate the following execution plan. Resource actions are indicated with the following symbols:
  - destroy

Terraform will perform the following actions:

  # aws_instance.ec2_example will be destroyed
  - resource "aws_instance" "ec2_example" {
      - ami                                  = "ami-02c329a4b4aba6a48" -> null
      - arn                                  = "arn:aws:ec2:ap-northeast-2:854013278161:instance/i-0d9fbe4d1ff7b85a7" -> null
      - associate_public_ip_address          = true -> null
      - availability_zone                    = "ap-northeast-2c" -> null
      - cpu_core_count                       = 1 -> null
      - cpu_threads_per_core                 = 1 -> null
      - disable_api_stop                     = false -> null
      - disable_api_termination              = false -> null
      - ebs_optimized                        = false -> null
      - get_password_data                    = false -> null
      - hibernation                          = false -> null
      - id                                   = "i-0d9fbe4d1ff7b85a7" -> null
      - instance_initiated_shutdown_behavior = "stop" -> null
      - instance_state                       = "running" -> null
      - instance_type                        = "t2.micro" -> null
      - ipv6_address_count                   = 0 -> null
      - ipv6_addresses                       = [] -> null
      - monitoring                           = false -> null
      - placement_partition_number           = 0 -> null
      - primary_network_interface_id         = "eni-0b395d0d39d816b9b" -> null
      - private_dns                          = "ip-172-31-37-137.ap-northeast-2.compute.internal" -> null
      - private_ip                           = "172.31.37.137" -> null
      - public_dns                           = "ec2-43-200-164-72.ap-northeast-2.compute.amazonaws.com" -> null
      - public_ip                            = "43.200.164.72" -> null
      - secondary_private_ips                = [] -> null
      - security_groups                      = [
          - "default",
        ] -> null
      - source_dest_check                    = true -> null
      - subnet_id                            = "subnet-5f1f4313" -> null
      - tags                                 = {
          - "Name" = "megabird-tf-ec2-example"
        } -> null
      - tags_all                             = {
          - "Application" = "myapp"
          - "Environment" = "dev"
          - "Name"        = "megabird-tf-ec2-example"
          - "Terraform"   = "true"
        } -> null
      - tenancy                              = "default" -> null
      - user_data_replace_on_change          = false -> null
      - vpc_security_group_ids               = [
          - "sg-0150ba6f",
        ] -> null
        # (6 unchanged attributes hidden)

      - capacity_reservation_specification {
          - capacity_reservation_preference = "open" -> null
        }

      - cpu_options {
          - core_count       = 1 -> null
          - threads_per_core = 1 -> null
            # (1 unchanged attribute hidden)
        }

      - credit_specification {
          - cpu_credits = "standard" -> null
        }

      - enclave_options {
          - enabled = false -> null
        }

      - maintenance_options {
          - auto_recovery = "default" -> null
        }

      - metadata_options {
          - http_endpoint               = "enabled" -> null
          - http_put_response_hop_limit = 2 -> null
          - http_tokens                 = "required" -> null
          - instance_metadata_tags      = "disabled" -> null
        }

      - private_dns_name_options {
          - enable_resource_name_dns_a_record    = false -> null
          - enable_resource_name_dns_aaaa_record = false -> null
          - hostname_type                        = "ip-name" -> null
        }

      - root_block_device {
          - delete_on_termination = true -> null
          - device_name           = "/dev/xvda" -> null
          - encrypted             = false -> null
          - iops                  = 3000 -> null
          - tags                  = {} -> null
          - throughput            = 125 -> null
          - volume_id             = "vol-0ffc5ab80979638e7" -> null
          - volume_size           = 8 -> null
          - volume_type           = "gp3" -> null
            # (1 unchanged attribute hidden)
        }
    }

Plan: 0 to add, 0 to change, 1 to destroy.

Do you really want to destroy all resources?
  Terraform will destroy all your managed infrastructure, as shown above.
  There is no undo. Only 'yes' will be accepted to confirm.

  Enter a value: yes

aws_instance.ec2_example: Destroying... [id=i-0d9fbe4d1ff7b85a7]
aws_instance.ec2_example: Still destroying... [id=i-0d9fbe4d1ff7b85a7, 10s elapsed]
aws_instance.ec2_example: Still destroying... [id=i-0d9fbe4d1ff7b85a7, 20s elapsed]
aws_instance.ec2_example: Still destroying... [id=i-0d9fbe4d1ff7b85a7, 30s elapsed]
aws_instance.ec2_example: Still destroying... [id=i-0d9fbe4d1ff7b85a7, 40s elapsed]
aws_instance.ec2_example: Still destroying... [id=i-0d9fbe4d1ff7b85a7, 50s elapsed]
aws_instance.ec2_example: Still destroying... [id=i-0d9fbe4d1ff7b85a7, 1m0s elapsed]
aws_instance.ec2_example: Still destroying... [id=i-0d9fbe4d1ff7b85a7, 1m10s elapsed]
aws_instance.ec2_example: Destruction complete after 1m11s

Destroy complete! Resources: 1 destroyed.
```

terraform destroy 명령어는 Terraform이 관리하고 있는 모든 리소스를 삭제합니다. 리소스를 더 이상 사용하지 않거나 정리해야 할 때 사용합니다.
주의해야 할 점은 이 명령어를 실행하면 관리되고 있는 모든 리소스가 삭제되므로, 필요 없는 리소스만 선택적으로 삭제하려면 구성을 수정하거나, 리소스를 개별적으로 삭제해야 합니다.

주요 역할:

- 리소스 삭제: Terraform이 관리하는 인프라의 모든 리소스를 삭제합니다.
- 정리 작업: 테스트 환경이나 불필요한 리소스를 완전히 제거할 때 사용합니다.