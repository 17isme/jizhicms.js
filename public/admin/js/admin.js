/**
 * 极致CMS管理后台JavaScript
 */

$(document).ready(function() {
    // 初始化管理后台
    initAdmin();
});

/**
 * 初始化管理后台
 */
function initAdmin() {
    // 侧边栏折叠功能
    initSidebar();
    
    // 返回顶部按钮
    initBackToTop();
    
    // 表格功能
    initTables();
    
    // 表单功能
    initForms();
    
    // 通用功能
    initCommon();
    
    // 页面动画
    initAnimations();
}

/**
 * 侧边栏功能
 */
function initSidebar() {
    // 折叠/展开侧边栏
    $('#sidebarCollapse, #sidebarCollapseTop').on('click', function() {
        $('#sidebar').toggleClass('collapsed');
        
        // 保存状态到本地存储
        const isCollapsed = $('#sidebar').hasClass('collapsed');
        localStorage.setItem('sidebar-collapsed', isCollapsed);
    });
    
    // 恢复侧边栏状态
    const isCollapsed = localStorage.getItem('sidebar-collapsed') === 'true';
    if (isCollapsed) {
        $('#sidebar').addClass('collapsed');
    }
    
    // 子菜单展开/折叠
    $('.menu-item.has-submenu > .menu-link').on('click', function(e) {
        e.preventDefault();
        
        const $menuItem = $(this).parent();
        const $submenu = $menuItem.find('.submenu');
        
        // 折叠其他子菜单
        $('.menu-item.has-submenu').not($menuItem).removeClass('open');
        
        // 切换当前子菜单
        $menuItem.toggleClass('open');
    });
    
    // 设置当前激活的菜单项
    setActiveMenu();
    
    // 移动端侧边栏
    $(document).on('click', function(e) {
        if ($(window).width() <= 768) {
            if (!$(e.target).closest('#sidebar, #sidebarCollapseTop').length) {
                $('#sidebar').removeClass('show');
            }
        }
    });
    
    $('#sidebarCollapseTop').on('click', function() {
        if ($(window).width() <= 768) {
            $('#sidebar').toggleClass('show');
        }
    });
}

/**
 * 设置激活菜单
 */
function setActiveMenu() {
    const currentPath = window.location.pathname;
    
    // 清除所有激活状态
    $('.menu-link').removeClass('active');
    $('.menu-item.has-submenu').removeClass('open');
    
    // 设置主菜单激活状态
    $('.menu-link').each(function() {
        const href = $(this).attr('href');
        if (href && currentPath.indexOf(href) === 0) {
            $(this).addClass('active');
            
            // 如果是子菜单，展开父菜单
            const $parentSubmenu = $(this).closest('.submenu');
            if ($parentSubmenu.length) {
                $parentSubmenu.closest('.menu-item.has-submenu').addClass('open');
            }
        }
    });
    
    // 设置子菜单激活状态
    $('.submenu a').each(function() {
        const href = $(this).attr('href');
        if (href && currentPath.indexOf(href) === 0) {
            $(this).addClass('active');
            $(this).closest('.menu-item.has-submenu').addClass('open');
        }
    });
}

/**
 * 返回顶部按钮
 */
function initBackToTop() {
    const $backToTop = $('#backToTop');
    
    $(window).scroll(function() {
        if ($(this).scrollTop() > 300) {
            $backToTop.addClass('show');
        } else {
            $backToTop.removeClass('show');
        }
    });
    
    $backToTop.on('click', function() {
        $('html, body').animate({
            scrollTop: 0
        }, 300);
    });
}

/**
 * 表格功能
 */
function initTables() {
    // 全选功能
    $(document).on('change', '.select-all', function() {
        const isChecked = $(this).prop('checked');
        $(this).closest('table').find('.select-item').prop('checked', isChecked);
        updateBatchActions();
    });
    
    // 单选功能
    $(document).on('change', '.select-item', function() {
        const $table = $(this).closest('table');
        const $selectAll = $table.find('.select-all');
        const totalItems = $table.find('.select-item').length;
        const checkedItems = $table.find('.select-item:checked').length;
        
        $selectAll.prop('checked', totalItems === checkedItems);
        updateBatchActions();
    });
    
    // 批量操作按钮状态
    function updateBatchActions() {
        const checkedItems = $('.select-item:checked').length;
        $('.batch-actions').toggle(checkedItems > 0);
        $('.selected-count').text(checkedItems);
    }
}

