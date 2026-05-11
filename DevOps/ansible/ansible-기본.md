# ansible 개념

IT 자동화 도구로, 서버나 네트워크 장비와 같은 시스템을 관리하고 구성하는 데 사용됨
인프라 관리 및 애플리케이션 배포를 쉽게 할 수 있도록 지원하며, 특히 복잡한 작업을 자동화하여 개발자와 시스템 관리자가 반복적인 수동 작업을 줄일 수 있게 돕는다.
**에이전트리스(Agentless)** 구조로, 관리할 시스템에 별도의 소프트웨어 설치 없이 SSH 프로토콜을 사용해 명령을 실행가능

## 특징

1.	에이전트리스(Agentless):
Ansible은 **원격 시스템에 에이전트를 설치할 필요가 없으며**, SSH를 통해 직접 접속하여 작업을 수행
2.	플레이북(Playbook):
Ansible에서 작업을 정의하는 **YAML 형식의 파일**로, 여러 작업을 순서대로 정의할 수 있다. 각 작업은 모듈을 사용하여 실행되며, 하나의 플레이북으로 여러 시스템에 대한 설정이나 배포를 자동화할 수 있습니다.
3.	모듈(Module):
Ansible에서 제공하는 **다양한 기능을 수행하는 구성 요소**입니다. 파일 복사, 패키지 설치, 서비스 재시작 등의 작업을 위한 모듈들이 있으며, 사용자 정의 모듈도 작성할 수 있습니다.
4.	인벤토리(Inventory):
Ansible이 **관리할 서버 목록을 정의하는 파일**입니다. IP 주소나 호스트 이름을 이용해 서버를 그룹으로 나눌 수 있으며, 각 그룹에 대해 별도의 설정을 적용할 수 있습니다.
5.	Idempotency(멱등성):
Ansible의 주요 장점 중 하나로, **같은 작업을 여러 번 수행해도 시스템의 상태가 변하지 않도록 설계**되었다. 즉, 이미 적용된 작업을 다시 실행해도 시스템에 영향을 주지 않습니다.
6.	확장성 및 유연성:
Ansible은 클라우드 인프라 관리, 소프트웨어 배포, 네트워크 장비 관리 등 다양한 환경에서 사용할 수 있는 유연한 도구입니다. AWS, Azure, GCP와 같은 클라우드 프로바이더를 위한 모듈도 제공됩니다.


## 표준 디렉토리 구조

```
├── ansible.cfg          # Ansible 설정 파일
├── inventory/           # 인벤토리 파일 디렉토리
│   └── hosts            # 서버 목록(호스트 그룹 정의)
├── group_vars/          # 그룹별 변수 파일
│   └── group_name.yml   # 특정 호스트 그룹에 대한 변수들
├── host_vars/           # 호스트별 변수 파일
│   └── host_name.yml    # 특정 호스트에 대한 변수들
├── roles/               # 롤 디렉토리(작업의 논리적 묶음)
│   └── role_name/       # 개별 롤
│       ├── tasks/       # 롤의 작업을 정의하는 파일들
│       │   └── main.yml # 롤에서 실행될 기본 작업 파일
│       ├── handlers/    # 이벤트 처리(알림 및 핸들러 정의)
│       │   └── main.yml # 기본 핸들러 파일
│       ├── files/       # 파일 복사에 사용되는 정적 파일
│       ├── templates/   # Jinja2 템플릿 파일
│       ├── vars/        # 롤에 사용되는 변수 파일
│       │   └── main.yml # 기본 변수 파일
│       ├── defaults/    # 롤에 사용되는 기본 변수 파일
│       │   └── main.yml # 기본값 설정 파일
│       ├── meta/        # 롤의 메타데이터 정의
│       │   └── main.yml # 롤 간 의존성 정보 등 메타데이터
│       ├── tasks/       # 작업 목록(태스크 리스트)
│       └── README.md    # 롤에 대한 설명 및 정보
├── playbooks/           # 플레이북 디렉토리
│   └── playbook.yml     # 특정 작업 실행을 정의한 플레이북 파일
├── vars/                # 공통 변수 정의
│   └── vars.yml         # 여러 플레이북에서 참조하는 변수 파일
└── scripts/             # 스크립트 파일
    └── example.sh       # 외부 스크립트 파일
```

