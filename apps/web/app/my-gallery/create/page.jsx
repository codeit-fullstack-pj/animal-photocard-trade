"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { VARIANTS, useImageVariants } from "./useImageVariants";
import styles from "./create.module.css";
import LandingHeader from "@/components/landing/LandingHeader";

// TODO: API 연동 시 실제 생성 응답으로 교체 (지금은 이 시간만큼 로딩 후 완료 페이지로 이동)
const SUBMIT_DELAY_MS = 10000;

const CATEGORIES = [
  { value: "dog", label: "강아지", image: "/dog.png" },
  { value: "cat", label: "고양이", image: "/cat.png" },
];

export default function CreatePage() {
  const router = useRouter();

  const [count, setCount] = useState(0);
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [selectedKey, setSelectedKey] = useState("original");
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitTimerRef = useRef(null);

  const { variants } = useImageVariants(imageFile);
  const selectedUrl = variants?.[selectedKey]?.url || previewUrl;

  const canSubmit =
    Boolean(imageFile) && name.trim() !== "" && category !== "" && description.trim() !== "";

  // 카테고리 선택 전에는 카테고리만 노출. 선택하면 나머지 입력(이미지·이름·설명·생성 버튼)을 한 번에 표시
  const showDetails = category !== "";

  useEffect(() => {
    let ignore = false;

    async function loadRemainingCount() {
      // TODO: API 연동 시 남은 생성 횟수 조회로 교체
      const remaining = 0;
      if (!ignore) setCount(remaining);
    }

    loadRemainingCount();
    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  useEffect(() => {
    return () => {
      if (submitTimerRef.current) clearTimeout(submitTimerRef.current);
    };
  }, []);

  function handleSubmit() {
    if (!canSubmit || isSubmitting) return;

    const filterType = VARIANTS.findIndex((v) => v.key === selectedKey) + 1;

    setIsSubmitting(true);

    // TODO: API 연동 시 2단계로 교체
    //  1) POST /images/upload  (FormData: image=imageFile, category)  → { imageId }
    //  2) POST /cards  (JSON: { imageId, filterType, name, description })  → 생성된 카드 { id }
    //  성공 → router.push(`/my-gallery/create/success?id=${id}`), 실패 → setIsSubmitting(false)
    console.log("포토카드 생성 요청", {
      category,
      filterType,
      name: name.trim(),
      description: description.trim(),
    });
    submitTimerRef.current = setTimeout(() => {
      const createdId = "temp"; // TODO: POST /cards 응답의 id
      router.push(`/my-gallery/create/success?id=${createdId}`);
    }, SUBMIT_DELAY_MS);
  }

  function handleImageChange(e) {
    const file = e.target.files?.[0] ?? null;
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setImageFile(file);
    setPreviewUrl(file ? URL.createObjectURL(file) : "");
    setSelectedKey("original");
  }

  return (
    <>
      <LandingHeader />
      <main className="flex w-full justify-center px-4 pt-10 font-sans-400 tablet:px-6 pc:px-0 pc:pt-20">
        <div className="mb-10 flex h-full w-84.25 flex-col items-center gap-8 tablet:w-full tablet:max-w-170 pc:mb-15 pc:max-w-none pc:w-310 pc:gap-20">
          <div className="flex w-full flex-col gap-3 pc:gap-5">
            <h2 className="text-left text-3xl font-primary tablet:text-4xl pc:text-[62px]">
              포토카드 생성
            </h2>
            <div className="h-0.5 w-full bg-gray-100" />
            <span className="text-right text-sm pc:text-xl">남은 생성 횟수 : {count}</span>
          </div>
          <form
            onSubmit={(e) => e.preventDefault()}
            className="flex h-auto w-full flex-col justify-center gap-8 pc:flex-row pc:gap-16.25"
          >
            {!showDetails && (
              <div className="flex w-full flex-row justify-center gap-2.5">
                {CATEGORIES.map(({ value, label, image }) => (
                  <div
                    key={value}
                    onClick={() => setCategory(value)}
                    className={`relative flex aspect-74/94 w-full max-w-55 cursor-pointer flex-col items-center justify-center gap-3 overflow-hidden rounded-lg transition pc:aspect-auto pc:h-94 pc:w-74 pc:max-w-none pc:gap-5 ${
                      category === value
                        ? "bg-purple-button opacity-100"
                        : "bg-[#535353] opacity-70 hover:bg-purple-button hover:opacity-100"
                    }`}
                  >
                    <Image
                      src={image}
                      alt={label}
                      width={199}
                      height={224}
                      priority
                      className="h-auto w-1/2 object-cover pc:h-56 pc:w-49.75"
                    />
                    <span className="relative z-10 font-sans-600 text-lg pc:text-2xl">{label}</span>
                  </div>
                ))}
              </div>
            )}

            {showDetails && (
              <>
                <div
                  className={`${styles.stepIn} flex h-auto w-full flex-col gap-4 pc:w-188 pc:gap-7.5`}
                >
                  <div
                    role="img"
                    aria-label={selectedUrl ? "선택한 이미지 미리보기" : undefined}
                    style={selectedUrl ? { backgroundImage: `url(${selectedUrl})` } : undefined}
                    className="flex aspect-188/125 w-full items-center justify-center overflow-hidden bg-[#535353] bg-cover bg-center pc:aspect-auto pc:h-125"
                  >
                    {!selectedUrl && (
                      <span className="text-base font-light leading-normal text-white">
                        이미지 미리보기
                      </span>
                    )}
                  </div>
                  <div className="flex h-auto w-full gap-2 pc:gap-3.75">
                    {VARIANTS.map(({ key, label }) => {
                      const url = variants?.[key]?.url;
                      const isSelected = selectedKey === key;

                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => setSelectedKey(key)}
                          aria-pressed={isSelected}
                          aria-label={label}
                          style={url ? { backgroundImage: `url(${url})` } : undefined}
                          className={`flex aspect-188/125 flex-1 items-center justify-center overflow-hidden bg-[#535353] bg-cover bg-center ${
                            isSelected ? "ring-2 ring-purple-button" : ""
                          }`}
                        >
                          {!url && (
                            <span className="text-sm font-light leading-normal text-white pc:text-base">
                              {label}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className={`${styles.stepIn} flex w-full flex-col gap-5 pc:w-md pc:gap-6.25`}>
                  <div className="flex flex-col gap-2 pc:gap-2.5">
                    <span className="text-base font-bold leading-normal text-white pc:text-xl">
                      사진 업로드
                    </span>
                    <div className="flex w-full gap-2.5">
                      <input
                        readOnly
                        value={imageFile ? imageFile.name : ""}
                        placeholder="사진 업로드"
                        className="flex h-15 min-w-0 flex-1 items-center gap-2.5 rounded-xs border border-gray-200 bg-black px-5 py-4.5"
                      />
                      <label className="flex h-15 w-30 shrink-0 cursor-pointer items-center justify-center gap-2.5 overflow-hidden rounded-xs border border-purple-button bg-purple-button">
                        <span className="whitespace-nowrap text-center text-base font-normal leading-normal text-white">
                          파일 선택
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 pc:gap-2.5">
                    <span className="text-base font-bold leading-normal text-white pc:text-xl">
                      포토카드 이름
                    </span>
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="포토카드 이름을 입력해 주세요"
                      className="flex h-15 w-full items-center gap-2.5 rounded-xs border border-gray-200 bg-black px-5 py-4.5"
                    />
                  </div>

                  <div className="flex flex-col gap-2 pc:gap-2.5">
                    <span className="text-base font-bold leading-normal text-white pc:text-xl">
                      카테고리
                    </span>
                    <div className="flex gap-2.5">
                      {CATEGORIES.map(({ value, label }) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() => setCategory(value)}
                          className={`flex h-15 flex-1 items-center justify-center rounded-xs font-sans-600 text-white transition ${
                            category === value
                              ? "bg-purple-button"
                              : "bg-[#535353] opacity-70 hover:opacity-100"
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 pc:gap-2.5">
                    <span className="text-base font-bold leading-normal text-white pc:text-xl">
                      포토카드 설명
                    </span>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="카드 설명을 입력해 주세요"
                      className="flex h-36 w-full resize-none items-center gap-2.5 rounded-xs border border-gray-200 bg-black px-5 py-4.5 pc:h-45"
                    />
                  </div>

                  <div className="w-full">
                    <button
                      type="button"
                      onClick={handleSubmit}
                      disabled={!canSubmit}
                      className={`flex h-15 w-full items-center justify-center rounded-xs text-base font-bold text-white transition-opacity ${
                        canSubmit
                          ? "bg-purple-button hover:opacity-90"
                          : "cursor-not-allowed bg-[#535353]"
                      }`}
                    >
                      생성하기
                    </button>
                  </div>
                </div>
              </>
            )}
          </form>
        </div>

        {isSubmitting && (
          <div className="fixed inset-0 z-50 flex w-full flex-col items-center justify-center gap-10 bg-black px-6">
            <h2
              className={`${styles.loadingDots} w-full text-center text-2xl leading-normal tracking-[-1.38px] font-primary-bold text-white pc:text-[46px]`}
            >
              포토카드 <span className="text-yellow-300">생성 중</span>
            </h2>
            <span className="block w-full text-center text-base leading-normal font-sans-700 text-white pc:text-xl">
              <span className="text-purple-button">{name}</span>의 포토카드를 만드는 중 입니다
            </span>
          </div>
        )}
      </main>
    </>
  );
}
