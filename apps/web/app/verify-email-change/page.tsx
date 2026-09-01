"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Shirt,
  Mail,
  CheckCircle,
  AlertCircle,
  Loader2,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { axiosInstance } from "@/lib/axios";
import { useTranslation } from "@/i18n/useTranslation";

function VerifyEmailChangeContent() {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setErrorMsg(t("verifyEmailChange.tokenNotFound"));
      return;
    }

    axiosInstance
      .post("/v1/customer/profile/verify-email-change", { token })
      .then(() => setStatus("success"))
      .catch((err: unknown) => {
        const msg =
          (err as { response?: { data?: { message?: string } } })?.response?.data
            ?.message ?? t("verifyEmailChange.invalidToken");
        setErrorMsg(msg);
        setStatus("error");
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return (
    <main className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full bg-surface/80 backdrop-blur-md border-b border-outline-variant">
        <div className="flex items-center justify-center h-16 px-4">
          <Link href="/" className="flex items-center gap-2">
            <Shirt className="text-primary w-7 h-7" />
            <span className="text-xl font-bold tracking-tight text-primary">FreshPress Laundry</span>
          </Link>
        </div>
      </header>

      <div className="flex-grow flex items-center justify-center p-4 md:p-8">
        <div className="max-w-[520px] w-full">
          <div className="w-full bg-surface-container-lowest border border-outline-variant rounded-[2rem] p-6 md:p-8 shadow-sm">

            {/* LOADING */}
            {status === "loading" && (
              <div className="text-center py-10 space-y-4">
                <Loader2 className="w-14 h-14 text-primary mx-auto animate-spin" />
                <p className="text-on-surface-variant font-medium">{t("verifyEmailChange.verifying")}</p>
              </div>
            )}

            {/* SUCCESS */}
            {status === "success" && (
              <div className="text-center py-6 space-y-4">
                <CheckCircle className="w-16 h-16 text-primary mx-auto" />
                <h2 className="text-2xl font-bold text-on-surface">{t("verifyEmailChange.successTitle")}</h2>
                <p className="text-on-surface-variant text-sm">
                  {t("verifyEmailChange.successDesc")}
                </p>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 mt-4 bg-primary text-on-primary py-3 px-8 rounded-2xl font-bold hover:opacity-90 transition-all"
                >
                  {t("verifyEmailChange.loginNow")} <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            )}

            {/* ERROR */}
            {status === "error" && (
              <div className="space-y-5">
                <div className="text-center">
                  <div className="w-14 h-14 mx-auto mb-4 bg-error-container rounded-full flex items-center justify-center">
                    <AlertCircle className="w-7 h-7 text-error" />
                  </div>
                  <h2 className="text-2xl font-bold text-on-surface mb-2">{t("verifyEmailChange.failedTitle")}</h2>
                  <p className="text-sm text-on-surface-variant">{errorMsg}</p>
                </div>

                <div className="bg-surface-container rounded-2xl p-4 text-sm text-on-surface-variant space-y-2">
                  <p className="font-semibold text-on-surface flex items-center gap-2">
                    <Mail className="w-4 h-4 text-primary" /> {t("verifyEmailChange.whatToDo")}
                  </p>
                  <ul className="list-disc list-inside space-y-1 ml-1">
                    <li>
                      {t("verifyEmailChange.backTo")}{" "}
                      <Link href="/profile" className="text-primary font-medium underline">
                        {t("verifyEmailChange.goToProfile")}
                      </Link>{" "}
                      {t("verifyEmailChange.goToProfileSuffix")}
                    </li>
                    <li>{t("verifyEmailChange.linkValidNote")}</li>
                    <li>{t("verifyEmailChange.openLatestLinkNote")}</li>
                  </ul>
                </div>

                <Link
                  href="/profile"
                  className="flex items-center justify-center gap-2 w-full py-3.5 bg-primary text-on-primary rounded-2xl font-bold hover:opacity-90 transition-all"
                >
                  {t("verifyEmailChange.backToProfile")} <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            )}
          </div>

          <p className="text-center mt-6 text-sm text-on-surface-variant">
            {t("verifyEmailChange.needHelp")}{" "}
            <Link href="/login" className="text-primary font-semibold hover:underline">
              {t("verifyEmailChange.contactUs")}
            </Link>
          </p>
        </div>
      </div>

      <footer className="mt-auto border-t border-outline-variant bg-surface-container-low py-4">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between gap-3 text-sm">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-primary" />
            <span className="font-medium text-on-surface-variant">{t("verify.securityBadge")}</span>
          </div>
          <Link href="#" className="font-medium text-on-surface-variant hover:text-primary transition-colors">{t("verify.needHelp")}</Link>
        </div>
      </footer>
    </main>
  );
}

export default function VerifyEmailChangePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <span className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    }>
      <VerifyEmailChangeContent />
    </Suspense>
  );
}
