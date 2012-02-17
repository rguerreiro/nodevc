action('index', function () {
    view();
});

action('index2', { default: true }, function () {
    view({ nomaster: true });
});

action('xpto', { methods: 'get' }, function () {
	view();
});

action('ajax', { methods: 'post' }, function () {
	partial('partial');
});