
// 使用 _inline 参数重新指定该路径计算的相对目录
document.write('<script src="b.js?_inline=test/fixtures/path"></script>');
function init() {
    console.log('init...');
}
init();