/**
 * 表单功能
 */
function initForms() {
    // 表单验证
    $('form[data-validate="true"]').on('submit', function(e) {
        if (!validateForm(this)) {
            e.preventDefault();
            return false;
        }
    });
    
    // 自动保存功能
    $('form[data-autosave="true"]').find('input, textarea, select').on('change', function() {
        autoSaveForm($(this).closest('form'));
    });
    
    // 图片预览
    $(document).on('change', 'input[type="file"][data-preview]', function() {
        previewImage(this);
    });
}

/**
 * 表单验证
 */
function validateForm(form) {
    let isValid = true;
    
    $(form).find('[required]').each(function() {
        const $field = $(this);
        const value = $field.val().trim();
        
        if (!value) {
            showFieldError($field, '此字段为必填项');
            isValid = false;
        } else {
            clearFieldError($field);
        }
    });
    
    return isValid;
}

/**
 * 显示字段错误
 */
function showFieldError($field, message) {
    $field.addClass('is-invalid');
    
    let $feedback = $field.siblings('.invalid-feedback');
    if (!$feedback.length) {
        $feedback = $('<div class="invalid-feedback"></div>');
        $field.after($feedback);
    }
    
    $feedback.text(message);
}

/**
 * 清除字段错误
 */
function clearFieldError($field) {
    $field.removeClass('is-invalid');
    $field.siblings('.invalid-feedback').remove();
}

/**
 * 图片预览
 */
function previewImage(input) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            const previewId = $(input).data('preview');
            $('#' + previewId).attr('src', e.target.result).show();
        };
        
        reader.readAsDataURL(input.files[0]);
    }
}

/**
 * 通用功能
 */
function initCommon() {
    // 确认删除
    $(document).on('click', '[data-confirm]', function(e) {
        e.preventDefault();
        
        const message = $(this).data('confirm') || '确定要执行此操作吗？';
        
        if (confirm(message)) {
            const href = $(this).attr('href');
            if (href) {
                window.location.href = href;
            } else {
                $(this).closest('form').submit();
            }
        }
    });
    
    // Ajax表单提交
    $(document).on('submit', 'form[data-ajax="true"]', function(e) {
        e.preventDefault();
        submitAjaxForm($(this));
    });
    
    // 搜索功能
    $(document).on('input', '.search-input', debounce(function() {
        performSearch($(this).val());
    }, 300));
    
    // 工具提示
    $('[data-bs-toggle="tooltip"]').tooltip();
    
    // 弹出框
    $('[data-bs-toggle="popover"]').popover();
}

/**
 * Ajax表单提交
 */
function submitAjaxForm($form) {
    const url = $form.attr('action') || window.location.href;
    const method = $form.attr('method') || 'POST';
    const data = new FormData($form[0]);
    
    showLoading();
    
    $.ajax({
        url: url,
        method: method,
        data: data,
        processData: false,
        contentType: false,
        success: function(response) {
            hideLoading();
            handleAjaxResponse(response);
        },
        error: function(xhr) {
            hideLoading();
            showError('操作失败，请稍后重试');
        }
    });
}

/**
 * 处理Ajax响应
 */
function handleAjaxResponse(response) {
    if (response.code === 0) {
        showSuccess(response.msg || '操作成功');
        
        // 如果有重定向URL，延迟跳转
        if (response.redirect) {
            setTimeout(() => {
                window.location.href = response.redirect;
            }, 1500);
        } else {
            // 刷新页面
            setTimeout(() => {
                window.location.reload();
            }, 1500);
        }
    } else {
        showError(response.msg || '操作失败');
    }
}

/**
 * 显示加载状态
 */
function showLoading(text = '处理中...') {
    $('#loading .loading-text').text(text);
    $('#loading').show();
}

/**
 * 隐藏加载状态
 */
function hideLoading() {
    $('#loading').hide();
}

/**
 * 显示成功消息
 */
function showSuccess(message) {
    showToast(message, 'success');
}

/**
 * 显示错误消息
 */
function showError(message) {
    showToast(message, 'error');
}

/**
 * 显示提示消息
 */
