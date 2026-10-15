<?php
// Kiểm thử bổ sung; giữ nguyên các bộ run.php, extension.php, ui-demo.php của đề.
require __DIR__ . '/helper.php';
require __DIR__ . '/../src/Input.php';
require __DIR__ . '/../src/EventFilter.php';
$events = require __DIR__ . '/../data/events.php';
$original = $events;

same(array_column(filterEvents($events, 'pHp'), 'id'), [1], 'keyword-at-position-zero');
same(filterEvents([], '', '', true), [], 'empty-source');
same(filterEvents($events, 'PHP', 'design', false), [], 'keyword-and-category');
same(filterEvents($events, 'Design', '', true), [], 'keyword-and-availability');
$overbooked = [['id'=>4, 'title'=>'Overbooked', 'category'=>'tech', 'capacity'=>1, 'registered'=>2]];
same(filterEvents($overbooked, '', '', true), [], 'over-capacity-is-unavailable');
same($events, $original, 'entire-source-unchanged');
same(field(['q'=>'  php  '], 'q'), 'php', 'trim-keyword');
same(field(['category'=>['tech']], 'category'), '', 'array-category');
same(field(['available'=>['1']], 'available'), '', 'array-availability');

$valid = ['event_id'=>'3', 'name'=>" O'Neil ", 'email'=>' DEMO@EXAMPLE.TEST '];
$result = validateRegistration($valid, $events);
same($result['data'], ['event_id'=>3, 'name'=>"O'Neil", 'email'=>'demo@example.test'], 'normalize-form');
same(validateRegistration(array_replace($valid, ['name'=>str_repeat('a', 120)]), $events)['errors'], [], 'name-120-bytes');
same(validateRegistration(array_replace($valid, ['name'=>str_repeat('a', 121)]), $events)['errors'], ['NAME_INVALID'], 'name-121-bytes');
same(validateRegistration(array_replace($valid, ['name'=>"De\0mo"]), $events)['errors'], ['NAME_INVALID'], 'name-null-byte');
same(validateRegistration(['event_id'=>['1'], 'name'=>['Demo'], 'email'=>['demo@example.test']], $events)['errors'], ['EVENT_INVALID', 'NAME_INVALID', 'EMAIL_INVALID'], 'array-form-fields');
same(e("<b>O'Neil & Demo</b>"), '&lt;b&gt;O&#039;Neil &amp; Demo&lt;/b&gt;', 'escape-tags-quotes-ampersand');
finish();
