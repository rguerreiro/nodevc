action('index', function () {
    view();
});

action('index2', function () {
    view({ nomaster: true });
});