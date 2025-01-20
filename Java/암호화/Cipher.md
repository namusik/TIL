# Cipher

## 개념
- Java Cryptography Architecture(JCA)의 일부

## 주요 기능
1.	암호화 및 복호화: Cipher 클래스는 데이터를 암호화(Encryption)하거나 복호화(Decryption)하는 데 사용
2.	다양한 알고리즘 지원: AES, DES, RSA, Blowfish 등 다양한 대칭 및 비대칭 암호화 알고리즘을 지원
3.	모드 및 패딩: CBC, ECB 같은 암호화 모드와 PKCS5Padding, NoPadding 등의 패딩 방식을 설정 가능
4.	키 관리: SecretKey, PublicKey, PrivateKey 등 다양한 키 타입을 지원하여 안전한 키 관리가 가능

## 사용법

1.	Cipher 인스턴스 생성: 사용할 암호화 알고리즘과 변환(transformation)을 지정하여 Cipher 인스턴스를 생성
2.	초기화: 암호화 또는 복호화 모드로 초기화하고, 필요한 경우 키 및 초기화 벡터(IV)를 설정
3.	데이터 처리: doFinal 메서드를 사용하여 데이터를 암호화하거나 복호화

## 알호화 알고리즘
- AES: 고급 암호 표준 (Advanced Encryption Standard)으로 대칭 키 암호화 알고리즘입니다.
- CBC (Cipher Block Chaining): 블록 암호 모드 중 하나로, 각 블록이 이전 블록의 암호문에 의해 영향을 받습니다.
- PKCS5Padding: 블록 크기를 맞추기 위해 데이터에 패딩을 추가하는 방식입니다.

## 예제
```java
import javax.crypto.Cipher;
import javax.crypto.KeyGenerator;
import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import java.util.Base64;

public class CipherExample {
    public static void main(String[] args) throws Exception {
        String plainText = "Hello, World!";

        // 1. 키 생성
        KeyGenerator keyGen = KeyGenerator.getInstance("AES");
        keyGen.init(128); // 128-bit AES
        SecretKey secretKey = keyGen.generateKey();

        // 2. Cipher 인스턴스 생성 및 초기화 (암호화)
        Cipher cipher = Cipher.getInstance("AES/CBC/PKCS5Padding");
        cipher.init(Cipher.ENCRYPT_MODE, secretKey);
        
        // 초기화 벡터 (IV) 가져오기
        byte[] iv = cipher.getIV();

        // 3. 암호화 수행
        byte[] encryptedBytes = cipher.doFinal(plainText.getBytes("UTF-8"));
        String encryptedText = Base64.getEncoder().encodeToString(encryptedBytes);
        System.out.println("Encrypted Text: " + encryptedText);

        // 4. Cipher 인스턴스 생성 및 초기화 (복호화)
        Cipher decipher = Cipher.getInstance("AES/CBC/PKCS5Padding");
        decipher.init(Cipher.DECRYPT_MODE, secretKey, new javax.crypto.spec.IvParameterSpec(iv));

        // 5. 복호화 수행
        byte[] decryptedBytes = decipher.doFinal(Base64.getDecoder().decode(encryptedText));
        String decryptedText = new String(decryptedBytes, "UTF-8");
        System.out.println("Decrypted Text: " + decryptedText);
    }
}
```