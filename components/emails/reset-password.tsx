import * as React from "react";
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
  Tailwind,
} from "@react-email/components";

interface ForgotPasswordEmailProps {
  username: string;
  userEmail: string;
  resetUrl: string;
}
const ForgotPasswordEmail = (props: ForgotPasswordEmailProps) => {
  const { username, userEmail, resetUrl } = props;

  return (
    <Html lang="tr" dir="ltr">
      <Tailwind>
        <Head />
        <Preview>Şifrenizi sıfırlayın - İşlem gerekli</Preview>
        <Body className="bg-gray-100 font-sans py-[40px]">
          <Container className="bg-white rounded-[8px] shadow-sm max-w-[580px] mx-auto p-[40px]">
            {/* Header */}
            <Section className="text-center mb-[32px]">
              <Heading className="text-[28px] font-bold text-gray-900 m-0 mb-[8px]">
                Şifrenizi Sıfırlayın
              </Heading>
              <Text className="text-[16px] text-gray-600 m-0">
                Şifre sıfırlama talebinizi aldık
              </Text>
            </Section>

            {/* Main Content */}
            <Section className="mb-[32px]">
              <Text className="text-[16px] text-gray-700 leading-[24px] m-0 mb-[16px]">
                Merhaba,{username}
              </Text>
              <Text className="text-[16px] text-gray-700 leading-[24px] m-0 mb-[16px]">
                <strong>{userEmail}</strong> e-posta adresinizle ilişkili
                hesabınız için şifre sıfırlama talebi aldık.
              </Text>
              <Text className="text-[16px] text-gray-700 leading-[24px] m-0 mb-[24px]">
                Yeni bir şifre oluşturmak için aşağıdaki butona tıklayın. Bu
                bağlantı güvenlik nedeniyle 24 saat içinde sona erecektir.
              </Text>

              {/* Reset Button */}
              <Section className="text-center mb-[32px]">
                <Button
                  href={resetUrl}
                  className="bg-blue-600 text-white px-[32px] py-[16px] rounded-[8px] text-[16px] font-semibold no-underline box-border inline-block"
                >
                  Şifremi Sıfırla
                </Button>
              </Section>

              <Text className="text-[14px] text-gray-600 leading-[20px] m-0 mb-[16px]">
                Buton çalışmıyorsa, bu bağlantıyı kopyalayıp tarayıcınıza
                yapıştırın:
              </Text>
              <Text className="text-[14px] text-blue-600 leading-[20px] m-0 mb-[24px] break-all">
                <Link href={resetUrl} className="text-blue-600 underline">
                  {resetUrl}
                </Link>
              </Text>

              <Text className="text-[16px] text-gray-700 leading-[24px] m-0 mb-[16px]">
                Bu şifre sıfırlama talebini siz yapmadıysanız, lütfen bu
                e-postayı görmezden gelin. Şifreniz değişmeden kalacaktır.
              </Text>
              <Text className="text-[16px] text-gray-700 leading-[24px] m-0">
                Güvenlik nedeniyle, bu bağlantı 24 saat içinde sona erecektir.
              </Text>
            </Section>

            {/* Security Notice */}
            <Section className="bg-gray-50 p-[20px] rounded-[8px] mb-[32px]">
              <Text className="text-[14px] text-gray-600 leading-[20px] m-0 mb-[8px]">
                <strong>Güvenlik İpucu:</strong>
              </Text>
              <Text className="text-[14px] text-gray-600 leading-[20px] m-0">
                Şifre sıfırlama e-postalarının her zaman resmi domain'imizden
                geldiğini doğrulayın. Şifrenizi asla kimseyle paylaşmayın.
              </Text>
            </Section>

            {/* Footer */}
            <Section className="border-t border-gray-200 pt-[24px]">
              <Text className="text-[14px] text-gray-500 leading-[20px] m-0 mb-[8px]">
                Saygılarımızla,
                <br />
                Güvenlik Ekibi
              </Text>
              <Text className="text-[12px] text-gray-400 leading-[16px] m-0 mb-[16px]">
                Bu otomatik bir mesajdır, lütfen bu e-postayı yanıtlamayın.
              </Text>

              {/* Company Footer */}
              <Text className="text-[12px] text-gray-400 leading-[16px] m-0 mb-[8px]">
                Şirket Adınız
                <br />
                İş Caddesi No: 123, Kat: 5<br />
                İstanbul, Türkiye
              </Text>
              <Text className="text-[12px] text-gray-400 leading-[16px] m-0">
                <Link href="#" className="text-gray-400 underline mr-[16px]">
                  Abonelikten Çık
                </Link>
                © 2025 Şirket Adınız. Tüm hakları saklıdır.
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default ForgotPasswordEmail;
