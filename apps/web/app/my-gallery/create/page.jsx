"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { VARIANTS, useImageVariants } from "./useImageVariants";
import styles from "./create.module.css";
import LandingHeader from "@/components/landing/LandingHeader";
import MobileHeader from "@/components/ui/MobileHeader";
import { createCard, getRemainingCount } from "@/lib/card/api";
import { uploadImage } from "@/lib/image/api";

const CATEGORIES = [
  { value: "DOG", label: "강아지", image: "/dog.png" },
  { value: "CAT", label: "고양이", image: "/cat.png" },
];

// 아이폰 HEIC는 대부분 브라우저(Safari 제외)가 <img>로 표시하지 못해서, 선택 즉시 JPEG로 바꿔둔다.
// mimetype이 비어있는 경우가 있어 확장자로도 같이 확인한다
const HEIC_TYPES = ["image/heic", "image/heif"];
function isHeicFile(file) {
  return HEIC_TYPES.includes(file.type) || /\.hei[cf]$/i.test(file.name);
}

async function toUploadableFile(rawFile) {
  if (!isHeicFile(rawFile)) return rawFile;

  const { default: heic2any } = await import("heic2any");
  const converted = await heic2any({ blob: rawFile, toType: "image/jpeg", quality: 0.9 });
  const blob = Array.isArray(converted) ? converted[0] : converted;
  return new File([blob], rawFile.name.replace(/\.hei[cf]$/i, ".jpg"), { type: "image/jpeg" });
}

