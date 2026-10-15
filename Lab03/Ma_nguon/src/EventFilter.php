<?php
declare(strict_types=1);

function filterEvents(array $events, string $query, string $category = '',
    bool $availableOnly = false): array
{
    $result = [];
    foreach ($events as $event) {
        $matchesQuery = $query === ''
            || stripos($event['title'], $query) !== false;
        $matchesCategory = $category === '' || $event['category'] === $category;
        $matchesAvailability = !$availableOnly
            || $event['registered'] < $event['capacity'];

        // Cả ba điều kiện phải đúng; chỉ thêm vào mảng mới, không sửa dữ liệu gốc.
        if ($matchesQuery && $matchesCategory && $matchesAvailability) {
            $result[] = $event;
        }
    }
    return $result;
}
