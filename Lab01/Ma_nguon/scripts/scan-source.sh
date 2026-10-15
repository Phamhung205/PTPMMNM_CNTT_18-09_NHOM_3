#!/usr/bin/env bash
set -uo pipefail

# Khung duyệt tệp đã được GV cấp; điền các TODO về điều kiện, đếm và mã thoát.

# Kiểm tra số lượng tham số.
# Script yêu cầu đúng 1 tham số là thư mục cần quét.
if [[ $# -ne 1 ]]; then
    echo 'Usage: scan-source.sh DIRECTORY' >&2
    exit 2
fi

# Lấy thư mục cần quét từ tham số thứ nhất.
root="$1"

# TODO 1:
# Kiểm tra thư mục có tồn tại và có quyền đọc hay không.
# Nếu không tồn tại hoặc không đọc được thì thoát với mã 2.
if [[ ! -d "$root" || ! -r "$root" ]]; then
    echo "ERROR: directory not found or not readable: $root" >&2
    exit 2
fi

# Kiểm tra PHP đã được cài đặt hay chưa.
# Nếu không tìm thấy PHP thì thoát với mã 2.
if ! command -v php >/dev/null 2>&1; then
    echo "ERROR: php not found" >&2
    exit 2
fi

# Tạo một file tạm để lưu danh sách các file PHP tìm được.
list="$(mktemp)" || exit 2

# Khi script kết thúc thì tự động xóa file tạm.
trap 'rm -f -- "$list"' EXIT

# Tìm tất cả file có đuôi .php trong thư mục và các thư mục con.
# -print0 giúp xử lý an toàn tên file có khoảng trắng.
if ! find "$root" -type f -name '*.php' -print0 > "$list"; then
    exit 2
fi

# Khởi tạo các biến đếm.
total=0
passed=0
failed=0

# Đọc lần lượt từng file PHP tìm được.
while IFS= read -r -d '' file; do

    # TODO 2:
    # Mỗi file tìm được thì tăng tổng số file lên 1.
    total=$((total + 1))

    # Kiểm tra cú pháp PHP bằng php -l.
    if php -l "$file"; then

        # Nếu cú pháp đúng thì tăng số file đạt.
        passed=$((passed + 1))

    else

        # Nếu cú pháp sai thì tăng số file lỗi.
        failed=$((failed + 1))

    fi

# Đọc danh sách file từ file tạm.
done < "$list"

# In kết quả tổng hợp.
printf 'TOTAL=%s PASS=%s FAIL=%s\n' "$total" "$passed" "$failed"

# TODO 3:
# Nếu không tìm thấy file PHP nào thì trả mã thoát 2.
if [[ "$total" -eq 0 ]]; then
    exit 2
fi

# Nếu có ít nhất một file PHP lỗi thì trả mã thoát 1.
if [[ "$failed" -gt 0 ]]; then
    exit 1
fi

# Nếu tất cả file PHP đều hợp lệ thì trả mã thoát 0.
exit 0