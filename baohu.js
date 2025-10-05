(function() {
    'use strict';
    
    // ===== 核心防护 =====
    // 1. 全局样式防护
    const protectionStyles = document.createElement('style');
    protectionStyles.textContent = `
        body.protected-mode {
            -webkit-user-select: none !important;
            -moz-user-select: none !important;
            -ms-user-select: none !important;
            user-select: none !important;
        }
        body.protected-mode * {
            -webkit-touch-callout: none !important;
            -webkit-user-drag: none !important;
        }
        body.protected-mode::selection,
        body.protected-mode *::selection {
            background: transparent !important;
            color: inherit !important;
        }
        body.protected-mode::-moz-selection,
        body.protected-mode *::-moz-selection {
            background: transparent !important;
            color: inherit !important;
        }
        .protection-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 2147483647;
            background: transparent;
            pointer-events: none;
        }
        .protection-toast {
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0,0,0,0.85);
            color: white;
            padding: 12px 24px;
            border-radius: 4px;
            z-index: 2147483647;
            font-family: system-ui, sans-serif;
            font-size: 14px;
            max-width: 80%;
            text-align: center;
            pointer-events: none;
            animation: protectionFadeIn 0.3s;
        }
        @keyframes protectionFadeIn {
            from { opacity: 0; transform: translateX(-50%) translateY(10px); }
            to { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
    `;
    document.head.appendChild(protectionStyles);
    
    // 2. 激活保护模式
    document.body.classList.add('protected-mode');
    
    // 3. 添加透明覆盖层阻止长按菜单
    const overlay = document.createElement('div');
    overlay.className = 'protection-overlay';
    document.body.appendChild(overlay);
    
    // ===== 事件防护 =====
    // 1. 阻止右键菜单
    document.addEventListener('contextmenu', function(e) {
        e.preventDefault();
        showToast('右键菜单已禁用');
    }, {capture: true});
    
    // 2. 阻止文本选择
    document.addEventListener('selectstart', function(e) {
        e.preventDefault();
    }, {capture: true});
    
    // 3. 阻止拖拽
    document.addEventListener('dragstart', function(e) {
        e.preventDefault();
    }, {capture: true});
    
    // 4. 键盘防护
    document.addEventListener('keydown', function(e) {
        // 禁用开发者工具快捷键
        const devToolsKeys = [
            {key: 'F12', keyCode: 123},
            {ctrlKey: true, shiftKey: true, key: 'I'},
            {ctrlKey: true, shiftKey: true, key: 'J'},
            {ctrlKey: true, shiftKey: true, key: 'C'},
            {metaKey: true, altKey: true, key: 'I'},
            {ctrlKey: true, key: 'U'}
        ];
        
        const isDevToolsKey = devToolsKeys.some(combo => {
            return Object.keys(combo).every(k => combo[k] === e[k]);
        });
        
        if (isDevToolsKey) {
            e.preventDefault();
            e.stopPropagation();
            showToast('开发者工具已禁用');
        }
        
        // 禁用复制/剪切快捷键
        if ((e.ctrlKey || e.metaKey) && ['c', 'x'].includes(e.key.toLowerCase())) {
            e.preventDefault();
            e.stopPropagation();
            showToast('复制操作已禁用');
        }
    }, true);
    
    // ===== 开发者工具检测 =====
    // 1. 基于调试器的检测
    function checkDevTools() {
        const start = Date.now();
        debugger;
        if (Date.now() - start > 100) {
            devToolsDetected();
        }
    }
    
    // 2. 随机间隔检测
    function startDevToolsDetection() {
        checkDevTools();
        setTimeout(startDevToolsDetection, 1000 + Math.random() * 2000);
    }
    
    // 延迟启动检测
    setTimeout(startDevToolsDetection, 3000);
    
    // ===== 防护响应 =====
    function devToolsDetected() {
        showToast('检测到开发者工具，页面即将刷新', 3000);
        setTimeout(() => {
            window.location.reload();
        }, 3000);
    }
    
    function showToast(message, duration = 2000) {
        const existing = document.querySelector('.protection-toast');
        if (existing) existing.remove();
        
        const toast = document.createElement('div');
        toast.className = 'protection-toast';
        toast.textContent = message;
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transition = 'opacity 0.3s';
            setTimeout(() => toast.remove(), 300);
        }, duration);
    }
    
    // ===== 初始保护 =====
    // 确保DOM加载完成后执行
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initProtection);
    } else {
        initProtection();
    }
    
    function initProtection() {
        // 防止通过检查元素删除保护
        setInterval(() => {
            if (!document.body.classList.contains('protected-mode')) {
                document.body.classList.add('protected-mode');
            }
            if (!document.querySelector('.protection-overlay')) {
                const newOverlay = document.createElement('div');
                newOverlay.className = 'protection-overlay';
                document.body.appendChild(newOverlay);
            }
        }, 1000);
    }
})();