import SaleDetailView from "@/components/trade/SaleDetailView";
import { mockUsers } from "@/mocks/users.js";

// 판매글 상세 페이지 (서버 컴포넌트) — URL의 id로 실제 API에서 판매글 조회
const MySalesPage = async ({ params }) => {
  const { id } = await params;

  // no-store: 캐시 쓰지 말고 매번 최신 데이터 가져오기 (수정/캔슬 반영 위해 필수)
  const res = await fetch(`http://localhost:4000/api/v1/sales/${id}`, {
    cache: "no-store",
  });

  // 응답 실패(404 등) 시 상세 컴포넌트까지 안 가고 여기서 안내 문구로 처리
  if (!res.ok) {
    return <div>판매글을 찾을 수 없습니다.</div>;
  }

  const sale = await res.json();

  // 로그인 기능 아직 없어서, 지금 보는 사람을 mockUsers[0]으로 임시 고정
  const currentUser = mockUsers[0];

  return (
    <div>
      <SaleDetailView sale={sale} currentUser={currentUser} />
    </div>
  );
};

export default MySalesPage;
