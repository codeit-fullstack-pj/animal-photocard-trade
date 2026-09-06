"use client";

import { useEffect, useState } from "react";
import CategorySelect from "./CategorySelect";
import { VARIANTS, useImageVariants } from "./useImageVariants";

export default function CreatePage() {
  const [count, setCount] = useState(0);
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [selectedKey, setSelectedKey] = useState("original");
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");

  const { variants } = useImageVariants(imageFile);
  const selectedUrl = variants?.[selectedKey]?.url || previewUrl;

  const canSubmit =
    Boolean(imageFile) &&
    name.trim() !== "" &&
    category !== "" &&
    description.trim() !== "";

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

  function handleSubmit() {
    if (!canSubmit) return;

    const selectedBlob = variants?.[selectedKey]?.blob ?? null;

    const formData = new FormData();
    formData.append("name", name.trim());
    formData.append("category", category);
    formData.append("description", description.trim());
    formData.append("filter", selectedKey);
    if (imageFile) formData.append("original", imageFile);
    if (selectedBlob) formData.append("image", selectedBlob, "photocard.png");

    // TODO: API 연동 시 교체
    // await fetch("/api/photocards", { method: "POST", body: formData });
    console.log("포토카드 생성 - 전송값", {
      name: name.trim(),
      category,
      description: description.trim(),
      filter: selectedKey,
      formDataKeys: [...formData.keys()],
    });
  }

  function handleImageChange(e) {
    const file = e.target.files?.[0] ?? null;
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setImageFile(file);
    setPreviewUrl(file ? URL.createObjectURL(file) : "");
    setSelectedKey("original");
  }

  return (
    <main className="flex w-full justify-center pt-20">
      <div className="mb-15 flex h-full w-310 flex-col items-center gap-20">
        <div className="flex w-full flex-col gap-5">
          <h2 className="text-left text-[62px] font-(family-name:--font-heading)">포토카드 생성</h2>
          <div className="h-0.5 w-full bg-[#EEEEEE]" />
          <span className="text-right text-xl font-(family-name:--font-heading)">
            남은 생성 횟수 : {count}
          </span>
        </div>
        <form
          onSubmit={(e) => e.preventDefault()}
          className="flex h-auto w-130 flex-col gap-16.25"
        >
          <div className="flex h-auto w-full flex-col gap-7.5">
            <div
              role="img"
              aria-label={selectedUrl ? "선택한 이미지 미리보기" : undefined}
              style={
                selectedUrl
                  ? { backgroundImage: `url(${selectedUrl})` }
                  : undefined
              }
              className="flex aspect-square w-full items-center justify-center overflow-hidden bg-[#535353] bg-cover bg-center"
            >
              {!selectedUrl && (
                <span className="text-base font-light leading-[normal] text-white">
                  이미지 미리보기
                </span>
              )}
            </div>
            <div className="flex h-auto w-full gap-3.75">
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
                    style={
                      url ? { backgroundImage: `url(${url})` } : undefined
                    }
                    className={`flex aspect-square flex-1 items-center justify-center overflow-hidden bg-[#535353] bg-cover bg-center ${
                      isSelected ? "ring-2 ring-[#A656F5]" : ""
                    }`}
                  >
                    {!url && (
                      <span className="text-base font-light leading-[normal] text-white">
                        {label}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="flex flex-col gap-2.5">
            <span className="text-xl font-bold leading-[normal] text-white">사진 업로드</span>
            <div className="flex w-full gap-2.5">
              <input
                readOnly
                value={imageFile ? imageFile.name : ""}
                placeholder="사진 업로드"
                className="flex h-15 w-97.5 items-center gap-2.5 rounded-xs border border-[#DDD] bg-[#0F0F0F] px-5 py-4.5"
              />
              <label className="flex h-15 w-30 cursor-pointer items-center justify-center gap-2.5 overflow-hidden rounded-xs border border-[#A656F5] bg-[#A656F5] px-7 py-4.5">
                <span className="whitespace-nowrap text-center text-base font-normal leading-[normal] text-white">
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
          <div className="flex flex-col gap-2.5">
            <span className="text-xl font-bold leading-[normal] text-white">포토카드 이름</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="포토카드 이름을 입력해 주세요"
              className="flex h-15 w-full items-center gap-2.5 rounded-xs border border-[#DDD] bg-[#0F0F0F] px-5 py-4.5"
            />
          </div>
          <div className="flex flex-col gap-2.5">
            <span className="text-xl font-bold leading-[normal] text-white">카테고리</span>
            <CategorySelect value={category} onChange={setCategory} />
          </div>
          <div className="flex flex-col gap-2.5">
            <span className="text-xl font-bold leading-[normal] text-white">포토카드 설명</span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="카드 설명을 입력해 주세요"
              className="flex h-45 w-full resize-none items-center gap-2.5 rounded-xs border border-[#DDD] bg-[#0F0F0F] px-5 py-4.5"
            />
          </div>
          <div className="w-full">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!canSubmit}
              className={`flex h-15 w-full items-center justify-center rounded-xs text-base font-bold text-white transition-opacity ${
                canSubmit
                  ? "bg-[#A656F5] hover:opacity-90"
                  : "cursor-not-allowed bg-[#535353]"
              }`}
            >
              생성하기
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
