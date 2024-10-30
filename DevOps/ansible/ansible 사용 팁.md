# ansible 사용 팁



## ansible 사용해서 SSH 접속할 때 주의 
이상하게 ansible을 사용해서 ssh로 private ec2에 연결할 때 SSH 키가 검증되지 않았다. 

강제로 jenkins 서버 ec2에 jenkins 사용자로 연결해서 직접 ssh로 private 인스턴스에 연결하고 난 후에야 jenkins 파이프라인에서 ansible이 동작하게 되었다.