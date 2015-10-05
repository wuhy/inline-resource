/**
 * @file js file
 */

(function () {

    var name = 'jack';
    var country = 'USA';

    console.log('Hello %s, country: %s', name, country);

    var arr = [1, 2, 10];
    var sum = 0;
    for (var i = 0, len = arr.length; i < len; i ++) {
        sum += arr[i];
    };
})();

