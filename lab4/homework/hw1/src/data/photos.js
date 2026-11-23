// Dữ liệu mẫu dùng ảnh từ picsum.photos.
// Lưu ý: khi thay bằng ảnh thật, hãy viết alt mô tả đúng nội dung ảnh (WCAG 1.1.1).
const PICSUM_IDS = [10, 11, 15, 16, 17, 18, 22, 28, 29, 37, 39, 42];

export const photos = PICSUM_IDS.map((picsumId, index) => {
  const n = index + 1;
  return {
    id: String(n),
    title: `Ảnh mẫu ${n}`,
    alt: `Ảnh mẫu số ${n} (ảnh phong cảnh ngẫu nhiên từ Picsum)`,
    description: `Ảnh mẫu số ${n} trong bộ sưu tập. Nguồn: picsum.photos, ID ${picsumId}.`,
    thumbUrl: `https://picsum.photos/id/${picsumId}/400/300`,
    fullUrl: `https://picsum.photos/id/${picsumId}/1200/900`,
  };
});
