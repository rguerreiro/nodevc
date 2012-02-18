action('index', function () {
    view();
});

action('index2', { default: true }, function () {
    view({ nomaster: true });
});

action('xpto', { methods: 'get' }, function () {
	view({test: 1234});
});

action('ajax', { methods: 'post' }, function () {
	partial('partial', { name : 'rodrigo' });
});

// view();
// view('index');
// view({ abc: 123 });
// view({ params: { nomaster: true } });
// view('index', { abc: 123 });
// view('index', { params: { nomaster: true } });
// view({ abc: 123 }, { nomaster: true });
// view({ params: { nomaster: true } });
// view('index', { abc: 123 }, { nomaster: true });