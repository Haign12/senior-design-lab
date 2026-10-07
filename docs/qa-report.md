# QA và giới hạn bằng chứng

Kiểm tra trên Chromium/Windows, ngày 08/10/2026 theo giờ thiết bị. Không có người tham gia usability study.

| Hạng mục | Kết quả | Bằng chứng |
|---|---|---|
| Nội dung | PASS | 8 chặng × 4 bài; 32 ID duy nhất; 64 thẻ; mỗi bài có ví dụ, rubric, quiz và nguồn |
| Học bài | PASS | Câu trả lời ẩn; thử sai/đúng; hoàn thành sau khi pass quiz; giữ sau reload |
| Ôn tập | PASS | Ôn đến hạn cập nhật due date; luyện tự do 12 thẻ giữ nguyên lịch |
| Tìm kiếm | PASS | Không dấu; bộ lọc 4 bài/chặng; empty state và khôi phục |
| Nội dung cá nhân | PASS | Note, bookmark, draft, rubric, self-assessment giữ sau reload |
| Backup | PASS | Download JSON; reject sai schema; cancel giữ dữ liệu; confirm thay đúng dữ liệu |
| Xuất dự án | PASS | Download Markdown có bản nháp và checklist |
| Responsive | PASS | 9 route ở 12 độ rộng: 320, 390, 600, 759, 760, 959, 960, 1024, 1280, 1440, 1920, 2560; 108 tổ hợp không tràn ngang |
| Tất cả bài | PASS | Render đủ 5 khối học và quiz ở cả 32 bài |
| Bàn phím | PASS | Search shortcut, focus visible, drawer trap, Escape và trả focus |
| Theme | PASS | 9 route ở dark mode; token chữ/nền chính vượt 4.5:1 cả hai theme |
| Runtime | PASS | Không có console error hoặc page error trong lượt kiểm tra |
| Chạy trực tiếp | PASS | file:// mở bài và giữ note sau reload trong Chromium |
| Storage failure | PASS | Dữ liệu hỏng không bị ghi đè; hết quota giữ nội dung trong phiên và hướng dẫn backup |
| Visual | PASS phạm vi mẫu | Đã mở và xem ảnh home sáng/tối, desktop lesson/review/workbook, mobile home/menu/lesson; không thấy clipping trong các mẫu đã xem |
| Firefox / Safari / thiết bị thật | UNKNOWN | Chưa chạy trong các môi trường này |
| WCAG toàn bộ | UNKNOWN | Kiểm nền tảng focus, keyboard, semantic labels và core contrast; chưa audit tất cả tiêu chí hoặc assistive technology |
| Kết quả học / mastery | UNKNOWN | Không có user research hoặc đo lường retention của sản phẩm |
| Public deployment / cloud sync | SKIP | Ngoài phạm vi triển khai local |

Kết quả chi tiết: `evidence/automated-checks.json` và `evidence/recovery-checks.json`. Ảnh chụp trong `evidence/` là bằng chứng visual; screenshot full page có thể đặt phần tử fixed theo khung nhìn, ảnh viewport là đối chiếu bố cục trực tiếp.

Các sửa trong QA: nút kết thúc review chuyển về dashboard bằng action rõ ràng; dialog backup có tên và mô tả truy cập được; giới hạn ghi chú/bản nháp khớp schema; nhịp học 10/20/30 phút cập nhật hướng dẫn tương ứng.

Manifest toolkit có trạng thái READY_FOR_EXTERNAL_COLLABORATOR: trạng thái routing của bộ workflow, không phải kết quả QA hoặc xác nhận xuất bản. Các kết quả PASS ở đây là kiểm tra kỹ thuật trong phạm vi mô tả.
