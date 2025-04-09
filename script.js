document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const passwordOutput = document.getElementById('password-output');
    const generateBtn = document.getElementById('generate-password');
    const copyBtn = document.getElementById('copy-password');
    const copyBtnAlt = document.getElementById('copy-password-alt');
    const copyNotification = document.getElementById('copy-notification');
    const lengthSlider = document.getElementById('password-length');
    const lengthValue = document.getElementById('length-value');
    
    // 新功能相关的DOM元素
    const saveConfigBtn = document.getElementById('save-config');
    const saveNotification = document.getElementById('save-notification');
    const passwordHistoryList = document.getElementById('password-history-list');
    const clearHistoryBtn = document.getElementById('clear-history');
    const strengthSegments = [
        document.getElementById('segment-1'),
        document.getElementById('segment-2'),
        document.getElementById('segment-3'),
        document.getElementById('segment-4')
    ];
    const strengthText = document.getElementById('strength-text');
    
    // Password Type Radio Buttons
    const easyToSay = document.getElementById('easy-to-say');
    const easyToRead = document.getElementById('easy-to-read');
    const allCharacters = document.getElementById('all-characters');
    
    // Character Checkboxes
    const uppercaseCheck = document.getElementById('uppercase');
    const lowercaseCheck = document.getElementById('lowercase');
    const numbersCheck = document.getElementById('numbers');
    const symbolsCheck = document.getElementById('symbols');
    
    // Mobile Menu Toggle
    const menuToggle = document.querySelector('.menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    const navButtons = document.querySelector('.nav-buttons');
    
    // FAQ Toggles
    const faqItems = document.querySelectorAll('.faq-item');
    
    // Helper variables for password generation
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*()_-+={}[]|:;<>,.?/~';
    
    // Ambiguous characters to avoid for "easy to read" option
    const ambiguousChars = 'l1IO0';
    
    // 历史密码数组
    let passwordHistory = [];
    // 加载保存的历史密码
    loadPasswordHistory();
    // 加载保存的配置
    loadSavedConfig();
    
    // Initialize the password on page load
    generatePassword();
    
    // Event Listeners
    generateBtn.addEventListener('click', generatePassword);
    copyBtn.addEventListener('click', copyPassword);
    copyBtnAlt.addEventListener('click', copyPassword);
    
    lengthSlider.addEventListener('input', function() {
        lengthValue.textContent = this.value;
        generatePassword();
    });
    
    // Add event listeners to all password options
    easyToSay.addEventListener('change', updateCheckboxesState);
    easyToRead.addEventListener('change', updateCheckboxesState);
    allCharacters.addEventListener('change', updateCheckboxesState);
    
    uppercaseCheck.addEventListener('change', generatePassword);
    lowercaseCheck.addEventListener('change', checkboxValidation);
    numbersCheck.addEventListener('change', generatePassword);
    symbolsCheck.addEventListener('change', generatePassword);
    
    // 新增事件监听器
    saveConfigBtn.addEventListener('click', saveConfiguration);
    clearHistoryBtn.addEventListener('click', clearPasswordHistory);
    
    // Mobile menu toggle
    menuToggle.addEventListener('click', function() {
        navMenu.classList.toggle('active');
        navButtons.classList.toggle('active');
    });
    
    // FAQ accordion functionality
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        question.addEventListener('click', () => {
            item.classList.toggle('active');
        });
    });
    
    // 付费功能相关的DOM元素
    const upgradePremiumBtn = document.getElementById('upgrade-premium');
    const upgradeFamilyBtn = document.getElementById('upgrade-family');
    const joinPremiumWaitlist = document.getElementById('join-premium-waitlist');
    const joinFamilyWaitlist = document.getElementById('join-family-waitlist');
    
    // 付费升级按钮事件监听改为等待名单功能
    if (joinPremiumWaitlist) {
        joinPremiumWaitlist.addEventListener('click', function(e) {
            e.preventDefault();
            showWaitlistModal('premium');
        });
    }
    
    if (joinFamilyWaitlist) {
        joinFamilyWaitlist.addEventListener('click', function(e) {
            e.preventDefault();
            showWaitlistModal('family');
        });
    }
    
    // Functions
    function generatePassword() {
        let charset = '';
        let password = '';
        const length = lengthSlider.value;
        
        // Get the character set based on selected options
        if (easyToSay.checked) {
            if (uppercaseCheck.checked) charset += uppercase;
            if (lowercaseCheck.checked) charset += lowercase;
            // No numbers or symbols for "easy to say"
        } 
        else if (easyToRead.checked) {
            let tempCharset = '';
            if (uppercaseCheck.checked) tempCharset += uppercase;
            if (lowercaseCheck.checked) tempCharset += lowercase;
            if (numbersCheck.checked) tempCharset += numbers;
            if (symbolsCheck.checked) tempCharset += symbols;
            
            // Remove ambiguous characters
            for (let char of tempCharset) {
                if (!ambiguousChars.includes(char)) {
                    charset += char;
                }
            }
        } 
        else { // All characters
            if (uppercaseCheck.checked) charset += uppercase;
            if (lowercaseCheck.checked) charset += lowercase;
            if (numbersCheck.checked) charset += numbers;
            if (symbolsCheck.checked) charset += symbols;
        }
        
        // Ensure we have at least some characters to choose from
        if (charset.length === 0) {
            lowercaseCheck.checked = true;
            charset = lowercase;
        }
        
        // Generate random password
        for (let i = 0; i < length; i++) {
            const randomIndex = Math.floor(Math.random() * charset.length);
            password += charset[randomIndex];
        }
        
        passwordOutput.value = password;
        
        // 评估密码强度并更新UI
        evaluatePasswordStrength(password);
    }
    
    function copyPassword() {
        passwordOutput.select();
        document.execCommand('copy');
        
        // Show the "Copied" notification
        copyNotification.style.display = 'block';
        
        // Hide it after 2 seconds
        setTimeout(() => {
            copyNotification.style.display = 'none';
        }, 2000);
        
        // 添加到历史记录
        addToHistory(passwordOutput.value);
    }
    
    function updateCheckboxesState() {
        // If "Easy to say" is selected, disable numbers and symbols
        if (easyToSay.checked) {
            numbersCheck.checked = false;
            symbolsCheck.checked = false;
            numbersCheck.disabled = true;
            symbolsCheck.disabled = true;
        } else {
            numbersCheck.disabled = false;
            symbolsCheck.disabled = false;
        }
        
        generatePassword();
    }
    
    function checkboxValidation() {
        // Ensure at least one checkbox is selected
        if (!uppercaseCheck.checked && !lowercaseCheck.checked && 
            !numbersCheck.checked && !symbolsCheck.checked) {
            // If no checkboxes are selected, revert to lowercase
            lowercaseCheck.checked = true;
        }
        
        generatePassword();
    }
    
    // 评估密码强度
    function evaluatePasswordStrength(password) {
        // 重置所有段的样式
        strengthSegments.forEach(segment => {
            segment.className = 'strength-segment';
        });
        strengthText.className = 'strength-text';
        
        // 检查密码长度、字符类型多样性等
        const length = password.length;
        const hasUpper = /[A-Z]/.test(password);
        const hasLower = /[a-z]/.test(password);
        const hasNumber = /[0-9]/.test(password);
        const hasSymbol = /[^A-Za-z0-9]/.test(password);
        
        // 计算已使用的字符类型数量
        const charTypesCount = [hasUpper, hasLower, hasNumber, hasSymbol].filter(Boolean).length;
        
        // 确定密码强度
        let strength = 0;
        if (length > 7) strength++; // 长度 >= 8
        if (length > 11) strength++; // 长度 >= 12
        if (charTypesCount > 1) strength++; // 使用超过一种字符类型
        if (charTypesCount > 2) strength++; // 使用超过两种字符类型
        
        // 根据强度更新UI
        let strengthClass = '';
        let strengthLabel = '';
        
        switch(strength) {
            case 0:
                strengthClass = 'very-weak';
                strengthLabel = 'Very Weak';
                strengthSegments[0].classList.add('very-weak');
                break;
            case 1:
                strengthClass = 'weak';
                strengthLabel = 'Weak';
                strengthSegments[0].classList.add('weak');
                strengthSegments[1].classList.add('weak');
                break;
            case 2:
                strengthClass = 'medium';
                strengthLabel = 'Medium';
                strengthSegments[0].classList.add('medium');
                strengthSegments[1].classList.add('medium');
                strengthSegments[2].classList.add('medium');
                break;
            case 3:
                strengthClass = 'strong';
                strengthLabel = 'Strong';
                strengthSegments[0].classList.add('strong');
                strengthSegments[1].classList.add('strong');
                strengthSegments[2].classList.add('strong');
                strengthSegments[3].classList.add('strong');
                break;
            case 4:
                strengthClass = 'very-strong';
                strengthLabel = 'Very Strong';
                strengthSegments.forEach(segment => {
                    segment.classList.add('very-strong');
                });
                break;
        }
        
        strengthText.textContent = strengthLabel;
        strengthText.classList.add(strengthClass);
    }
    
    // 添加密码到历史记录
    function addToHistory(password) {
        // 避免重复添加相同的密码
        if (passwordHistory.includes(password)) return;
        
        // 将新密码添加到数组的前端（最新的先显示）
        passwordHistory.unshift(password);
        
        // 限制历史记录长度为10
        if (passwordHistory.length > 10) {
            passwordHistory.pop();
        }
        
        // 保存到本地存储
        localStorage.setItem('passwordHistory', JSON.stringify(passwordHistory));
        
        // 更新历史记录UI
        updatePasswordHistoryUI();
    }
    
    // 更新历史记录UI
    function updatePasswordHistoryUI() {
        // 清空当前历史列表
        passwordHistoryList.innerHTML = '';
        
        // 如果没有历史记录，显示空消息
        if (passwordHistory.length === 0) {
            const emptyMessage = document.createElement('p');
            emptyMessage.className = 'history-empty';
            emptyMessage.textContent = 'No passwords in history yet.';
            passwordHistoryList.appendChild(emptyMessage);
            return;
        }
        
        // 添加每个历史密码
        passwordHistory.forEach((password, index) => {
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';
            
            const passwordSpan = document.createElement('span');
            passwordSpan.className = 'history-password';
            passwordSpan.textContent = password;
            
            const actionsDiv = document.createElement('div');
            actionsDiv.className = 'history-actions';
            
            const copyButton = document.createElement('button');
            copyButton.className = 'history-copy';
            copyButton.innerHTML = '<i class="fas fa-copy"></i>';
            copyButton.title = 'Copy to clipboard';
            copyButton.addEventListener('click', () => {
                navigator.clipboard.writeText(password).then(() => {
                    // 显示复制成功提示
                    copyNotification.style.display = 'block';
                    setTimeout(() => {
                        copyNotification.style.display = 'none';
                    }, 2000);
                });
            });
            
            const deleteButton = document.createElement('button');
            deleteButton.className = 'history-delete';
            deleteButton.innerHTML = '<i class="fas fa-trash"></i>';
            deleteButton.title = 'Delete from history';
            deleteButton.addEventListener('click', () => {
                passwordHistory.splice(index, 1);
                localStorage.setItem('passwordHistory', JSON.stringify(passwordHistory));
                updatePasswordHistoryUI();
            });
            
            actionsDiv.appendChild(copyButton);
            actionsDiv.appendChild(deleteButton);
            
            historyItem.appendChild(passwordSpan);
            historyItem.appendChild(actionsDiv);
            
            passwordHistoryList.appendChild(historyItem);
        });
    }
    
    // 清除历史记录
    function clearPasswordHistory() {
        passwordHistory = [];
        localStorage.removeItem('passwordHistory');
        updatePasswordHistoryUI();
    }
    
    // 加载历史记录
    function loadPasswordHistory() {
        const savedHistory = localStorage.getItem('passwordHistory');
        if (savedHistory) {
            passwordHistory = JSON.parse(savedHistory);
            updatePasswordHistoryUI();
        }
    }
    
    // 保存当前配置
    function saveConfiguration() {
        const config = {
            length: lengthSlider.value,
            passwordType: easyToSay.checked ? 'easy-to-say' : (easyToRead.checked ? 'easy-to-read' : 'all-characters'),
            uppercase: uppercaseCheck.checked,
            lowercase: lowercaseCheck.checked,
            numbers: numbersCheck.checked,
            symbols: symbolsCheck.checked
        };
        
        localStorage.setItem('passwordConfig', JSON.stringify(config));
        
        // 显示保存成功提示
        saveNotification.style.display = 'block';
        setTimeout(() => {
            saveNotification.style.display = 'none';
        }, 2000);
    }
    
    // 加载保存的配置
    function loadSavedConfig() {
        const savedConfig = localStorage.getItem('passwordConfig');
        if (savedConfig) {
            const config = JSON.parse(savedConfig);
            
            // 应用配置
            lengthSlider.value = config.length;
            lengthValue.textContent = config.length;
            
            switch(config.passwordType) {
                case 'easy-to-say':
                    easyToSay.checked = true;
                    break;
                case 'easy-to-read':
                    easyToRead.checked = true;
                    break;
                case 'all-characters':
                    allCharacters.checked = true;
                    break;
            }
            
            uppercaseCheck.checked = config.uppercase;
            lowercaseCheck.checked = config.lowercase;
            numbersCheck.checked = config.numbers;
            symbolsCheck.checked = config.symbols;
            
            // 更新禁用状态
            updateCheckboxesState();
        }
    }
    
    // 显示等待名单模态框
    function showWaitlistModal(plan) {
        // 创建模态框
        const modal = document.createElement('div');
        modal.className = 'upgrade-modal';
        
        const planTitle = plan === 'premium' ? 'Premium Plan' : 'Family Plan';
        
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close-modal">&times;</span>
                <h2>Join ${planTitle} Waitlist</h2>
                <p>Be the first to know when our ${planTitle} becomes available. We'll notify you as soon as it's ready!</p>
                
                <form id="waitlist-form">
                    <div class="form-group">
                        <label for="waitlist-name">Your Name</label>
                        <input type="text" id="waitlist-name" placeholder="John Doe" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="waitlist-email">Email Address</label>
                        <input type="email" id="waitlist-email" placeholder="john@example.com" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="waitlist-reason">What features are you most interested in?</label>
                        <textarea id="waitlist-reason" rows="3" placeholder="Tell us which features you're most excited about..."></textarea>
                    </div>
                    
                    <button type="submit" class="waitlist-btn">Join Waitlist</button>
                </form>
                
                <div class="privacy-note">
                    <i class="fas fa-shield-alt"></i> We respect your privacy and will never share your information.
                </div>
            </div>
        `;
        
        // 添加到DOM
        document.body.appendChild(modal);
        
        // 阻止滚动
        document.body.style.overflow = 'hidden';
        
        // 关闭按钮
        const closeBtn = modal.querySelector('.close-modal');
        closeBtn.addEventListener('click', function() {
            document.body.removeChild(modal);
            document.body.style.overflow = '';
        });
        
        // 表单提交
        const form = modal.querySelector('#waitlist-form');
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // 获取用户输入的值
            const name = document.getElementById('waitlist-name').value;
            const email = document.getElementById('waitlist-email').value;
            
            // 模拟保存等待名单数据
            console.log('添加到等待名单:', {
                plan: plan,
                name: name,
                email: email,
                reason: document.getElementById('waitlist-reason').value
            });
            
            // 更新模态框内容为感谢消息
            modal.querySelector('.modal-content').innerHTML = `
                <div class="success-message">
                    <i class="fas fa-check-circle"></i>
                    <h2>You're on the list!</h2>
                    <p>Thanks for joining our waitlist, ${name}!</p>
                    <p>We'll email you at ${email} when ${planTitle} is available.</p>
                    <button class="close-success">Close</button>
                </div>
            `;
            
            // 关闭成功消息
            modal.querySelector('.close-success').addEventListener('click', function() {
                document.body.removeChild(modal);
                document.body.style.overflow = '';
            });
        });
    }
}); 