# Lab03 — Bài thực hành dành cho sinh viên

Bản hoàn thiện riêng Lab03. Xem [báo cáo đối chiếu yêu cầu](BAO_CAO_LAB03.md) và [lệnh chạy trên Windows/XAMPP hoặc Ubuntu/WSL](Ma_nguon/README.md). Tài liệu đề gốc trong `HUONG_DAN.md` và `Huong_dan.docx` được giữ nguyên.

Không cần PostgreSQL hoặc Composer.

## Chuẩn bị trên Ubuntu/WSL

```bash
sudo apt update
sudo apt install php-cli git unzip
php -v
git --version
```

PHP cần từ 8.1 trở lên. Các lệnh bên dưới chạy trong Ubuntu/WSL. Khi tải nhiều bài, trở về thư mục cha chứa các thư mục lab trước mỗi lệnh clone; không clone bài tiếp theo bên trong `Ma_nguon` của bài trước.

## Tải bài

```bash
git clone --single-branch --branch lab3 https://github.com/FIT-DNU/Open-Source-Software-Development.git lab3
cd lab3/Ma_nguon
```

## Chạy bài

```bash
bash lab.sh check
bash lab.sh run
```

Mở [danh sách sự kiện](http://127.0.0.1:8103/) hoặc [form đăng ký](http://127.0.0.1:8103/register.php). Giữ terminal mở; Ctrl+C để dừng.

## Kiểm tra

Mở terminal thứ hai tại Ma_nguon, hoặc dừng máy chủ trước:

```bash
bash lab.sh test
bash lab.sh extend
```

test kiểm tra phần mẫu; extend kiểm tra phần tự làm. Bản này đã hoàn thiện bộ lọc và nối vào giao diện; các bộ kiểm thử gốc được giữ nguyên.

[Hướng dẫn đầy đủ](HUONG_DAN.md) · [Hướng dẫn mã nguồn](Ma_nguon/README.md)

Không đưa .local, mật khẩu hoặc dữ liệu cá nhân thật vào bài nộp.

## Các bài khác

[Lab01](https://github.com/FIT-DNU/Open-Source-Software-Development/tree/lab1) · [Lab02](https://github.com/FIT-DNU/Open-Source-Software-Development/tree/lab2) · [Lab03](https://github.com/FIT-DNU/Open-Source-Software-Development/tree/lab3) · [Lab04](https://github.com/FIT-DNU/Open-Source-Software-Development/tree/lab4) · [Lab05](https://github.com/FIT-DNU/Open-Source-Software-Development/tree/lab5)

Kết quả yêu cầu của phần mẫu: `TESTS=7 FAILED=0`; phần mở rộng: `TESTS=8 FAILED=0`. `check` chỉ kiểm tra môi trường.

## Tự kiểm tra luồng trên trình duyệt

1. Trên danh sách, tìm `php`: có 1 sự kiện. Tìm `xyz`: không có kết quả.
2. Chọn **Đăng ký tham dự**, gửi form trống: thấy lỗi họ tên/email.
3. Nhập tên và email thử nghiệm hợp lệ, nhấn **Kiểm tra**: thấy `PREVIEW_OK`. Đây chỉ là xem trước, chưa lưu Session hoặc CSDL.
4. Chọn **Danh sách sự kiện** để quay lại. Nhập `Git`, chọn `tech`, đánh dấu **Chỉ còn chỗ**: chỉ còn Git Clinic; cả ba điều kiện được giữ lại.


## Giao diện Material 3 và khu thử riêng

Sau `bash lab.sh run`, mở [sự kiện mẫu](http://127.0.0.1:8103/ui-demo.php) hoặc [thử vé/ghế](http://127.0.0.1:8103/ticket-preview.php?id=demo-open-source). Sáu sự kiện hư cấu và ảnh SVG cục bộ có giấy phép CC0. Không cần cài thêm thư viện hoặc build.

Chi tiết sự kiện lab tại `/event.php?id=1` chỉ đọc; nút mở biểu mẫu vẫn dùng chức năng gốc. Lựa chọn demo chỉ ở bộ nhớ trang, tải lại sẽ xóa; chưa giữ ghế, tạo vé hoặc thanh toán. ID demo không đi vào Form/CSDL. Các bộ kiểm thử gốc được giữ nguyên.

Xem [hướng dẫn phần trình bày](Ma_nguon/README.md#giao-diện-material-3).

Kiểm tra dữ liệu UI riêng (không thay test gốc, không cần CSDL): tại `Ma_nguon`, chạy `php tests/ui-demo.php`.
