"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { ApiError } from "@/lib/api-client";
import { signup } from "@/lib/auth/api";

import FormField from "@/components/auth/FormField";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// 입력값을 검사해서 { 필드이름: 메시지 } 형태로 돌려준다. 문제가 없으면 빈 객체
function validate(values) {
  const errors = {};
  if (!values.email) errors.email = "이메일을 입력해 주세요.";
  else if (!EMAIL_PATTERN.test(values.email)) errors.email = "이메일 형식이 올바르지 않아요.";

  if (!values.nickname.trim()) errors.nickname = "닉네임을 입력해 주세요.";

  if (values.password.length < 8) errors.password = "비밀번호는 8자 이상이어야 해요.";

  if (!values.passwordConfirm) errors.passwordConfirm = "비밀번호를 한번 더 입력해 주세요.";
  else if (values.passwordConfirm !== values.password)
    errors.passwordConfirm = "비밀번호가 서로 달라요.";

  return errors;
}

// API 에러 코드(명세서)를 화면 메시지로 바꾼다
function errorsFromApi(error) {
  if (error.code === "EMAIL_ALREADY_EXISTS") return { email: "이미 사용 중인 이메일이에요." };
  if (error.code === "NICKNAME_ALREADY_EXISTS") return { nickname: "이미 사용 중인 닉네임이에요." };
  if (error.code === "VALIDATION_ERROR") return { form: "입력값을 다시 확인해 주세요." };
  return { form: error.message };
}

export default function SignupForm() {
  const router = useRouter();
  const [values, setValues] = useState({
    email: "",
    nickname: "",
    password: "",
    passwordConfirm: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;
    setValues({ ...values, [name]: value });
    if (errors[name] || errors.form) setErrors({ ...errors, [name]: undefined, form: undefined });
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const clientErrors = validate(values);
    if (Object.keys(clientErrors).length > 0) {
      setErrors(clientErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      await signup(values);
      router.push("/login");
    } catch (error) {
      setErrors(error instanceof ApiError ? errorsFromApi(error) : { form: "요청에 실패했어요." });
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
        label="닉네임"
        type="text"
        name="nickname"
        autoComplete="nickname"
        placeholder="닉네임을 입력해 주세요"
        value={values.nickname}
        onChange={handleChange}
        error={errors.nickname}
      />
      <FormField
        label="비밀번호"
        type="password"
        name="password"
        autoComplete="new-password"
        placeholder="8자 이상 입력해 주세요"
        value={values.password}
        onChange={handleChange}
        error={errors.password}
      />
      <FormField
        label="비밀번호 확인"
        type="password"
        name="passwordConfirm"
        autoComplete="new-password"
        placeholder="비밀번호를 한번 더 입력해 주세요"
        value={values.passwordConfirm}
        onChange={handleChange}
        error={errors.passwordConfirm}
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
        {isSubmitting ? "가입 중..." : "가입하기"}
      </button>
    </form>
  );
}
