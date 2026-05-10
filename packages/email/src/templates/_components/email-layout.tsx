import { Html, Head, Preview, Body, Container } from "@react-email/components";
import { Tailwind } from "@react-email/tailwind";
import type { ReactNode } from "react";

interface EmailLayoutProps {
  preview: string;
  children: ReactNode;
}

export function EmailLayout({ preview, children }: EmailLayoutProps) {
  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Tailwind>
        <Body
          style={{
            backgroundColor: "#f5f5f5",
            fontFamily: "sans-serif",
            margin: "0",
            padding: "40px 0",
          }}
        >
          <Container
            style={{
              backgroundColor: "#ffffff",
              border: "1px solid #eaeaea",
              borderRadius: "8px",
              maxWidth: "465px",
              margin: "0 auto",
              padding: "40px",
            }}
          >
            {children}
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
