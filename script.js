let currentStep = 0;
let score = 0;
let firstNumber = 0;
let secondNumber = 0;
let carryValue = 0;
let birlerToplam = 0;

function createFlyingNumber(number, startX, startY, targetX, targetY) {
    // Uçan sayı elementini oluştur
    const flyingNumber = document.createElement('div');
    flyingNumber.className = 'flying-number';
    flyingNumber.textContent = number;
    flyingNumber.style.left = `${startX}px`;
    flyingNumber.style.top = `${startY}px`;
    
    // CSS değişkenlerini ayarla
    flyingNumber.style.setProperty('--targetX', `${targetX}px`);
    flyingNumber.style.setProperty('--targetY', `${targetY}px`);
    
    // Elementi sayfaya ekle
    document.body.appendChild(flyingNumber);
    
    // Animasyon bitince elementi kaldır
    setTimeout(() => {
        document.body.removeChild(flyingNumber);
    }, 1000);
}

function getElementPosition(element) {
    const rect = element.getBoundingClientRect();
    return {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2
    };
}

function newQuestion() {
    // Her zaman eldeli ve toplamı 100'den küçük olan sayılar üret
    do {
        firstNumber = Math.floor(Math.random() * 90) + 10;
        secondNumber = Math.floor(Math.random() * 90) + 10;
    } while (
        firstNumber + secondNumber >= 100 || 
        (firstNumber % 10 + secondNumber % 10) < 10
    );
    
    document.getElementById('num1tens').textContent = Math.floor(firstNumber / 10);
    document.getElementById('num1ones').textContent = firstNumber % 10;
    document.getElementById('num2tens').textContent = Math.floor(secondNumber / 10);
    document.getElementById('num2ones').textContent = secondNumber % 10;
    
    document.getElementById('answerOnes').querySelector('input').value = '';
    document.getElementById('answerTens').querySelector('input').value = '';
    document.getElementById('carryDisplay').classList.add('hidden');
    document.getElementById('carryDisplay').innerHTML = '';
    
    const sumInput = document.getElementById('sumInput');
    sumInput.value = '';
    sumInput.disabled = false;
    sumInput.style.display = 'inline-block';
    
    document.getElementById('questionArea').classList.remove('hidden');
    document.getElementById('newQuestion').classList.add('hidden');
    document.getElementById('carryButtons').classList.add('hidden');
    
    currentStep = 1;
    updateStepIndicator();
    
    // Input'a otomatik fokus
    setTimeout(() => {
        sumInput.focus();
    }, 100);
}

function checkOnesDigit() {
    const sumInput = document.getElementById('sumInput');
    const inputValue = parseInt(sumInput.value);
    const ones1 = firstNumber % 10;
    const ones2 = secondNumber % 10;
    const total = ones1 + ones2;
    
    if (inputValue === total) {
        const result = total % 10;
        
        // Animasyon için başlangıç pozisyonunu al
        const sumInputPos = getElementPosition(sumInput);
        const answerOnesInput = document.getElementById('answerOnes').querySelector('input');
        const targetPos = getElementPosition(answerOnesInput);
        
        // Uçan sayı animasyonunu başlat
        createFlyingNumber(result, sumInputPos.x, sumInputPos.y, targetPos.x - sumInputPos.x, targetPos.y - sumInputPos.y);
        
        // Kısa bir gecikme sonra hedef kutuya sayıyı yaz
        setTimeout(() => {
            answerOnesInput.value = result;
            answerOnesInput.className = 'w-full h-full text-center bg-transparent number-write-animation';
        }, 500);
        
        birlerToplam = total;
        carryValue = Math.floor(total / 10);
        currentStep = 2;
        showCarryCheck();

        if (carryValue === 1) {
            const carryDisplay = document.getElementById('carryDisplay');
            carryDisplay.innerHTML = '';
            setTimeout(() => {
                carryDisplay.innerHTML = `
                    <div class="carry-text">Elde var!</div>
                    <div class="carry-animation">1</div>
                `;
                carryDisplay.classList.remove('hidden');
            }, 1000);
        }

        showMessage('Doğru! Şimdi elde var mı kontrol edelim.', 'success');
        sumInput.disabled = true;
        
        // Animasyonu sıfırla
        setTimeout(() => {
            answerOnesInput.className = 'w-full h-full text-center bg-transparent';
        }, 1500);
        
    } else if (!isNaN(inputValue)) {
        showMessage(`Tekrar dene! ${ones1} + ${ones2} = ?`, 'error');
        shake(document.getElementById('sumInput'));
    }
    updateStepIndicator();
}

