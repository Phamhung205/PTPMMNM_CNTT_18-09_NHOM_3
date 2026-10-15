# Minh chứng Lab03

Ngày thực hiện: 15/10/2026. PHP CLI 8.1.25, Windows/XAMPP, Microsoft Edge chạy bằng Playwright.

- `ket-qua-php.txt`: đầu ra thực tế của ba bộ test PHP (7, 8, 15 ca), kiểm tra dữ liệu UI và quét cú pháp toàn bộ 18 tệp PHP.
- `ket-qua-trinh-duyet.txt`: 50 phép kiểm tra HTTP/trình duyệt đều đạt; ghi nhận riêng favicon 404 của mẫu.
- `doi-chieu-nguon.txt`: đối chiếu với ZIP nhánh `lab3` tải từ kho giảng viên, xác nhận các test gốc/dữ liệu/tài liệu đề không bị sửa.
- `01` đến `06` (`.png`): ảnh chụp ứng dụng đang chạy, không phải ảnh thiết kế minh họa.
- `kiem-tra-trinh-duyet.cjs`: mã dùng để kiểm tra trình duyệt và tạo lại ảnh/log.
- `kiem-tra-bo-sung.cjs` và `ket-qua-kiem-tra-lai.txt`: lượt rà soát độc lập bổ sung 91 ca, bao gồm 56 tổ hợp lọc, dữ liệu bất thường, POST biên, các liên kết chi tiết và giao diện 320/768/1440px. Có thể đặt `LAB03_TEST_URL` để kiểm tra bản giải nén tại cổng khác.

Ứng dụng không phụ thuộc Node. Nếu muốn tái chạy riêng phần kiểm chứng trình duyệt, khởi động PHP tại `Ma_nguon`, cài Node và Microsoft Edge, rồi tại một thư mục công cụ riêng:

```powershell
npm.cmd install playwright
$env:NODE_PATH = Join-Path (Get-Location) 'node_modules'
node 'DUONG_DAN_BAI_NOP\Minh_chung\kiem-tra-trinh-duyet.cjs'
```

Thay `DUONG_DAN_BAI_NOP` bằng đường dẫn thực tế. Công cụ gọi máy chủ cục bộ `http://127.0.0.1:8103` và ghi lại ảnh/log tại thư mục chứa script. Không đưa `node_modules` vào bài nộp.