export default function CreatePage() {
  const router = useRouter();

  const [count, setCount] = useState(0);
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [selectedKey, setSelectedKey] = useState("original");
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitErrorMessage, setSubmitErrorMessage] = useState("");

  // 파일을 고르는 즉시 POST /images/upload 를 호출한다 (카테고리는 이 시점에 이미 선택돼 있음)
  const [uploadedImage, setUploadedImage] = useState(null);
  const [uploadStatus, setUploadStatus] = useState("idle"); // idle | converting | uploading | success | error
  const [uploadErrorMessage, setUploadErrorMessage] = useState("");

  const uploadSeqRef = useRef(0);

  const { variants } = useImageVariants(imageFile);
  const selectedUrl = variants?.[selectedKey]?.url || previewUrl;

  const canSubmit =
    count > 0 && uploadStatus === "success" && name.trim() !== "" && category !== "";

  // 카테고리 선택 전에는 카테고리만 노출. 선택하면 나머지 입력(이미지·이름·생성 버튼)을 한 번에 표시
  const showDetails = category !== "";

  useEffect(() => {
    let ignore = false;

    getRemainingCount()
      .then((result) => {
        if (ignore) return;
        setCount(result.remainingCount);
      })
      .catch(() => {});

    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  async function handleSubmit() {
    if (!canSubmit || isSubmitting) return;

    const filterType = VARIANTS.findIndex((v) => v.key === selectedKey) + 1;

    setIsSubmitting(true);
    setSubmitErrorMessage("");

    try {
      // description은 서버가 ML 1·2등 축 조합으로 자동 생성한다 (card-flavor.js 참고)
      const card = await createCard({
        imageId: uploadedImage.id,
        filterType,
        name: name.trim(),
      });

      // TODO: GET /cards/{id} 가 생기면 success 페이지가 직접 조회하도록 바꾸고 쿼리 전달은 제거
      const params = new URLSearchParams({
        id: card.id,
        imageUrl: card.imageUrl,
        filterType: String(card.filterType),
        name: card.name,
        description: card.description,
        category: card.category,
        tag: card.tag,
        score: JSON.stringify(card.score),
      });
      router.push(`/my-gallery/create/success?${params.toString()}`);
    } catch (error) {
      setIsSubmitting(false);
      setSubmitErrorMessage(error.message);
    }
  }

  // 업로드 중 파일이 또 바뀌면, 먼저 보낸 요청의 응답이 나중에 와도 무시한다
  async function uploadSelectedImage(file, categoryValue) {
    const seq = (uploadSeqRef.current += 1);
    setUploadStatus("uploading");
    setUploadErrorMessage("");

    try {
      const result = await uploadImage({ file, category: categoryValue });
      if (uploadSeqRef.current !== seq) return;
      setUploadedImage(result);
      setUploadStatus("success");
    } catch (error) {
      if (uploadSeqRef.current !== seq) return;
      setUploadedImage(null);
      setUploadStatus("error");
      setUploadErrorMessage(error.message);
    }
  }

  async function handleImageChange(e) {
    const rawFile = e.target.files?.[0] ?? null;
    if (previewUrl) URL.revokeObjectURL(previewUrl);

    if (!rawFile) {
      uploadSeqRef.current += 1;
      setImageFile(null);
      setPreviewUrl("");
      setSelectedKey("original");
      setUploadedImage(null);
      setUploadStatus("idle");
      return;
    }

    // HEIC면 JPEG로 바꾸는 동안, 그사이 다른 파일이 또 선택되면 이 결과는 버린다
    const seq = (uploadSeqRef.current += 1);
    setUploadStatus("converting");
    setUploadErrorMessage("");

    let file;
    try {
      file = await toUploadableFile(rawFile);
    } catch {
      if (uploadSeqRef.current !== seq) return;
      setUploadStatus("error");
      setUploadErrorMessage("이미지를 처리하지 못했어요. 다른 사진을 선택해 주세요.");
      return;
    }
    if (uploadSeqRef.current !== seq) return;

    setImageFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setSelectedKey("original");
    uploadSelectedImage(file, category);
  }

  // "카테고리 다시 선택" — 카테고리 선택 화면으로 돌아가면서 그 사이 입력해둔 것들을 전부 비운다
  function resetToCategory() {
    uploadSeqRef.current += 1; // 진행 중이던 업로드 응답이 나중에 와도 무시한다
    if (previewUrl) URL.revokeObjectURL(previewUrl);

    setCategory("");
    setImageFile(null);
    setPreviewUrl("");
    setSelectedKey("original");
    setName("");
    setUploadedImage(null);
    setUploadStatus("idle");
    setUploadErrorMessage("");
    setSubmitErrorMessage("");
  }

  return (
    <>
      <div className="tablet:hidden">
        <MobileHeader title="포토카드 생성" backHref="/my-gallery" />
      </div>
      <div className="hidden tablet:block">
        <LandingHeader />
      </div>
      <main className="flex w-full justify-center px-4 pt-10 font-sans-400 tablet:px-6 pc:px-0 pc:pt-20">
        <div className="mb-10 flex h-full w-full flex-col items-center gap-8 tablet:max-w-[680px] pc:mb-15 pc:max-w-none pc:w-310 pc:gap-20">
          <div className="flex w-full flex-col gap-3 pc:gap-5">
            {/* 모바일에선 MobileHeader가 이미 타이틀을 보여주니 중복 노출을 막는다 */}
            <h2 className="hidden text-left text-3xl font-primary tablet:block tablet:text-4xl pc:text-[62px]">
              포토카드 생성
            </h2>
            <div className="hidden h-0.5 w-full bg-gray-100 tablet:block" />
            <div className="flex h-10 w-full items-center justify-between">
              {showDetails ? (
                <button
                  type="button"
                  onClick={resetToCategory}
                  className="flex h-10 items-center justify-center rounded-xs bg-purple-button px-4 text-sm text-white tablet:text-base tablet:font-normal tablet:leading-[normal]"
                >
                  카테고리 다시 선택
                </button>
              ) : (
                <span aria-hidden="true" />
              )}
              <span className="text-sm pc:text-xl">남은 생성 횟수 : {count}</span>
            </div>
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
                    className={`relative flex aspect-[74/94] w-full max-w-[220px] cursor-pointer flex-col items-center justify-center gap-3 overflow-hidden rounded-lg transition pc:aspect-auto pc:h-94 pc:w-74 pc:max-w-none pc:gap-5 ${
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
                    className="flex aspect-[188/125] w-full items-center justify-center overflow-hidden bg-[#535353] bg-cover bg-center pc:aspect-auto pc:h-125"
                  >
                    {!selectedUrl && (
                      <span className="text-base font-light leading-[normal] text-white">
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
                          className={`flex aspect-[188/125] flex-1 items-center justify-center overflow-hidden bg-[#535353] bg-cover bg-center ${
                            isSelected ? "ring-2 ring-purple-button" : ""
                          }`}
                        >
                          {!url && (
                            <span className="text-sm font-light leading-[normal] text-white pc:text-base">
                              {label}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className={`${styles.stepIn} flex w-full flex-col gap-5 pc:w-112 pc:gap-6.25`}>
                  <div className="flex flex-col gap-2 pc:gap-2.5">
                    <span className="text-base font-bold leading-[normal] text-white pc:text-xl">
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
                    {uploadStatus === "converting" && (
                      <span className="text-sm text-gray-300">이미지 변환 중...</span>
                    )}
                    {uploadStatus === "uploading" && (
                      <span className="text-sm text-gray-300">이미지 업로드 중...</span>
                    )}
                    {uploadStatus === "error" && (
                      <span className="text-sm text-red">{uploadErrorMessage}</span>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 pc:gap-2.5">
                    <span className="text-base font-bold leading-[normal] text-white pc:text-xl">
                      포토카드 이름
                    </span>
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="포토카드 이름을 입력해 주세요"
                      className="flex h-15 w-full items-center gap-2.5 rounded-xs border border-gray-200 bg-black px-5 py-4.5"
                    />
                  </div>

                  <div className="flex w-full flex-col gap-2">
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
                    {count <= 0 && (
                      <span className="text-sm text-red">
                        오늘 생성 가능한 횟수를 모두 사용했어요. 내일 다시 시도해 주세요.
                      </span>
                    )}
                    {submitErrorMessage && (
                      <span className="text-sm text-red">{submitErrorMessage}</span>
                    )}
                  </div>
                </div>
              </>
            )}
          </form>
        </div>

        {isSubmitting && (
          <div className="fixed inset-0 z-50 flex w-full flex-col items-center justify-center gap-10 bg-black px-6">
            <h2
              className={`${styles.loadingDots} w-full text-center text-2xl leading-[normal] tracking-[-1.38px] font-primary-bold text-white pc:text-[46px]`}
            >
              포토카드 <span className="text-yellow-300">생성 중</span>
            </h2>
            <span className="block w-full text-center text-base leading-[normal] font-sans-700 text-white pc:text-xl">
              <span className="text-purple-button">{name}</span>의 포토카드를 만드는 중 입니다
            </span>
          </div>
        )}
      </main>
    </>
  );
}
