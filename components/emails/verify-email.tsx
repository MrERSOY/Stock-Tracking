import * as React from "react";
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
  Tailwind,
} from "@react-email/components";

interface VerifyEmail {
  username: string;
  verifyUrl: string;
}

const VerifyEmail = (props: VerifyEmail) => {
  const { username, verifyUrl } = props;
  return (
    <Html lang="tr" dir="ltr">
      <Head />
      <Preview>
        E-posta adresinizi doğrulayarak kayıt işleminizi tamamlayın
      </Preview>
      <Tailwind>
        <Body className="bg-gray-100 font-sans py-[40px]">
          <Container className="bg-white rounded-[8px] p-[32px] max-w-[600px] mx-auto">
            <Section>
              <Heading className="text-[24px] font-bold text-gray-900 mb-[24px] text-center">
                E-posta Adresinizi Doğrulayın
              </Heading>

              <Text className="text-[16px] text-gray-700 mb-[24px] leading-[24px]">
                Kayıt {username} olduğunuz için teşekkür ederiz! Kayıt
                işleminizi tamamlamak ve hesabınızı kullanmaya başlamak için
                lütfen aşağıdaki butona tıklayarak e-posta adresinizi
                doğrulayın.
              </Text>

              <Section className="text-center mb-[32px]">
                <Button
                  href={verifyUrl}
                  className="bg-blue-600 text-white px-[32px] py-[16px] rounded-[8px] text-[16px] font-semibold no-underline box-border"
                >
                  E-posta Adresini Doğrula
                </Button>
              </Section>

              <Text className="text-[14px] text-gray-600 mb-[24px] leading-[20px]">
                Bu doğrulama bağlantısının geçerlilik süresi 24 saattir. Eğer
                bir hesap oluşturmadıysanız, bu e-postayı güvenle görmezden
                gelebilirsiniz.
              </Text>

              <Text className="text-[14px] text-gray-600 leading-[20px]">
                Buton çalışmıyorsa, bu bağlantıyı kopyalayıp tarayıcınıza
                yapıştırabilirsiniz:
                <br />
                {verifyUrl}
              </Text>
            </Section>

            <Section className="border-t border-solid border-gray-200 pt-[24px] mt-[32px]">
              <Text className="text-[12px] text-gray-500 text-center m-0">
                © 2025 Şirket Adınız. Tüm hakları saklıdır.
              </Text>
              <Text className="text-[12px] text-gray-500 text-center m-0 mt-[8px]">
                İş Caddesi No:123, Şehir, İl 12345
              </Text>
              <Text className="text-[12px] text-gray-500 text-center m-0 mt-[8px]">
                <a href="#" className="text-gray-500 underline">
                  Abonelikten çık
                </a>
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default VerifyEmail;
