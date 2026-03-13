// 监听滚动事件
let lastScrollTop = 0;
const topbar = document.getElementById('topbar-wrapper');

window.addEventListener('scroll', () => {
    let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    if (scrollTop > lastScrollTop) {
        // 向下滚动，隐藏顶部栏
        topbar.style.transform = 'translateY(-100%)';
        topbar.style.transition = 'transform 0.3s ease-in-out';
    } else {
        // 向上滚动，显示顶部栏
        topbar.style.transform = 'translateY(0)';
    }
    lastScrollTop = scrollTop;
}, false);
