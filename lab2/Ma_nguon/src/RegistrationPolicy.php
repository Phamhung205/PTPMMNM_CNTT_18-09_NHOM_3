<?php
declare(strict_types=1);

final class RegistrationPolicy
{
    public function decide(int $capacity, int $registered, bool $isOpen, bool $hasWaitlist): string
    {
        if ($capacity <= 0 || $registered < 0 || $registered > $capacity) {
            return 'rejected';
        }

        if (!$isOpen) {
            return 'rejected';
        }

        if ($registered < $capacity) {
            return 'confirmed';
        }

        if ($hasWaitlist) {
            return 'waiting';
        }

        return 'rejected';
    }
}