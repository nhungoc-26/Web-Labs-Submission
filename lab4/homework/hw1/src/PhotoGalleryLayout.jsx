import { useEffect, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { photos } from './data/photos';
import './PhotoGalleryLayout.css';

/**
 * PhotoGalleryLayout
 * ------------------------------------------------------------------
 * Gallery ảnh + modal xem ảnh dùng native HTML5 <dialog>.
 * - Trạng thái modal KHÔNG nằm trong useState mà được suy ra từ URL
 *   (?photoId=...), nên có thể deep-link, F5, Back/Forward.
 * - Focus management theo WCAG 2.2 AA:
 *   + showModal() => nền phía sau thành inert, focus bị giữ trong dialog (2.1.2, 2.4.3)
 *   + Esc đóng modal (native cancel), không có bẫy bàn phím (2.1.2)
 *   + Mở: focus vào nút Đóng; Đóng: trả focus về đúng thumbnail đã mở (2.4.3)
 *   + Viền focus rõ ràng, không bị che (2.4.7, 2.4.11), nút >= 24x24px (2.5.8)
 */
export default function PhotoGalleryLayout() {
  // 1. URL query string synchronization
  const [searchParams, setSearchParams] = useSearchParams();

  // 2. Modal state derived directly from URL
  const selectedPhotoId = searchParams.get('photoId');
  const selectedIndex = photos.findIndex((p) => p.id === selectedPhotoId);
  const selectedPhoto = selectedIndex >= 0 ? photos[selectedIndex] : null;

  // 3. HTML5 <dialog> ref binding
  const dialogRef = useRef(null);
  const closeButtonRef = useRef(null);
  const thumbnailRefs = useRef(new Map()); // photoId -> <a> thumbnail
  const lastOpenedIdRef = useRef(null); // để trả focus khi đóng

  // 4. Focus trap & open trigger (WCAG 2.2 AA Focus Management)
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const isValidPhoto = photos.some((p) => p.id === selectedPhotoId);

    if (selectedPhotoId && isValidPhoto) {
      lastOpenedIdRef.current = selectedPhotoId;
      // Guard: gọi showModal() khi dialog đang mở (non-modal) sẽ ném InvalidStateError
      if (!dialog.open) dialog.showModal();
      // Đưa focus vào nút Đóng mỗi khi mở (kể cả khi mở từ deep-link)
      closeButtonRef.current?.focus();
    } else if (dialog.open) {
      dialog.close();
    }
  }, [selectedPhotoId]);

  // photoId không tồn tại (vd: ?photoId=abc) => dọn URL, không mở modal rỗng
  useEffect(() => {
    if (selectedPhotoId && !selectedPhoto) {
      setSearchParams({}, { replace: true });
    }
  }, [selectedPhotoId, selectedPhoto, setSearchParams]);

  // 5. Close handler syncing back to URL
  // onClose bắn ra cho MỌI kiểu đóng: Esc, nút Đóng, click backdrop, Back của trình duyệt.
  const handleClose = () => {
    // Chỉ ghi URL nếu URL vẫn còn photoId. Trường hợp người dùng bấm Back,
    // URL đã hết photoId rồi => không push thêm history entry thừa.
    if (searchParams.has('photoId')) {
      setSearchParams({});
    }

    // Trả focus về thumbnail đã mở (WCAG 2.4.3 Focus Order)
    const trigger = thumbnailRefs.current.get(lastOpenedIdRef.current);
    trigger?.focus();
  };

  // Click vào vùng backdrop (chính phần tử <dialog>, không phải nội dung) => đóng
  const handleDialogClick = (event) => {
    if (event.target === dialogRef.current) {
      dialogRef.current.close();
    }
  };

  const goTo = (offset) => {
    if (selectedIndex < 0) return;
    const nextIndex = (selectedIndex + offset + photos.length) % photos.length;
    // replace: chuyển ảnh trong modal không làm phình history
    setSearchParams({ photoId: photos[nextIndex].id }, { replace: true });
  };

  const handleDialogKeyDown = (event) => {
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      goTo(1);
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      goTo(-1);
    }
  };

  return (
    <div className="gallery-layout">
      <header className="gallery-header">
        <h1>Photo Gallery</h1>
        <p className="gallery-hint">
          Chọn một ảnh để xem lớn. Trong cửa sổ xem ảnh: <kbd>←</kbd> <kbd>→</kbd> để
          chuyển ảnh, <kbd>Esc</kbd> để đóng.
        </p>
      </header>

      <main>
        <ul className="gallery-grid" aria-label="Danh sách ảnh">
          {photos.map((photo) => (
            <li key={photo.id}>
              <Link
                to={{ search: `?photoId=${photo.id}` }}
                className="gallery-thumb"
                aria-haspopup="dialog"
                ref={(node) => {
                  if (node) thumbnailRefs.current.set(photo.id, node);
                  else thumbnailRefs.current.delete(photo.id);
                }}
              >
                <img src={photo.thumbUrl} alt={photo.alt} loading="lazy" width="400" height="300" />
                <span className="gallery-thumb__title">{photo.title}</span>
              </Link>
            </li>
          ))}
        </ul>
      </main>

      <dialog
        ref={dialogRef}
        className="photo-dialog"
        aria-labelledby="photo-dialog-title"
        aria-describedby="photo-dialog-desc"
        onClose={handleClose}
        onClick={handleDialogClick}
        onKeyDown={handleDialogKeyDown}
      >
        {selectedPhoto && (
          <div className="photo-dialog__inner">
            <div className="photo-dialog__bar">
              <h2 id="photo-dialog-title" aria-live="polite">
                {selectedPhoto.title}
                <span className="photo-dialog__counter">
                  {' '}
                  ({selectedIndex + 1}/{photos.length})
                </span>
              </h2>
              <button
                ref={closeButtonRef}
                type="button"
                className="icon-button"
                onClick={() => dialogRef.current?.close()}
                aria-label="Đóng cửa sổ xem ảnh"
              >
                <span aria-hidden="true">✕</span>
              </button>
            </div>

            <figure className="photo-dialog__figure">
              <img src={selectedPhoto.fullUrl} alt={selectedPhoto.alt} />
              <figcaption id="photo-dialog-desc">{selectedPhoto.description}</figcaption>
            </figure>

            <div className="photo-dialog__nav">
              <button type="button" className="text-button" onClick={() => goTo(-1)}>
                <span aria-hidden="true">←</span> Ảnh trước
              </button>
              <button type="button" className="text-button" onClick={() => goTo(1)}>
                Ảnh sau <span aria-hidden="true">→</span>
              </button>
            </div>
          </div>
        )}
      </dialog>
    </div>
  );
}