function showToast(message, type = 'info') {
    // 创建Toast元素
    const toastId = 'toast-' + Date.now();
    const bgClass = type === 'success' ? 'bg-success' : (type === 'error' ? 'bg-danger' : 'bg-info');
    
    const toastHtml = `
        <div id="${toastId}" class="toast align-items-center text-white ${bgClass} border-0" role="alert">
            <div class="d-flex">
                <div class="toast-body">
                    ${message}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
            </div>
        </div>
    `;
    
    // 添加到页面
    let $container = $('#toast-container');
    if (!$container.length) {
        $container = $('<div id="toast-container" class="toast-container position-fixed top-0 end-0 p-3" style="z-index: 9999;"></div>');
        $('body').append($container);
    }
    
    $container.append(toastHtml);
    
    // 显示Toast
    const toast = new bootstrap.Toast(document.getElementById(toastId));
    toast.show();
    
    // 自动移除
    $('#' + toastId).on('hidden.bs.toast', function() {
        $(this).remove();
    });
}

/**
 * 防抖函数
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * 搜索功能
 */
function performSearch(keyword) {
    if (keyword.length >= 2 || keyword.length === 0) {
        const url = new URL(window.location);
        if (keyword) {
            url.searchParams.set('keyword', keyword);
        } else {
            url.searchParams.delete('keyword');
        }
        url.searchParams.set('page', '1');
        window.location.href = url.toString();
    }
}

/**
 * 页面动画
 */
function initAnimations() {
    // 为页面元素添加淡入动画
    $('.card, .stats-card').addClass('fade-in');
    
    // 滚动动画
    $(window).scroll(function() {
        $('.fade-in').each(function() {
            const elementTop = $(this).offset().top;
            const elementBottom = elementTop + $(this).outerHeight();
            const viewportTop = $(window).scrollTop();
            const viewportBottom = viewportTop + $(window).height();
            
            if (elementBottom > viewportTop && elementTop < viewportBottom) {
                $(this).addClass('animated');
            }
        });
    });
}

/**
 * 批量删除
 */
function batchDelete(url) {
    const selectedIds = [];
    $('.select-item:checked').each(function() {
        selectedIds.push($(this).val());
    });
    
    if (selectedIds.length === 0) {
        showError('请选择要删除的项目');
        return;
    }
    
    if (!confirm(`确定要删除选中的 ${selectedIds.length} 项吗？`)) {
        return;
    }
    
    showLoading('删除中...');
    
    $.ajax({
        url: url,
        method: 'POST',
        data: {
            ids: selectedIds
        },
        success: function(response) {
            hideLoading();
            handleAjaxResponse(response);
        },
        error: function() {
            hideLoading();
            showError('删除失败，请稍后重试');
        }
    });
}

/**
 * 切换状态
 */
function toggleStatus(url, id, currentStatus) {
    const newStatus = currentStatus ? 0 : 1;
    const statusText = newStatus ? '启用' : '禁用';
    
    if (!confirm(`确定要${statusText}该项吗？`)) {
        return;
    }
    
    $.ajax({
        url: url,
        method: 'POST',
        data: {
            id: id,
            status: newStatus
        },
        success: function(response) {
            handleAjaxResponse(response);
        },
        error: function() {
            showError('操作失败，请稍后重试');
        }
    });
}

/**
 * 上传文件
 */
function uploadFile(file, callback) {
    const formData = new FormData();
    formData.append('file', file);
    
    showLoading('上传中...');
    
    $.ajax({
        url: '/admin/upload',
        method: 'POST',
        data: formData,
        processData: false,
        contentType: false,
        success: function(response) {
            hideLoading();
            if (response.code === 0) {
                if (typeof callback === 'function') {
                    callback(response.data);
                }
                showSuccess('上传成功');
            } else {
                showError(response.msg || '上传失败');
            }
        },
        error: function() {
            hideLoading();
            showError('上传失败，请稍后重试');
        }
    });
}

/**
 * 格式化文件大小
 */
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * 格式化时间
 */
function formatTime(timestamp) {
    const date = new Date(timestamp * 1000);
    return date.getFullYear() + '-' + 
           String(date.getMonth() + 1).padStart(2, '0') + '-' + 
           String(date.getDate()).padStart(2, '0') + ' ' + 
           String(date.getHours()).padStart(2, '0') + ':' + 
           String(date.getMinutes()).padStart(2, '0') + ':' + 
           String(date.getSeconds()).padStart(2, '0');
}

// 全局暴露一些常用函数
window.admin = {
    showLoading,
    hideLoading,
    showSuccess,
    showError,
    showToast,
    batchDelete,
    toggleStatus,
    uploadFile,
    formatFileSize,
    formatTime
};