function checkCarry(answer) {
    if (answer === carryValue) {
        currentStep = 3;
        document.getElementById('carryButtons').classList.add('hidden');
        showMessage('Doğru! Şimdi onlar basamağını toplayalım.', 'success');
    } else {
        showMessage('Tekrar düşün! Birler basamağı toplamı 10 veya üzerinde mi?', 'error');
    }
    updateStepIndicator();
}

function updateStepIndicator() {
    const indicator = document.getElementById('stepIndicator');
    const operationText = document.getElementById('operationText');
    const sumInput = document.getElementById('sumInput');

    if (currentStep === 1) {
        indicator.textContent = 'Birler Basamağını Topla';
        operationText.textContent = `${firstNumber % 10} + ${secondNumber % 10} =`;
        sumInput.value = '';
        sumInput.disabled = false;
        sumInput.style.display = 'inline-block';
    } else if (currentStep === 2) {
        indicator.textContent = 'Elde Var Mı?';
        operationText.textContent = `${firstNumber % 10} + ${secondNumber % 10} = ${birlerToplam}`;
        sumInput.style.display = 'none';
    } else if (currentStep === 3) {
        indicator.textContent = 'Onlar Basamağını Topla';
        const onlar1 = Math.floor(firstNumber / 10);
        const onlar2 = Math.floor(secondNumber / 10);
        operationText.textContent = `${onlar1} + ${onlar2} ${carryValue ? '+ 1 (elde)' : ''}`;
        sumInput.style.display = 'none';
        
        // Onlar basamağını elle girmek için input'u göster ve değerlerini ayarla
        const ansTensInput = document.getElementById('answerTens').querySelector('input');
        ansTensInput.readOnly = false;
        ansTensInput.value = '';
        
        // Enter tuşu için event listener ekle
        ansTensInput.onkeyup = function(e) {
            if (e.key === 'Enter' || this.value.length === 1) {
                const correctTens = onlar1 + onlar2 + carryValue;
                if (parseInt(this.value) === correctTens) {
                    // Animasyonla sayıyı yaz
                    this.className = 'w-full h-full text-center bg-transparent number-write-animation';
                    showMessage('Tebrikler! Doğru cevap! 🎉', 'success');
                    score += 10;
                    document.getElementById('score').textContent = `Puan: ${score}`;
                    currentStep = 0;
                    document.getElementById('newQuestion').classList.remove('hidden');
                    this.readOnly = true;
                    
                    // Animasyonu sıfırla
                    setTimeout(() => {
                        this.className = 'w-full h-full text-center bg-transparent';
                    }, 1000);
                } else {
                    showMessage(`Tekrar dene! ${onlar1} + ${onlar2} ${carryValue ? '+ 1 (elde)' : ''} = ?`, 'error');
                    shake(this);
                    this.value = '';
                }
            }
        };
        
        // Otomatik fokus
        setTimeout(() => {
            ansTensInput.focus();
        }, 100);
    }
}

function showCarryCheck() {
    document.getElementById('carryButtons').classList.remove('hidden');
}

function showMessage(text, type) {
    const messageArea = document.getElementById('messageArea');
    const message = document.getElementById('message');
    messageArea.classList.remove('hidden');
    messageArea.className = `rounded-xl p-4 mb-6 ${type === 'success' ? 'bg-green-100' : 'bg-yellow-100'}`;
    message.textContent = text;
}

function shake(element) {
    element.classList.add('shake');
    setTimeout(() => element.classList.remove('shake'), 500);
}

// Input event listener'ları ekle
document.addEventListener('DOMContentLoaded', function() {
    const sumInput = document.getElementById('sumInput');
    
    // Klavye girişi için
    sumInput.addEventListener('keypress', function(e) {
        // Sadece sayı girişine izin ver
        if (!/[0-9]/.test(e.key) && e.key !== 'Enter') {
            e.preventDefault();
            return false;
        }
        
        // Enter tuşuna basıldığında kontrol et
        if (e.key === 'Enter' && this.value.length > 0) {
            checkOnesDigit();
        }
    });

    sumInput.addEventListener('input', function(e) {
        // Input değerini temizle ve sadece sayıları al
        this.value = this.value.replace(/[^0-9]/g, '');
        
        // Maksimum 2 basamak kontrolü
        if (this.value.length > 2) {
            this.value = this.value.slice(0, 2);
        }
        
        // Değer girildiğinde otomatik kontrol et
        if (this.value.length === 2 || (parseInt(this.value) >= (firstNumber % 10 + secondNumber % 10))) {
            checkOnesDigit();
        }
    });

    // Otomatik fokus ve mobil klavye optimizasyonu
    sumInput.addEventListener('focus', function() {
        this.inputMode = 'numeric';
        this.pattern = '[0-9]*';
    });
});

// Sayfa yüklendiğinde yeni soru butonunu aktif et
document.getElementById('newQuestion').addEventListener('click', newQuestion);