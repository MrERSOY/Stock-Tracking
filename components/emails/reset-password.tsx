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
  resetUrl: string;
  userEmail: string;
}

const ForgotPasswordEmail = (props: ForgotPasswordEmailProps) => {
  const { username, resetUrl, userEmail } = props;

  return (
    <Html lang="tr" dir="ltr">
      <Tailwind>
        <Head />
        <Preview>Parolanızı sıfırlayın - İşlem gerekli</Preview>
        <Body className="bg-gray-100 font-sans py-[40px]">
          <Container className="bg-white rounded-[8px] shadow-sm max-w-[600px] mx-auto p-[40px]">
            {/* Header */}
            <Section className="text-center mb-[32px]">
              <Heading className="text-[28px] font-bold text-gray-900 m-0 mb-[8px]">
                Parolanızı Sıfırlayın
              </Heading>
              <Text className="text-[16px] text-gray-600 m-0">
                Parolanızı sıfırlama isteği aldık
              </Text>
            </Section>

            {/* Main Content */}
            <Section className="mb-[32px]">
              <Text className="text-[16px] text-gray-700 leading-[24px] m-0 mb-[16px]">
                Merhaba, {username}
              </Text>
              <Text className="text-[16px] text-gray-700 leading-[24px] m-0 mb-[16px]">
                <strong>{userEmail}</strong> ile ilişkili hesabınız için bir
                parola sıfırlama isteği aldık.
              </Text>
              <Text className="text-[16px] text-gray-700 leading-[24px] m-0 mb-[24px]">
                Yeni bir parola oluşturmak için aşağıdaki butona tıklayın.
                Güvenlik nedeniyle bu bağlantı 24 saat içinde sona erecektir.
              </Text>
            </Section>

            {/* Reset Button */}
            <Section className="text-center mb-[32px]">
              <Button
                href={resetUrl}
                className="bg-blue-600 text-white px-[32px] py-[16px] rounded-[8px] text-[16px] font-semibold no-underline box-border inline-block"
              >
                Parolayı Sıfırla
              </Button>
            </Section>

            {/* Alternative Link */}
            <Section className="mb-[32px]">
              <Text className="text-[14px] text-gray-600 leading-[20px] m-0 mb-[8px]">
                Buton çalışmazsa bu bağlantıyı kopyalayıp tarayıcınıza
                yapıştırın:
              </Text>
              <Link
                href={resetUrl}
                className="text-blue-600 text-[14px] break-all"
              >
                {resetUrl}
              </Link>
            </Section>

            {/* Security Notice */}
            <Section className="bg-gray-50 p-[20px] rounded-[8px] mb-[32px]">
              <Text className="text-[14px] text-gray-700 leading-[20px] m-0 mb-[8px] font-semibold">
                Güvenlik Notu:
              </Text>
              <Text className="text-[14px] text-gray-600 leading-[20px] m-0 mb-[8px]">
                • Bu parola sıfırlama isteğini siz göndermediyseniz lütfen bu
                e-postayı yok sayın
              </Text>
              <Text className="text-[14px] text-gray-600 leading-[20px] m-0 mb-[8px]">
                • Bu bağlantı 24 saat içinde sona erecektir
              </Text>
              <Text className="text-[14px] text-gray-600 leading-[20px] m-0">
                • Güvenliğiniz için bu bağlantıyı kimseyle paylaşmayın
              </Text>
            </Section>

            {/* Help Section */}
            <Section className="mb-[32px]">
              <Text className="text-[14px] text-gray-600 leading-[20px] m-0">
                Yardıma mı ihtiyacınız var? Destek ekibimizle şu adresten
                iletişime geçin:{" "}
                <Link
                  href="mailto:support@company.com"
                  className="text-blue-600"
                >
                  support@company.com
                </Link>
              </Text>
            </Section>

            {/* Footer */}
            <Section className="border-t border-gray-200 pt-[24px]">
              <Text className="text-[12px] text-gray-500 leading-[16px] m-0 mb-[8px]">
                Bu e-posta {userEmail} adresine gönderildi
              </Text>
              <Text className="text-[12px] text-gray-500 leading-[16px] m-0 mb-[8px]">
                Şirket Adı, İş Caddesi 123, Şehir, İl 12345
              </Text>
              <Text className="text-[12px] text-gray-500 leading-[16px] m-0">
                © 2025 Şirket Adı. Tüm hakları saklıdır.{" "}
                <Link href="#" className="text-gray-500">
                  Abonelikten çık
                </Link>
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default ForgotPasswordEmail;
