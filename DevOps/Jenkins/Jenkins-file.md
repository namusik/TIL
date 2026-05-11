# Jenkinsfile 분석

Jenkins에서 사용하는 스크립트로, CI/CD 파이프라인을 정의하는 데 사용

```sh
// pipeline 블록 : 파이프라인 전체를 정의하는 블록
pipeline { 
    agent any                           // agent any: Jenkins가 실행할 때 어떤 노드에서든 이 파이프라인을 실행할 수 있음을 의미함
    tools {
        nodejs "nodejs"
    }
    environment {                                   // 환경 변수 (environment 블록):
        MY_KEYPAIR_NAME = "megabird-local-ec2"
        MY_APP_PRIVATE_IP = "10.1.1.149" 
    }
    stages {                            // stages 블록 : 파이프라인 안에서 여러 **단계(stages)**를 정의합니다. 각 단계는 특정 작업을 수행하는 블록
        stage ('Workspace Clean') {
            steps {
                cleanWs()                  // cleanWs() 명령을 사용해 Jenkins 워크스페이스를 정리. 워크스페이스에 이전 빌드의 잔여 파일이 남아 있을 수 있으므로, 매 빌드 전에 파일을 제거해 깨끗한 상태로 시작하는 단계
            }
        }
        stage ('git clone') {
            steps {
                withCredentials([usernamePassword(credentialsId: '90a8f7ae-42c8-43ff-b941-4215dd2ab96f', passwordVariable: 'GIT_TOKEN', usernameVariable: 'GIT_USER')]) {
                    sh '''
                        echo "Cloning frontend repository into $WORKSPACE"
                        git clone https://$GIT_USER:$GIT_TOKEN@github.com/namusik/facam-devops-frontend.git
                    '''
                }
            }
        }
        stage ('npm build') {
            steps {
                dir('facam-devops-frontend') {    // dir 블록을 사용
                    sh  """
                        npm install
                        CI=false NODE_OPTIONS=--openssl-legacy-provider npm run build
                    """
                }
            }
        }
        stage ('Maven Build') {         // Maven을 사용해 Java 프로젝트를 빌드하는 단계
            steps {
                sh  """
                    cd facam-backend    // 클론한 프로젝트 디렉터리로 이동
                    mvn clean           // 프로젝트를 청소(clean)합니다. 이전 빌드의 결과물 및 임시 파일 등을 제거    
                    mvn package         // Maven으로 프로젝트를 패키징하여 .jar 파일 또는 필요한 산출물을 생성
                    """
            }
        }
        stage ('Ansible Deploy') {      // Ansible을 사용해 배포를 수행하는 단계. CD(지속적 배포)단계
            steps {
                script {                // script 블록 : Groovy 스크립트 구문으로 변수를 사용해 Ansible 설정을 처리
                    withCredentials([usernamePassword(credentialsId: '90a8f7ae-42c8-43ff-b941-4215dd2ab96f', passwordVariable: 'GIT_TOKEN', usernameVariable: 'GIT_USER')]) {
                        sh  """
                            git clone https://${GIT_USER}:${GIT_TOKEN}@github.com/namusik/facam-devops-ansible.git                                  // Ansible 스크립트를 GitHub에서 클론
                            cd  facam-devops-ansible 

                            sed -i 's/MY_KEYPAIR_NAME/${MY_KEYPAIR_NAME}/g' hosts/hosts                                 // Ansible의 hosts/hosts 파일에서 MY_KEYPAIR_NAME를 설정된 변수 값으로 대체
                            sed -i 's/MY_APP_PRIVATE_IP/${MY_APP_PRIVATE_IP}/g' hosts/hosts                             // MY_APP_PRIVATE_IP를 대체

                            ansible-playbook deploy_backend.yml -i ./hosts/hosts --extra-vars "deploy_hosts=app"        //  Ansible을 사용해 deploy_backend.yml 플레이북을 실행하고, hosts/hosts 파일을 인벤토리로 사용하여 서버에 배포합니다. --extra-vars로 deploy_hosts=app을 전달하여 배포 대상을 정의
                            """
                    }
                }
            }
        }
    }
}




```