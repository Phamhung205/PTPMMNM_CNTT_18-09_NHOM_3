<?php
declare(strict_types=1);

function canComplete(
    array $session,
    int $requestedEventId,
    int $now,
    int $ttl
): bool {

    // TTL phải lớn hơn 0
    if ($ttl <= 0) {
        return false;
    }

    // Phải tồn tại draft và draft phải là mảng
    if (!isset($session['draft']) || !is_array($session['draft'])) {
        return false;
    }

    $draft = $session['draft'];

    // Draft phải có data và data phải là mảng
    if (!isset($draft['data']) || !is_array($draft['data'])) {
        return false;
    }

    // Phải tồn tại event_id
    if (!array_key_exists('event_id', $draft['data'])) {
        return false;
    }

    // Event trong draft phải đúng với event đang yêu cầu
    if ((int)$draft['data']['event_id'] !== $requestedEventId) {
        return false;
    }

    // Phải có created_at và phải là số nguyên
    if (!isset($draft['created_at']) || !is_int($draft['created_at'])) {
        return false;
    }

    $createdAt = $draft['created_at'];

    // Không chấp nhận draft được tạo ở thời điểm tương lai
    if ($createdAt > $now) {
        return false;
    }

    // Tính tuổi của bản nháp
    $age = $now - $createdAt;

    // Draft chỉ hợp lệ khi tuổi < TTL
    // Nếu age == ttl thì đã hết hạn
    if ($age >= $ttl) {
        return false;
    }

    // Nếu vượt qua toàn bộ kiểm tra thì hợp lệ
    return true;
}