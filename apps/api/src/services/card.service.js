import { ApiError } from "../lib/api-error.js";
import { deriveCardTag } from "../lib/card-flavor.js";
import { createCard } from "../repositories/card.repository.js";
import { findImageById } from "../repositories/image.repository.js";

const PRISMA_UNIQUE_CONSTRAINT_CODE = "P2002";

export async function createCardFromImage({ ownerId, imageId, filterType, name, description }) {
  const image = await findImageById(imageId);
  // 존재하지 않는 이미지와 "남의 이미지"를 구분해서 응답하면 다른 사람의 imageId 존재 여부가 새어나가므로 똑같이 404 처리한다
  if (!image || image.uploaderId !== ownerId) {
    throw new ApiError(404, "IMAGE_NOT_FOUND", "이미지를 찾을 수 없습니다");
  }

  const topScore = Math.max(...image.score.axes.map((axis) => axis.value));
  const tag = deriveCardTag(image.category, image.score.axes);

  let card;
  try {
    card = await createCard({
      ownerId,
      createdById: ownerId,
      imageId,
      name,
      filterType,
      tag,
      topScore,
      description,
    });
  } catch (error) {
    // Card.imageId 는 @unique — 이미 카드로 쓰인 이미지로 또 만들려고 하면 여기서 걸린다
    // (뒤로가기로 되돌아온 폼 재제출, 중복 탭, 요청 재시도 등으로 발생 가능)
    if (error.code === PRISMA_UNIQUE_CONSTRAINT_CODE) {
      throw new ApiError(409, "IMAGE_ALREADY_USED", "이미 카드로 만들어진 이미지입니다");
    }
    throw error;
  }

  return toCardResponse(card);
}

function toCardResponse(card) {
  return {
    id: card.id,
    ownerId: card.ownerId,
    createdById: card.createdById,
    imageId: card.imageId,
    name: card.name,
    category: card.image.category,
    description: card.description,
    filterType: card.filterType,
    imageUrl: card.image.imageUrl,
    tag: card.tag,
    topScore: card.topScore,
    score: card.image.score,
    createdAt: card.createdAt,
    updatedAt: card.updatedAt,
  };
}
