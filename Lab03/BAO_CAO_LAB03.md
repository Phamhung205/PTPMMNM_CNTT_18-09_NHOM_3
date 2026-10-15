# BÁO CÁO LAB03 — HIỂN THỊ SỰ KIỆN, TÌM KIẾM VÀ XỬ LÝ FORM

- Học phần: Phát triển phần mềm mã nguồn mở.
- Nhóm / họ tên / mã sinh viên / lớp: **bổ sung trước khi nộp**.
- Nguồn đề và mã mẫu: [nhánh lab3 của FIT-DNU](https://github.com/FIT-DNU/Open-Source-Software-Development/tree/lab3).
- Bản nguồn tải và kiểm thử: ngày 15/10/2026; PHP CLI 8.1.25 trên Windows/XAMPP.
- Phạm vi: chỉ Lab03, gồm phần hướng dẫn và toàn bộ bài mở rộng mục VI.

## 1. Yêu cầu và cách đáp ứng

| Yêu cầu trong đề | Cách thực hiện / bằng chứng |
|---|---|
| Dữ liệu mảng, tách xử lý và giao diện | Giữ nguyên `data/events.php`; lọc tại `src/EventFilter.php`; hiển thị tại `public/index.php` |
| Tìm từ khóa không phân biệt hoa/thường | `stripos(...) !== false`; `php` trả ID 1, `xyz` trả rỗng |
| Kết hợp ba điều kiện bằng AND | `$matchesQuery && $matchesCategory && $matchesAvailability` |
| Không sửa mảng gốc, không trả HTML | Tạo `$result = []`, chỉ thêm các bản ghi phù hợp; có kiểm thử so sánh toàn bộ dữ liệu trước/sau |
| Form GET có đủ ba điều kiện | `q`, `category`, `available=1`; checkbox không chọn thì không áp dụng lọc chỗ |
| Giữ điều kiện sau gửi | `value`, `selected`, `checked` được dựng từ dữ liệu đã đọc bằng `field` |
| Loại không tồn tại | Trả rỗng và giữ option thông báo loại không tồn tại; không tự chuyển thành “Tất cả loại” |
| Kiểm tra POST tại máy chủ | Giữ `validateRegistration`: ID thuộc dữ liệu gốc, tên hợp lệ, email hợp lệ |
| Hiển thị ký tự đặc biệt an toàn | Dùng `e()` cho dữ liệu động; tên có `<b>` hiển thị nguyên văn |
| Kết quả form hợp lệ | Chỉ có `PREVIEW_OK`; không ghi Session/Cookie/CSDL, không tạo vé |
| Trải nghiệm khi form sai | Hiện mã lỗi; giữ tên/email và bổ sung giữ sự kiện hợp lệ đã chọn |
| Bàn giao | Mã, dữ liệu, test gốc, test bổ sung, README, tài liệu đề, báo cáo và minh chứng |

## 2. Giải thích luồng mã

### Danh sách và GET

Trình duyệt gửi `/?q=Git&category=tech&available=1`. `index.php` nạp `Input.php`, `EventFilter.php` và mảng sự kiện qua `require`. `field()` lấy chuỗi, cắt khoảng trắng hai đầu, trả chuỗi rỗng khi nhận mảng. Chỉ chuỗi `1` bật `$availableOnly`.

`filterEvents()` duyệt từng sự kiện và tính ba biểu thức:

```php
$matchesQuery = $query === ''
    || stripos($event['title'], $query) !== false;
$matchesCategory = $category === '' || $event['category'] === $category;
$matchesAvailability = !$availableOnly
    || $event['registered'] < $event['capacity'];
```

Từ khóa hoặc loại rỗng nghĩa là không giới hạn điều kiện tương ứng. “Còn chỗ” yêu cầu số đã đăng ký **nhỏ hơn** sức chứa; bằng hoặc lớn hơn đều bị loại. Khi cả ba điều kiện đúng, sự kiện được thêm vào mảng kết quả mới. `foreach` trên trang chỉ dựng HTML cho mảng kết quả này. Mảng rỗng vẫn trả trang bình thường với thông báo không có kết quả.

Danh sách loại được lấy bằng `array_column` và `array_unique` từ dữ liệu gốc, hiện có `tech` và `design`. Các lựa chọn được giữ bằng `selected`/`checked`. Nút **Xóa bộ lọc** trở về `/`.

GET phù hợp cho tìm kiếm vì không làm thay đổi dữ liệu, có thể lưu URL hoặc tải lại. Ví dụ trên chỉ trả Git Clinic (ID 3).

### Form và POST

GET `/register.php` chỉ dựng form; `$result` vẫn là `null`. Nhấn **Kiểm tra** gửi POST tới trang hiện tại. `validateRegistration()` kiểm tra ID bằng `FILTER_VALIDATE_INT` và danh sách ID thực, tên không rỗng/không quá 120 byte/không chứa ký tự NUL bên trong, email đúng định dạng và không quá 200 byte. Email được chuyển sang chữ thường theo quy ước đề.

Hàm trả `errors` và `data`. Có lỗi thì trang hiện `EVENT_INVALID`, `NAME_INVALID` hoặc `EMAIL_INVALID`; không có lỗi mới hiện `PREVIEW_OK`. Bổ sung `selected` theo ID đã kiểm tra giúp giữ lại sự kiện khi người dùng sửa tên/email.

POST đưa trường vào thân yêu cầu. POST không tự làm dữ liệu an toàn: vẫn phải kiểm tra ở máy chủ. Dropdown chỉ hỗ trợ nhập liệu; người dùng vẫn có thể gửi một ID khác bằng HTTP, nên không được bỏ kiểm tra ID.

### `field`, `e`, `require` và giới hạn

- `field()` đọc đầu vào chuỗi, không chấp nhận mảng; không thay thế validation nghiệp vụ.
- `e()` gọi `htmlspecialchars` với `ENT_QUOTES | ENT_SUBSTITUTE`, mã hóa thẻ/nháy trước khi đưa vào HTML. `<b>Demo</b>` là văn bản, không trở thành phần tử in đậm.
- `require` nạp các hàm và dữ liệu dùng chung; `header.php`/`footer.php` dùng lại bố cục. Không khai báo trùng hàm.
- `strlen` đếm byte, không phải số ký tự tiếng Việt. Giữ quy tắc này theo đề. Tìm kiếm không bổ sung hỗ trợ tiếng Việt không dấu.
- Bộ lọc còn chỗ chỉ lọc danh sách. Form của Lab03 chỉ kiểm tra theo quy tắc được cấp; chưa xử lý giữ chỗ hoặc chống đăng ký trùng.
- Sáu sự kiện demo, vé và ghế là giao diện có sẵn, tách biệt với ba sự kiện nghiệp vụ.

## 3. Bảng tình huống đúng, sai và biên

| Dữ liệu / thao tác | Kết quả mong đợi |
|---|---|
| Không lọc | ID 1, 2, 3 |
| `php` hoặc `pHp` | ID 1 |
| `xyz` | Rỗng, thông báo không có kết quả |
| Loại `tech` | ID 1, 3 |
| Chỉ còn chỗ | ID 1, 3 |
| `Git` + `tech` + còn chỗ | ID 3, giữ đủ ba điều kiện trên form |
| `design` + còn chỗ | Rỗng |
| `PHP` + `design` | Rỗng, chứng minh AND |
| Loại `unknown` | Rỗng, giữ loại không tồn tại |
| `q[]=php`, `category[]=tech`, `available[]=1` | Bỏ qua giá trị mảng, không lỗi PHP |
| `available=0` | Không bật lọc chỗ |
| Từ khóa chứa thẻ và nháy | Hiển thị dạng văn bản, không thực thi HTML |
| ID 1, `O'Neil`, `demo@example.test` | `PREVIEW_OK`, tên đúng dấu nháy |
| ID 3, tên trống, email `bad` | `NAME_INVALID`, `EMAIL_INVALID`, không `PREVIEW_OK`; giữ ID 3 |
| ID 999 hoặc `demo-open-source` | `EVENT_INVALID` |
| `<b>Demo</b>`, email hợp lệ | Xem trước tên nguyên văn, không tạo thẻ `b` |
| Email ` DEMO@EXAMPLE.TEST ` | Chuẩn hóa `demo@example.test` |
| Tên ASCII 120 byte / 121 byte | Hợp lệ / `NAME_INVALID` |
| Tên có NUL bên trong | `NAME_INVALID` |
| Dữ liệu form dạng mảng | Trả lỗi validation, không gây TypeError |
| Dữ liệu nguồn rỗng / sự kiện quá sức chứa | Kết quả rỗng khi áp dụng điều kiện tương ứng |

## 4. Lệnh chạy và kiểm chứng

Tất cả lệnh dưới đây chạy từ `Ma_nguon`. Hướng dẫn Windows đầy đủ ở [README](Ma_nguon/README.md).

```powershell
& 'C:\xampp\php\php.exe' -S 127.0.0.1:8103 -t public
```

Terminal thứ hai:

```powershell
& 'C:\xampp\php\php.exe' tests/run.php
& 'C:\xampp\php\php.exe' tests/extension.php
& 'C:\xampp\php\php.exe' tests/edge-cases.php
& 'C:\xampp\php\php.exe' tests/ui-demo.php
```

Trên Ubuntu/WSL đã cài PHP >= 8.1 và Git:

```bash
bash lab.sh check
bash lab.sh test
bash lab.sh extend
php tests/edge-cases.php
php tests/ui-demo.php
bash lab.sh run
```

Máy thực hiện chưa cài Git/WSL, nên không khẳng định đã chạy `bash lab.sh check/test/extend`. Kiểm thử dùng PHP trực tiếp trên chính các tệp được script gọi. Log thực tế và ảnh nằm trong [Minh_chung](Minh_chung/). Không sửa các bộ `run.php`, `extension.php`, `ui-demo.php` để làm test đạt.

### Kết quả thực tế sau sửa

| Kiểm tra | Kết quả |
|---|---|
| `php tests/run.php` | `TESTS=7 FAILED=0` |
| `php tests/extension.php` | `TESTS=8 FAILED=0` |
| `php tests/edge-cases.php` | `TESTS=15 FAILED=0` |
| `php tests/ui-demo.php` | `DEMO_DATA_ASSERTIONS=PASS`, 6 sự kiện, 96 ghế, 68 khả dụng |
| `php -l` toàn bộ PHP | 18 tệp không lỗi cú pháp |
| Microsoft Edge qua Playwright | `BROWSER_CHECKS=50 FAILED=0` |
| Rà soát độc lập lần hai | `AUDIT_CASES=91 FAILED=0`: 56 tổ hợp bộ lọc, 8 GET bất thường, 14 POST đúng/sai/biên, 7 đường dẫn liên quan, 6 ca hành vi/giao diện |
| Luồng GET → lọc → HTML | Đúng số lượng, đúng tiêu đề và giữ điều kiện |
| Luồng POST → validation → HTML | Đúng lỗi, chuẩn hóa email, xem trước hợp lệ, không chèn thẻ từ đầu vào |
| Điện thoại 390px / tắt JavaScript | Không tràn ngang; bộ lọc vẫn hoạt động |
| Session/Cookie | Không tạo cookie trong các thao tác đã thử |

Trình duyệt có một thông báo 404 cho `/favicon.ico` do mã mẫu không cung cấp biểu tượng tab. Đã ghi rõ trong log; không ảnh hưởng chức năng Lab03. Không có lỗi JavaScript hoặc lỗi tải tài nguyên ứng dụng khác trong lượt kiểm tra. Log PHP không có Warning, Notice hay Fatal error.

Ảnh kiểm chứng: [lọc Git + tech + còn chỗ](Minh_chung/01-bo-loc-ket-hop.png), [kết quả rỗng](Minh_chung/02-khong-co-ket-qua.png), [form sai](Minh_chung/03-form-bao-loi.png), [PREVIEW_OK](Minh_chung/04-preview-ok.png), [ký tự HTML](Minh_chung/05-ky-tu-html.png), [điện thoại](Minh_chung/06-giao-dien-mobile.png).

Lượt kiểm tra lại theo yêu cầu: chạy lại đủ 7 + 8 + 15 ca PHP, dữ liệu UI và 50 bước trình duyệt; tất cả đạt. Bộ 91 ca mới lấy kỳ vọng từ bảng ID cố định, kiểm tra qua HTTP, không dùng hàm PHP đang kiểm tra để tự tính kết quả mong đợi. Đã thử UTF-8 sai trong GET, chuỗi NUL, mảng lồng nhau, ID số quá lớn, tên tiếng Việt, giới hạn byte, bỏ chọn checkbox và POST khi tắt JavaScript. Không phát hiện lỗi chức năng mới; không thay đổi mã ứng dụng hoặc test gốc trong lượt rà soát này. Kết luận chỉ áp dụng cho các trường hợp đã kiểm tra, không phải cam kết không thể có lỗi ở mọi đầu vào.

## 5. Gợi ý giải thích cá nhân khi bảo vệ

1. **Vì sao dùng `!== false`?** Vì `stripos('PHP Open Day', 'php')` trả `0`: tìm thấy ngay đầu chuỗi. So sánh lỏng sẽ nhầm với không tìm thấy.
2. **AND khác OR thế nào?** AND yêu cầu đồng thời cả ba điều kiện. OR có thể làm sự kiện đúng loại nhưng không đúng từ khóa vẫn xuất hiện.
3. **Một lỗi ban đầu và cách sửa?** Hàm mẫu nhận `$category`, `$availableOnly` nhưng chưa sử dụng. Trước sửa, 4/8 ca mở rộng thất bại. Thêm hai biểu thức kiểm tra và AND giải quyết lỗi, sau đó nối tham số vào GET để giao diện dùng đúng hàm.
4. **Vì sao không chỉ chạy test hàm?** Hàm có thể đúng nhưng trang vẫn chỉ truyền từ khóa. Cần thao tác trên form để xác nhận tham số và giữ trạng thái.
5. **Thay đổi nhỏ để minh họa?** Bỏ đánh dấu còn chỗ khi loại là `design`: từ rỗng chuyển thành Design Workshop. Dữ liệu không đổi; chỉ điều kiện lọc đổi.
6. **`PREVIEW_OK` có phải đã đăng ký?** Không. Không có bản ghi, Session hoặc CSDL; tải lại GET chỉ thấy form.

## 6. Hoàn tất thủ tục nộp

Mã và tài liệu được đặt tại `Lab03/Ma_nguon`, kèm báo cáo và minh chứng. Không có `.local`, `node_modules`, mật khẩu hoặc dữ liệu cá nhân thật trong gói nộp.

Kho nộp được chỉ định: [Phamhung205/PTPMMNM_CNTT_18-09_NHOM_4](https://github.com/Phamhung205/PTPMMNM_CNTT_18-09_NHOM_4), nhánh `main`. Chỉ thêm thư mục `Lab03`; giữ nguyên các tệp/thư mục đã có. Bản chuẩn bị đối chiếu với commit `61af41a30f4931f92ded8b602377befb6218eb23`.

Khi sử dụng Git, thực hiện trong bản clone của kho nhóm, sau khi đã chép thư mục `Lab03` vào gốc kho:

```bash
git status
git remote -v
git add Lab03
git diff --cached --stat
git commit -m "Hoan thanh Lab03 - Tim kiem su kien va xu ly form"
git pull --rebase origin main
git push origin main
git rev-parse HEAD
```

Kiểm tra nội dung staged chỉ thuộc `Lab03/`; không force push. Nếu kho đã có thay đổi mới trong `Lab03`, đối chiếu trước khi gộp. Sau khi đẩy thành công, lấy SHA thật và nộp liên kết dạng `https://github.com/Phamhung205/PTPMMNM_CNTT_18-09_NHOM_4/tree/SHA/Lab03/Ma_nguon`. Điền thông tin thành viên trước khi nộp. Chỉ kèm Actions nếu giảng viên yêu cầu; chưa có kết quả Actions trong bộ minh chứng này. Điểm rubric do giảng viên đánh giá, gồm cả phần giải thích của sinh viên.
