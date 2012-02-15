action('index', function () {
    view();
});

action('index2', { default: true }, function () {
    view({ nomaster: true });
});