2. Ansible 디렉토리 및 파일 설명

2.1. 주요 구성 파일

•	ansible.cfg: Ansible 설정 파일. 기본 경로, SSH 설정, 인벤토리 위치 등을 정의합니다.
•	inventory/**hosts**: **서버 목록을 정의하는 인벤토리 파일**. 서버 IP 주소, 호스트 이름, 호스트 그룹을 정의할 수 있습니다.

```sh
[app:vars]    // app 그룹에 속한 모든 서버에 대해 적용될 변수를 정의
ansible_ssh_private_key_file=/usr/local/share/MY_KEYPAIR_NAME.pem
ansible_user=ec2-user

[app]         // app 그룹에 속한 서버들의 목록을 정의
MY_APP_PRIVATE_IP
```

2.2. 변수 관련 디렉토리

•	group_vars/: 특정 호스트 그룹에 대해 변수를 정의하는 디렉토리. group_name.yml 파일로 그룹별 변수를 설정합니다.
•	host_vars/: 특정 호스트에 대해 변수를 정의하는 디렉토리. 개별 호스트마다 host_name.yml 파일로 설정합니다.
•	vars/: **플레이북 전반에서 사용할 전역 변수 파일**을 저장하는 디렉토리입니다.

2.3. 플레이북 (Playbooks)

•	playbooks/: 여러 플레이북 파일이 저장되는 디렉토리입니다. 플레이북은 서버에서 실행할 작업의 전체 흐름을 정의합니다.
•	playbook.yml: 실제 작업의 순서와 수행할 호스트 그룹을 정의하는 **Ansible 플레이북 파일**.

플레이북은 **여러 작업(Task)**을 정의하고, 호스트, 사용자, 변수, 롤(Role) 등과 같은 실행 환경을 설정합니다. 플레이북은 일반적으로 다음과 같은 구조를 가집니다:

•	호스트: 작업이 실행될 대상 서버를 정의.
•	사용자: 원격 서버에서 사용할 사용자 계정.
•	변수 파일: 필요한 변수를 외부 파일로부터 불러옴.
•	롤(Role) 또는 태스크(Task) 리스트: 실행할 작업들의 집합.

```yml
- name: admin user add
  hosts: "{{ deploy_hosts }}"
  remote_user: "{{default_user}}"
  vars_files:
    - "vars/all.yml"
  roles:
    - backend    // backend라는 롤을 실행하라고 지시
```

```sh
ansible-playbook deploy_backend.yml -i ./hosts/hosts --extra-vars "deploy_hosts=app"

// deploy_hosts 변수를 --extra-vars 옵션을 통해 지정
```

### main.yml 호출 과정
1.	플레이북에서 backend라는 롤을 호출합니다.
2.	Ansible은 roles/backend/ 디렉토리로 이동하여 **tasks/main.yml**을 찾아 실행합니다.
3.	tasks/main.yml 안에 포함된 모든 태스크가 순차적으로 실행됩니다.

2.4. 롤 (Roles)

롤은 Ansible에서 작업의 재사용성을 높이고, 관리할 작업을 논리적 그룹으로 나누기 위한 방법입니다. 롤은 각 작업을 실행할 때 자동으로 적절한 파일을 호출하는 표준 구조를 따릅니다.

•	tasks/main.yml: 이 파일에 **롤이 실행할 작업을 정의**합니다. 롤을 호출하면 이 파일이 기본적으로 실행됩니다.
```yml
- include: copy_target_jar.yml
  become: true

- include: kill_java.yml
  become: true

- include: run_java.yml
  become: true
```
•	handlers/main.yml: 핸들러는 특정 이벤트가 발생할 때(예: 서비스 재시작 필요 시) 실행되는 작업을 정의합니다.
•	files/: 롤에서 사용될 정적 파일을 저장하는 디렉토리입니다. 예를 들어, 원격 서버로 복사할 파일이 여기에 위치합니다.
•	templates/: Jinja2 템플릿 파일을 저장하는 곳입니다. 템플릿 파일은 변수에 따라 동적으로 생성될 파일들을 정의합니다.
•	vars/main.yml: 롤에서 사용할 변수를 정의하는 파일입니다.
•	defaults/main.yml: 롤에서 사용할 기본값 변수를 정의합니다. 다른 변수보다 낮은 우선순위를 가집니다.
•	meta/main.yml: 롤 간 의존성이나 메타데이터를 정의하는 파일입니다.


**개별 작업 파일 (Task file)**

개별 작업 파일은 플레이북 내에서 포함(include)되거나 롤(role)의 일부로 사용되는 파일로, 특정 작업(Task)만을 정의합니다. 이 파일은 단일 작업 또는 짧은 작업 리스트만을 가지고 있으며, 독립적으로 실행되지 않고 플레이북 내에서 불려서 실행됩니다.

작업 파일의 특징:

•	보통 - include: 또는 - import_tasks:로 플레이북에서 불러와 사용됩니다.
•	호스트나 사용자를 설정하지 않으며, 이를 직접 실행하는 대신 플레이북에서 호출됩니다.
•	단일 작업 또는 관련된 여러 작업의 작은 묶음을 처리합니다.

```sh
- name: run java
  shell:
    cmd: |
      nohup java -jar /home/ec2-user/employee-management-backend-0.0.1-SNAPSHOT.jar &
```

3. 롤 호출 시 파일 실행 순서

**롤을 호출하면 Ansible은 tasks/main.yml 파일부터 실행**합니다. 만약 핸들러나 다른 작업이 필요한 경우, 작업에 따라 handlers/main.yml 또는 meta/main.yml 등의 파일이 호출될 수 있습니다.

4. 기타 디렉토리

•	scripts/: 프로젝트 내에서 사용하는 외부 스크립트를 저장할 수 있습니다. 배포 시 추가적인 스크립트 작업이 필요한 경우 여기에서 관리됩니다.
•	README.md: 롤이나 프로젝트의 설명 파일입니다. 이 파일을 통해 프로젝트나 롤의 기능과 사용법을 문서화할 수 있습니다.

-----------

## ansible을 사용하는 이유

Ansible을 Jenkins와 함께 사용하는 이유는 인프라 자동화와 복잡한 배포 프로세스 관리를 보다 효율적이고 유연하게 처리하기 위해서입니다. Jenkinsfile 내에서 직접 명령어를 실행하는 방식도 가능하지만, Ansible을 사용하는 데는 여러 가지 중요한 이점이 있습니다. 이를 구체적으로 살펴보면:

1. 복잡한 인프라 관리 자동화

Jenkinsfile에서는 단순한 명령어 실행을 직접 할 수 있지만, Ansible은 서버 간의 복잡한 작업 흐름을 보다 쉽게 관리할 수 있습니다. 예를 들어, 여러 대의 서버에 동일한 작업을 수행하거나, 다양한 서버 환경에서의 배포를 처리하는 데 Ansible의 인벤토리와 롤(Role)이 매우 유용합니다.

•	Jenkinsfile은 보통 단일 프로세스(예: 코드 빌드, 테스트, 배포)를 처리하지만, Ansible은 **멀티 서버 작업(여러 서버에 명령어 실행)을 쉽게 처리** 할 수 있습니다.
•	Ansible은 인벤토리 파일을 통해 대상 서버를 정의하고, 특정 그룹에만 작업을 수행하는 등의 기능을 제공합니다.

2. 재사용성 및 유연성

Ansible의 롤(Role)과 태스크(Task)는 **재사용 가능**하게 설계되어 있어, 다양한 프로젝트나 환경에서 쉽게 사용될 수 있습니다. 한 번 설정한 작업 흐름은 다른 환경에서도 동일하게 적용할 수 있습니다.

•	Ansible의 롤을 이용하면 동일한 작업을 여러 환경(예: 개발, 테스트, 운영)에서 유지 관리하면서도 쉽게 배포할 수 있습니다.
•	Jenkinsfile에 명령어를 직접 작성하는 경우, 작업이 고정되어 있어 재사용하기가 어려울 수 있습니다.

3. Idempotency(멱등성) 보장

Ansible의 가장 큰 장점 중 하나는 멱등성을 보장하는 것입니다. 멱등성이란, **동일한 작업을 여러 번 실행하더라도 시스템의 상태가 바뀌지 않는 특성**입니다. 예를 들어, 이미 실행 중인 서비스는 다시 시작되지 않으며, 필요한 변경 사항만 적용됩니다.

	•	Jenkinsfile에 명령어를 직접 작성하면, 상태를 체크하고 작업이 필요할 때만 실행되도록 하기 위해 추가적인 로직이 필요합니다.
	•	Ansible은 이러한 상태 관리가 자동으로 이루어지므로, 반복 실행에도 안전합니다.

4. 배포 프로세스의 모듈화

Ansible을 사용하면 **배포 프로세스의 각 단계(예: 파일 복사, 서비스 종료, 애플리케이션 실행)를 모듈화**할 수 있습니다. 각각의 작업을 독립된 파일이나 롤로 나누어 관리하고, 필요할 때 원하는 작업만 호출할 수 있습니다.

	•	Jenkinsfile은 명령어가 순차적으로 나열된 스크립트에 불과해, 복잡한 배포 흐름을 관리하기가 까다롭습니다.
	•	Ansible은 작업을 단계별로 나누고, 필요할 때 재사용할 수 있도록 설계되어 있어 유지 보수가 용이합니다.

5. 다양한 기능과 확장성

Ansible은 다양한 모듈을 제공하여 서버 관리, 패키지 설치, 서비스 관리, 파일 복사, 네트워크 설정 등 여러 작업을 자동화할 수 있습니다. 이는 단순히 Java 애플리케이션 실행을 넘어서는 전체 시스템 관리를 가능하게 합니다.

	•	Jenkinsfile에서 직접 모든 시스템 작업을 처리하는 것은 복잡해지기 쉽고, 특정 환경에 종속될 수 있습니다.
	•	Ansible을 사용하면 이러한 작업들을 모듈화하고 표준화된 방식으로 쉽게 확장할 수 있습니다.

6. 다양한 환경 및 클라우드 서비스 지원

Ansible은 AWS, GCP, Azure와 같은 클라우드 서비스와도 쉽게 통합할 수 있어, 인프라 구성부터 배포까지 모든 것을 자동화할 수 있습니다. Jenkinsfile에서 모든 것을 수동으로 처리하려면, 클라우드 API에 직접 접근하는 복잡한 로직이 필요하지만, Ansible은 이미 이러한 클라우드 환경에 대한 지원을 제공하므로, 필요한 설정만 하면 쉽게 통합할 수 있습니다.

7. 다양한 배포 환경 지원

Jenkins는 보통 CI/CD 파이프라인에서 코드 빌드와 테스트에 초점을 맞추는 반면, **Ansible은 배포 환경 전체를 관리하는 데 더 유리**합니다. Jenkinsfile 내에서 단순히 빌드 및 실행만 하는 것이 아니라, 운영 환경 관리와 서비스 프로비저닝 등 더 복잡한 작업을 관리할 수 있습니다.

결론

Jenkinsfile에서 Java 실행과 같은 명령어를 직접 작성할 수 있지만, Ansible을 사용하면 배포 프로세스의 복잡성을 쉽게 관리할 수 있고, 유지보수성, 확장성, 멱등성, 유연성 등의 장점 덕분에 더 나은 자동화 환경을 제공합니다. 특히 여러 서버 환경을 대상으로 하는 경우, Ansible의 인벤토리와 롤을 활용하면 더욱 효율적이고 안정적인 배포 작업을 수행할 수 있습니다.

------------

## 사용되는 곳

CI/CD 파이프라인에서 Ansible의 역할 및 연계

Ansible은 주로 배포 및 인프라 설정 관리를 담당하며, Jenkins, GitLab CI, Docker, Kubernetes, Terraform 등과 함께 사용될 수 있습니다. 아래는 Ansible을 다양한 DevOps 도구들과 함께 사용하는 전체적인 흐름입니다.

1. 코드 커밋 및 빌드 단계 (CI)

•	도구: Git (GitHub, GitLab, Bitbucket), Jenkins, GitLab CI
•	단계:
•	개발자가 애플리케이션 코드 변경 사항을 Git에 커밋합니다.
•	CI 도구(예: Jenkins, GitLab CI)가 커밋된 코드를 감지하고, 빌드 작업을 트리거합니다.
•	코드 빌드 후, CI 도구는 테스트를 실행하여 코드가 예상대로 작동하는지 확인합니다.

Ansible과의 연계:

•	이 단계에서는 보통 Ansible이 직접 사용되지는 않지만, CI 도구에서 코드 빌드와 테스트가 성공적으로 완료되면 다음 배포 단계에서 Ansible이 호출됩니다.

2. 배포 준비 및 인프라 설정

•	도구: Ansible, Terraform, Cloud Provider (AWS, GCP, Azure)
•	단계:
•	CI 도구(Jenkins, GitLab CI 등)는 빌드가 완료된 후, 배포하기 위한 인프라 설정 작업을 실행합니다.
•	여기에서 Ansible과 Terraform이 함께 사용될 수 있습니다. Terraform은 인프라 프로비저닝 도구로, **클라우드 리소스(예: EC2 인스턴스, 네트워크 구성 등)**를 자동으로 생성하는 데 사용됩니다.
•	Ansible은 클라우드 인프라 위에 애플리케이션 배포나 서버 설정을 자동화하는 작업을 수행합니다.

Ansible과의 연계:

•	Terraform은 예를 들어 AWS에서 EC2 인스턴스나 데이터베이스를 생성하고 관리하는 데 사용되며, Ansible은 생성된 인프라에 접속하여 애플리케이션 배포, 설정 파일 배포, 서비스 설정 등의 작업을 수행합니다.
•	Ansible은 인프라가 생성된 후 서버에 필요한 패키지 설치, 환경 설정 등을 자동으로 진행합니다.

```sh
  # Terraform과 함께 사용하는 예시
terraform apply

# Terraform이 완료된 후 Ansible 실행
ansible-playbook -i inventory/hosts site.yml
```

3. 애플리케이션 배포 (CD)

•	도구: Ansible, Jenkins, Docker, Kubernetes, ArgoCD
•	단계:
•	CI 도구가 빌드와 테스트가 완료된 후, Ansible을 사용하여 애플리케이션을 서버에 배포합니다.
•	만약 Kubernetes 환경이라면, Ansible이 아닌 ArgoCD 같은 GitOps 도구가 Kubernetes 클러스터에 애플리케이션을 배포할 수 있습니다.
•	Docker와 Kubernetes 환경에서는 Ansible이 컨테이너 생성, 이미지 배포 등도 자동화할 수 있습니다.

Ansible과의 연계:

•	CI 도구(Jenkins, GitLab CI)는 빌드가 완료된 후 Ansible 플레이북을 호출하여 배포 작업을 실행합니다.
•	Ansible은 서버나 클러스터에 애플리케이션을 복사하고, Java 애플리케이션을 실행하거나 서비스를 재시작하는 등의 작업을 자동화합니다.

```groovy
# Jenkinsfile에서 Ansible과 연계된 배포 과정
pipeline {
    agent any

    stages {
        stage('Build') {
            steps {
                echo 'Building the application...'
                // 빌드 작업 (예: Maven, Gradle)
            }
        }
        stage('Deploy') {
            steps {
                echo 'Deploying using Ansible...'
                ansiblePlaybook(
                    playbook: 'deploy_app.yml',
                    inventory: 'inventory/hosts',
                    credentialsId: 'my-ssh-key'
                )
            }
        }
    }
}
```

•	컨테이너 기반 배포: 만약 배포가 Docker나 Kubernetes로 이루어진다면, Ansible이 컨테이너 이미지를 빌드하고 Docker 레지스트리에 푸시하거나, Kubernetes 클러스터에 배포할 수 있습니다.

4. 애플리케이션 상태 모니터링 및 업데이트

•	도구: Ansible, Prometheus, Grafana, ArgoCD
•	단계:
•	배포 후, 애플리케이션이 정상적으로 동작하는지 모니터링 도구를 통해 확인합니다.
•	애플리케이션이 정상적으로 동작하지 않는 경우, Ansible을 통해 롤백 작업을 수행할 수 있습니다.
•	Prometheus와 Grafana 같은 도구를 사용해 애플리케이션 성능을 모니터링하고, 문제가 발생하면 Ansible이 자동으로 서비스 재시작 또는 재배포 작업을 수행합니다.

Ansible과의 연계:

•	애플리케이션이 정상적으로 배포되지 않았을 경우, Ansible을 통해 롤백이나 서비스 복구 작업을 자동화할 수 있습니다.
•	Prometheus 알림이나 모니터링 시스템에서 트리거된 경고에 대해 Ansible이 자동으로 대응할 수 있습니다.

5. GitOps 및 선언적 배포 방식 (ArgoCD와 함께 사용)

•	도구: ArgoCD, GitLab, Jenkins, Kubernetes
•	단계:
•	ArgoCD는 GitOps 방식을 채택하여, Git 레포지토리의 상태와 Kubernetes 클러스터의 상태를 자동으로 동기화합니다.
•	Ansible은 Kubernetes 클러스터 외부의 인프라 설정을 자동화하고, ArgoCD는 애플리케이션 배포를 담당합니다.
•	Git 리포지토리에 변경사항이 커밋되면 ArgoCD가 이를 감지하여 Kubernetes 클러스터에 새로운 상태를 적용합니다.

Ansible과의 연계:

•	Ansible은 **Kubernetes 외부 인프라(네트워크, 서버 등)**를 관리하고, ArgoCD는 클러스터 내부 애플리케이션 배포를 담당하는 역할로 나눌 수 있습니다.

전체적인 Ansible 사용 흐름 요약

1.	코드 커밋 및 빌드(CI 도구): Jenkins, GitLab CI, CircleCI 등의 CI 도구에서 코드가 커밋되면 빌드가 자동으로 시작됩니다.
2.	인프라 준비(Ansible + Terraform): Terraform이 클라우드 인프라를 프로비저닝하고, Ansible이 서버 설정 및 애플리케이션 환경을 구성합니다.
3.	애플리케이션 배포(Ansible 또는 ArgoCD): 빌드가 완료된 애플리케이션을 Ansible로 배포하거나, Kubernetes 클러스터에서는 ArgoCD를 사용해 GitOps 방식으로 배포를 처리합니다.
4.	모니터링 및 유지 관리: Prometheus, Grafana 같은 모니터링 도구를 사용해 애플리케이션 상태를 확인하고, 문제가 발생하면 Ansible로 자동 복구 작업을 수행할 수 있습니다.
