import { redirect } from "next/navigation";

/** `/` → 용병 홈. 로그인 여부는 proxy가 갈라 줍니다 (routing.md §4-4). */
export default function Home() {
  redirect("/games");
}
