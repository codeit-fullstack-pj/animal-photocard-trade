"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import FormField from "@/components/auth/FormField";
import { ApiError } from "@/lib/api-client";
import { signin } from "@/lib/auth/api";

export default function LoginForm() {
  const router = useRouter();
  const [values, setValues] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;
    setValues({ ...values, [name]: value });
    if (errors[name] || errors.form) setErrors({ ...errors, [name]: undefined, form: undefined });
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const clientErrors = {};
    if (!values.email.trim()) clientErrors.email = "이메일을 입력해 주세요.";
    if (!values.password) clientErrors.password = "비밀번호를 입력해 주세요.";
    if (Object.keys(clientErrors).length > 0) {
      setErrors(clientErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      await signin(values);
      router.push("/");
    } catch (error) {
      if (error instanceof ApiError && error.code === "INVALID_CREDENTIALS") {
        setErrors({ form: "이메일 또는 비밀번호가 올바르지 않아요." });
      } else {
        setErrors({ form: error.message ?? "요청에 실패했어요." });
      }
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
      <FormField
        label="이메일"
        type="email"
        name="email"
        autoComplete="email"
        placeholder="이메일을 입력해 주세요"
        value={values.email}
        onChange={handleChange}
        error={errors.email}
      />
      <FormField
        label="비밀번호"
        type="password"
        name="password"
        autoComplete="current-password"
        placeholder="비밀번호를 입력해 주세요"
        value={values.password}
        onChange={handleChange}
        error={errors.password}
      />

      {errors.form && (
        <p role="alert" className="font-sans-400 text-sm text-red">
          {errors.form}
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-4 h-14 w-full rounded-[0.25rem] bg-purple-button font-sans-600 text-sm text-white hover:bg-[#9548e6] disabled:opacity-60"
      >
        {isSubmitting ? "로그인 중..." : "로그인"}
      </button>
    </form>
  );
}
