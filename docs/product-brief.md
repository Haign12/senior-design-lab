# Senior Design Lab

## Phạm vi và nguồn sự thật
Website học cá nhân bằng tiếng Việt, phục vụ mục tiêu phát triển năng lực Senior UI/UX Designer tương ứng công việc khoảng 5 năm kinh nghiệm. Hoàn thành khóa học không chứng minh số năm kinh nghiệm hoặc bảo đảm chức danh. Nguồn nội dung: yêu cầu người dùng, bài giảng trong chat, tài liệu NN/g, W3C, Figma, Microsoft và nghiên cứu học tập được liên kết trong website.

Toolkit được sử dụng: Ngh1aa/uiux-ai-workspace, checkout SHA 26c5e24ae5193a785253c31762e9f2cd5bc641f0. Đây là bộ workflow/skills, không phải codebase của một ứng dụng học tập. Manifest do CLI canonical tạo được sao chép vào docs/factory-manifest.json. Flow: professional-website-redesign; archetype: learning-experience. Không chỉnh toolkit, commit, push hoặc deploy. Local output là phạm vi triển khai được ủy quyền.

## Discovery / Prompt OS 0
Vấn đề: bài giảng dài trong chat khó định hướng, ghi nhớ và áp dụng. Người học cần biết hôm nay học gì, tự kiểm tra và quay lại bài chưa vững. Baseline về hiệu quả học: UNKNOWN. Mục tiêu kiểm chứng kỹ thuật: tất cả bài có nội dung thật, quiz có giải thích, dữ liệu học được giữ sau reload, các tác vụ chính dùng được ở desktop/mobile. Tác động tới trí nhớ và năng lực nghề nghiệp: chưa nghiên cứu với người dùng.

Primary audience: người học UI/UX bằng tiếng Việt, học ngắt quãng theo phiên ngắn và cần củng cố tư duy thực hành. Trình độ hiện tại chưa xác nhận; bài học mở tự do, có tự đánh giá và không khóa bằng tiến độ.

JTBD:
1. Khi có một khoảng thời gian ngắn, tôi muốn được gợi ý bài tiếp theo để không phải tự sắp xếp lại toàn bộ kiến thức.
2. Khi vừa học xong, tôi muốn tự nhớ và giải thích lại để biết mình hiểu tới đâu.
3. Khi gặp bài toán thực tế, tôi muốn có bài tập và tiêu chí đánh giá để chuyển kiến thức thành sản phẩm.
4. Khi quay lại sau vài ngày, tôi muốn thấy nội dung cần ôn và công việc đang viết dở.

## IA / Prompt OS 1
Home (hôm nay) → Learn (8 chặng, 32 bài, bộ lọc và tìm kiếm) → Lesson (hiểu, ví dụ, tự nhớ, kiểm tra, thực hành) → Review (thẻ đến hạn; luyện tự do) → Practice (3 dự án, rubric, bản nháp) → Notebook (ghi chú, đánh dấu, tra cứu) → Roadmap (12 tuần linh hoạt, năng lực, sources, backup).

Hash routes hỗ trợ mở sâu, Back/Forward và reload. Mỗi bài có URL riêng. Tiến độ bài, kết quả kiểm tra, recall scheduling, notes và drafts được lưu trong localStorage. Có export/import backup với kiểm tra schema. Không đăng nhập, API, telemetry hay cloud sync.

## Phương pháp học và giới hạn
Practice testing và distributed practice được đánh giá có tính hữu ích cao trong review của Dunlosky et al. (2013): https://www.psychologicalscience.org/publications/journals/pspi/learning-techniques.html
Nguồn implementation-facing: https://www.learningscientists.org/retrieval-practice ; https://www.learningscientists.org/spaced-practice ; https://www.learningscientists.org/interleaving
Ứng dụng: câu trả lời ẩn trước recall, có feedback sau quiz, ôn lại theo ngày và tình huống xen kẽ giữa chặng. Khoảng 1/3/7/14/30/60 ngày là heuristic triển khai có điều chỉnh theo tự đánh giá, không tuyên bố tối ưu cá nhân hay thuật toán FSRS. Các bài tập và quiz là nội dung biên soạn, không phải thang chứng nhận senior.

## Visual / Prompt OS 2
Hướng: sáng, tập trung, có cấu trúc. Font hệ thống Segoe UI hỗ trợ tiếng Việt; màu xanh rêu #245746; page #f5f7f5, surface trắng, chữ #172a23. Design dials: variance 4 / motion 2 / density 4. Taste skill chỉ áp dụng cho tone/craft; product app lấy IA, interaction, state, accessibility từ toolkit.

Signature: bản đồ chặng như mục lục sổ học, thẻ kiến thức hai mặt chỉ mở khi người học chủ động, khung bài học có một câu chốt và bài tập gắn vào dự án.
Các proof composition trước code:
Home: [nav trái] [greeting + phiên học lớn] [lịch ôn nhỏ]; dưới là bản đồ chặng.
Lesson: [breadcrumb] [bài đọc rộng vừa] [mục lục và ghi chú bên phải]; tự nhớ và quiz nằm sau giải thích.
Review: [bộ lọc] [một câu hỏi lớn ở giữa] [hiện đáp án] [tự đánh giá]; không dồn nhiều thẻ một lúc.
Mobile: nav chuyển sang drawer; home/lesson thành một cột; mục lục và ghi chú bài học chuyển xuống dưới nội dung; actions đủ lớn, không có sticky footer che nội dung.

## System / Prompt OS 3
Buildless HTML/CSS/JS; không dependency runtime. Reuse một lesson renderer, một flashcard renderer, một workbook và semantic tokens. File mở trực tiếp được và có local server preview. CSS owns theme pairs and component states. Storage failure hiển thị thông báo, giữ session hiện tại và cho export. Inputs được escape trước khi đưa vào markup. Data import phải validate trước overwrite và được confirm bằng dialog rõ ràng.

## QA / Prompt OS 4
Kiểm source content coverage, quiz indices, state and import validation, calendar scheduling. E2E: learn→quiz→complete→reload, review→rate→due date, search empty→recover, drafts→reload→export/import, bookmarks, theme, keyboard/dialog và responsive. Inspect actual renders ở 390/1440; overflow check 320–2560 và giữa breakpoints. Không tuyên bố independent/user research khi chỉ expert QA.

## Decision log / scope
Không dùng hình stock vì không phục vụ nhiệm vụ học. Diagrams và ví dụ là nội dung dạy học, không ảnh screenshot giả. Không thêm streak gây áp lực, leaderboard, chứng chỉ giả, chatbot giả hoặc tiến độ có sẵn. Bài đọc vẫn mở ngay cả khi chưa làm quiz. Bài hoàn thành là tự xác nhận đã đọc và làm kiểm tra, không đồng nghĩa mastery. Triển khai local có thể review được, không yêu cầu approval thêm cho các quyết định UI có thể đảo ngược trong phạm vi người dùng đã giao.
