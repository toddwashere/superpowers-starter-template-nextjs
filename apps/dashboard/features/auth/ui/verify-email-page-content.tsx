"use client";

import Link from "next/link";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { signInPath } from "@workspace/routes";

export function VerifyEmailPageContent() {
  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Check your email</CardTitle>
        <CardDescription>
          We&apos;ve sent you a verification link. Please check your email and
          click the link to verify your account.
        </CardDescription>
      </CardHeader>
      <CardFooter className="justify-center">
        <Link href={signInPath()} className="text-sm text-primary hover:underline">
          Back to sign in
        </Link>
      </CardFooter>
    </Card>
  );
}
