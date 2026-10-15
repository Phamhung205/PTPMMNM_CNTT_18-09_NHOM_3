# Lab 03 — Hiển thị sự kiện, tìm kiếm và xử lý form

Bản hoàn thiện riêng Lab03: tìm kiếm, bộ lọc kết hợp AND và form xem trước. Nguồn: nhánh `lab3` của [FIT-DNU/Open-Source-Software-Development](https://github.com/FIT-DNU/Open-Source-Software-Development/tree/lab3), tải ngày 15/10/2026. Xem [báo cáo và giải thích mã](../BAO_CAO_LAB03.md).

## Chạy nhanh trên Windows với XAMPP

Mở PowerShell tại thư mục `Ma_nguon` (thư mục có `lab.sh`):

```powershell
& 'C:\xampp\php\php.exe' -v
& 'C:\xampp\php\php.exe' -S 127.0.0.1:8103 -t public
```

Mở http://127.0.0.1:8103/ hoặc http://127.0.0.1:8103/register.php. Giữ terminal mở; Ctrl+C để dừng. Nếu PHP được cài ở nơi khác, thay đường dẫn chương trình. Không cần bật Apache/MySQL trong XAMPP. Nếu cổng đang được sử dụng, dùng trang đang chạy hoặc dừng đúng máy chủ cũ trước khi chạy lại.

Mở PowerShell thứ hai tại cùng thư mục để kiểm thử:

```powershell
& 'C:\xampp\php\php.exe' tests/run.php
& 'C:\xampp\php\php.exe' tests/extension.php
& 'C:\xampp\php\php.exe' tests/edge-cases.php
& 'C:\xampp\php\php.exe' tests/ui-demo.php
```

Hai bộ gốc phải lần lượt trả `TESTS=7 FAILED=0` và `TESTS=8 FAILED=0`; bộ bổ sung có 15 ca. Lệnh gọi PHP trực tiếp thực thi cùng tệp kiểm thử mà `lab.sh` gọi, nhưng không thay cho kiểm tra môi trường Git/Bash của `bash lab.sh check`.

## Mở bài

Mở terminal Ubuntu/WSL tại thư mục chứa `lab.sh`. Dùng PHP từ 8.1 và Git. Hướng dẫn chi tiết, sơ đồ, đoạn mã cần sửa, dữ liệu đối chiếu và rubric nằm trong tài liệu của bài lab.

```bash
bash lab.sh check
bash lab.sh run
```

Mở http://127.0.0.1:8103. Giữ terminal máy chủ hoạt động; dùng terminal thứ hai để kiểm thử. Nhấn Ctrl+C để dừng.

Bài này không cần PostgreSQL, Composer hoặc framework.

## Kiểm tra bài

```bash
bash lab.sh test
bash lab.sh extend
```

`test` kiểm tra phần mẫu; `extend` kiểm tra phần tự làm. Bộ lọc mở rộng đã hoàn thiện. Các bộ kiểm thử gốc được giữ nguyên.

Kết quả mở rộng cần đạt: `TESTS=8 FAILED=0`. Có trang danh sách, bộ lọc theo từ khóa/loại/còn chỗ và Form đăng ký kiểm tra phía máy chủ. Dữ liệu đăng ký hợp lệ hiển thị ở mức xem trước, chưa lưu CSDL.

## Tệp nộp

Giữ mã nguồn, dữ liệu mẫu và kiểm thử. Ghi lại lệnh chạy trong README. Không đưa `.local`, mật khẩu hoặc dữ liệu cá nhân thật vào kho mã và gói nộp. Nộp đúng commit theo yêu cầu của bài; nếu dùng Actions, đính kèm lần chạy tương ứng.


## Phần trình bày giao diện

Lab này giữ CSS cục bộ tại `public/assets/css/app.css`. HTML nằm trong `public/`; các lab có nhiều trang dùng `templates/header.php` và `templates/footer.php`. Có thể lần từ các lớp `form-field`, `event-item`, `error-summary` sang CSS để đọc cách trình bày; Lab01 chỉ dùng phần trang giới thiệu.

Các lớp, nhãn và bố cục chỉ phục vụ hiển thị. Giữ nguyên khối PHP, GET/POST, tên trường, giá trị option, hidden input và thuộc tính kiểm tra đầu vào khi thực hành. Không cần JavaScript, thư viện hoặc bước build mới để chạy giao diện.


## Giao diện Material 3

Màu và kiểu chữ nằm trong `public/assets/css/tokens.css`; bố cục trong `app.css`. Không có bước build hoặc thư viện mới.

Ba lớp được tách rõ:

- `/`: sự kiện gốc của lab; tập kết quả, bộ lọc và form nghiệp vụ giữ nguyên.
- `/event.php?id=1`: chi tiết chỉ đọc, bổ sung metadata hư cấu từ `data/event-content.php`. CTA mở `/register.php` không kèm tham số mới.
- `/ui-demo.php`: sáu sự kiện hư cấu, ID `demo-...` từ `data/ui-demo-events.php`. `/ticket-preview.php?id=demo-open-source` chỉ thử vé/ghế trong bộ nhớ trang, không có form hoặc API ghi dữ liệu.

Khu thử có 96 ghế cố định, 68 khả dụng (16 VIP và 52 Tiêu chuẩn). Hai vé VIP mẫu 350.000 đồng cho tổng 700.000 đồng. Đổi hạng, đổi sự kiện hoặc tải lại sẽ bỏ lựa chọn không phù hợp; không có trạng thái đã giữ chỗ.

Ảnh SVG tự tạo, lưu cục bộ và ghi quyền CC0 trong `public/assets/images/LICENSE.txt`. `presentation.js` chỉ xử lý ảnh lỗi; `ticket-preview.js` chỉ chạy trên trang thử. Khi tắt JavaScript, vẫn đọc được nội dung và dùng form lab như cũ; khu chọn thử được khóa kèm giải thích.

Không đưa ID demo, vé hoặc ghế vào form, Session, Cookie, CSDL hoặc test cũ. Không có backend bán vé, thanh toán hoặc gửi email.

## Các tệp đã thực hiện

- `src/EventFilter.php`: kết hợp từ khóa, loại và còn chỗ bằng AND; trả mảng mới.
- `public/index.php`: nhận GET, hiển thị ba bộ lọc, giữ lựa chọn, xử lý kết quả rỗng và loại không tồn tại.
- `public/register.php`: bổ sung giữ sự kiện đã chọn khi gửi POST; dùng nguyên validation và escape của đề.
- `tests/edge-cases.php`: kiểm thử bổ sung đầu vào sai kiểu, biên độ dài, AND và tính bất biến của dữ liệu.

Không sửa dữ liệu sự kiện hoặc ba bộ kiểm thử gốc. Mã ứng dụng chỉ cần PHP từ 8.1, CSS/JS có sẵn; không cần Node hoặc bước build. Công cụ trình duyệt trong `../Minh_chung` chỉ dùng để tái kiểm thử khi cần.
