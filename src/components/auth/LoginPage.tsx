import React, { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

export function LoginPage({
  onLogin,
}: {
  onLogin: (companyId: string) => void;
}) {
  const [companyId, setCompanyId] = useState("");
  const [password, setPassword] = useState("");
  const [companyIdError, setCompanyIdError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [generalError, setGeneralError] = useState("");

  useEffect(() => {
    if (companyIdError) setCompanyIdError("");
    if (generalError) setGeneralError("");
  }, [companyId]);

  useEffect(() => {
    if (passwordError) setPasswordError("");
    if (generalError) setGeneralError("");
  }, [password]);

  const validateCompanyId = (value: string): boolean => {
    if (!value.trim()) {
      setCompanyIdError("회사 ID를 입력해주세요");
      return false;
    }
    const companyIdRegex = /^EMP\d{3}$/;
    if (!companyIdRegex.test(value)) {
      setCompanyIdError("올바른 회사 ID 형식이 아닙니다 (예: EMP001)");
      return false;
    }
    return true;
  };

  const validatePassword = (value: string): boolean => {
    if (!value) {
      setPasswordError("비밀번호를 입력해주세요");
      return false;
    }
    return true;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setCompanyIdError("");
    setPasswordError("");
    setGeneralError("");

    const isCompanyIdValid = validateCompanyId(companyId);
    const isPasswordValid = validatePassword(password);

    if (!isCompanyIdValid || !isPasswordValid) {
      return;
    }

    setIsLoading(true);

    // Mock login - 실제 구현시 API 호출
    setTimeout(() => {
      // Mock validation
      if (companyId === "EMP001" && password === "InitialPass123!") {
        onLogin(companyId);
      } else if (companyId === "EMP002" && password === "Password123!") {
        onLogin(companyId);
      } else {
        setGeneralError("회사 ID 또는 비밀번호가 올바르지 않습니다");
      }
      setIsLoading(false);
    }, 500);
  };

  const isFormValid = companyId.trim() !== "" && password !== "";

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-6">
      <div className="w-full max-w-md">
        {/* Logo/Title Area */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-[#3751FF] mb-3">SOLAR</h1>
          <p className="text-base text-[#525252]">
            Self Observation for Light And Recovery
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-8">
          <div className="space-y-4">
            <Label
              htmlFor="companyId"
              className="text-sm font-medium text-[#171717]"
            >
              회사 ID
            </Label>
            <Input
              id="companyId"
              type="text"
              placeholder="회사에서 발급한 ID를 입력하세요"
              value={companyId}
              onChange={(e) => setCompanyId(e.target.value)}
              className={`h-12 ${
                companyIdError ? "border-[#E5484D]" : "border-[#E5E5E5]"
              }`}
              disabled={isLoading}
              autoCapitalize="characters"
              autoCorrect="off"
              autoComplete="off"
            />
            {companyIdError && (
              <p className="text-sm text-[#E5484D]">{companyIdError}</p>
            )}
          </div>
          <p className="text-xs text-[#A3A3A3] text-center mb-2"></p>
          <div className="space-y-4">
            <Label
              htmlFor="password"
              className="text-sm font-medium text-[#171717]"
            >
              비밀번호
            </Label>
            <p className="text-xs text-[#A3A3A3] text-center mb-2"></p>
            <Input
              id="password"
              type="password"
              placeholder="비밀번호를 입력하세요"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`h-12 ${
                passwordError ? "border-[#E5484D]" : "border-[#E5E5E5]"
              }`}
              disabled={isLoading}
              autoCapitalize="none"
              autoCorrect="off"
            />
            {passwordError && (
              <p className="text-sm text-[#E5484D]">{passwordError}</p>
            )}
          </div>

          {generalError && (
            <div className="bg-[#E5484D]/10 border border-[#E5484D]/20 rounded-lg p-3">
              <p className="text-sm text-[#E5484D] text-center">
                {generalError}
              </p>
            </div>
          )}
          <p className="text-xs text-[#A3A3A3] text-center mb-4"></p>
          <Button
            type="submit"
            className="w-full h-12 bg-[#3751FF] hover:bg-[#3751FF]/90 text-white font-medium rounded-lg"
            disabled={!isFormValid || isLoading}
          >
            {isLoading ? "로그인 중..." : "로그인"}
          </Button>
        </form>

        {/* Help Text */}
        <div className="mt-8">
          <p className="text-xs text-[#A3A3A3] text-center">
            회사에서 발급받은 ID로 로그인하세요
          </p>
        </div>
      </div>
    </div>
  );
}
