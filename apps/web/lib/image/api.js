import { apiFetch, csrfHeaders } from "@/lib/api-client";

// image 도메인 API (포토카드 생성 페이지에서 사용)

// POST /images/upload — multipart/form-data. 성공하면 { id, uploaderId, category, imageUrl, score, createdAt }
export async function uploadImage({ file, category }) {
  const formData = new FormData();
  formData.append("image", file);
  formData.append("category", category);

  return apiFetch("/images/upload", {
    method: "POST",
    body: formData,
    headers: await csrfHeaders(),
  });
}
