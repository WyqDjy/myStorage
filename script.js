// 检测移动设备
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

// 星空背景 - Star类定义
class Star {
    constructor(canvas) {
        this.canvas = canvas; // Canvas元素
        this.ctx = canvas.getContext('2d'); // 2D绘图上下文
        this.reset(); // 初始化星星属性
    }

    // 重置星星属性（位置、大小、速度、透明度）
    reset() {
        this.x = Math.random() * this.canvas.width; // 随机X坐标
        this.y = Math.random() * this.canvas.height; // 随机Y坐标
        this.size = Math.random() * 2; // 随机大小（0-2像素）
        this.speed = Math.random() * 0.5 + 0.1; // 随机速度（0.1-0.6像素/帧）
        this.opacity = Math.random(); // 随机透明度（0-1）
    }

    // 更新星星状态
    update() {
        this.y -= this.speed; // 向上移动
        // 如果星星移出画布顶部，重置位置到底部
        if (this.y < 0) {
            this.reset();
            this.y = this.canvas.height;
        }

        // 闪烁效果：随机调整透明度
        this.opacity += (Math.random() - 0.5) * 0.02;
        this.opacity = Math.max(0.1, Math.min(1, this.opacity)); // 限制透明度在0.1-1之间
    }

    // 绘制星星
    draw() {
        this.ctx.save(); // 保存当前绘图状态
        this.ctx.globalAlpha = this.opacity; // 设置透明度
        this.ctx.fillStyle = '#fff'; // 白色星星
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2); // 绘制圆形星星
        this.ctx.fill();
        this.ctx.restore(); // 恢复绘图状态
    }
}

// 烟花效果 - Firework类定义
class Firework {
    constructor(canvas) {
        this.canvas = canvas; // Canvas元素
        this.ctx = canvas.getContext('2d'); // 2D绘图上下文
        this.reset(); // 初始化烟花属性
    }

    // 重置烟花属性
    reset() {
        this.x = Math.random() * this.canvas.width; // 随机发射X坐标
        this.y = this.canvas.height; // 发射点Y坐标（画布底部）
        this.targetY = Math.random() * this.canvas.height * 0.5; // 随机爆炸高度（上半部分）
        this.speed = Math.random() * 3 + 2; // 随机上升速度（2-5像素/帧）
        this.color = this.getRandomColor(); // 随机颜色
        this.particles = []; // 粒子数组
        this.exploded = false; // 是否已爆炸
        this.trail = []; // 轨迹点数组
        this.particleCount = isMobile ? 40 : 80; // 移动端减少粒子数量
    }

    // 获取随机烟花颜色（使用HSL色彩空间获得更丰富的颜色）
    getRandomColor() {
        const hue = Math.random() * 360;
        const saturation = 80 + Math.random() * 20;
        const lightness = 50 + Math.random() * 20;
        return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
    }

    // 更新烟花状态
    update() {
        if (!this.exploded) {
            // 未爆炸：上升阶段
            this.y -= this.speed;

            // 添加轨迹点
            this.trail.push({ x: this.x, y: this.y });
            if (this.trail.length > 15) {
                this.trail.shift(); // 保持轨迹点数量不超过15个
            }

            // 到达目标高度，触发爆炸
            if (this.y <= this.targetY) {
                this.explode();
            }
        } else {
            // 已爆炸：更新粒子状态
            for (let i = this.particles.length - 1; i >= 0; i--) {
                this.updateParticle(this.particles[i]);
                if (this.particles[i].alpha <= 0) {
                    this.particles.splice(i, 1); // 移除透明度为0的粒子
                }
            }

            // 粒子全部消失，重置烟花
            if (this.particles.length === 0) {
                this.reset();
            }
        }
    }

    // 烟花爆炸，生成粒子
    explode() {
        this.exploded = true;

        for (let i = 0; i < this.particleCount; i++) {
            const angle = (Math.PI * 2 * i) / this.particleCount + Math.random() * 0.5;
            const velocity = 3 + Math.random() * 5;
            const particle = {
                x: this.x,
                y: this.y,
                vx: Math.cos(angle) * velocity, // X方向速度
                vy: Math.sin(angle) * velocity, // Y方向速度
                alpha: 1, // 初始透明度
                size: isMobile ? 2 + Math.random() * 2 : 3 + Math.random() * 3, // 随机大小
                color: this.color, // 继承烟花颜色
                trail: [], // 粒子尾迹
                decay: 0.015 + Math.random() * 0.01, // 透明度衰减速度
                gravity: 0.08 + Math.random() * 0.04, // 重力
                drag: 0.98 + Math.random() * 0.01 // 空气阻力
            };
            this.particles.push(particle);
        }
    }

    // 绘制烟花
    draw() {
        if (!this.exploded) {
            // 未爆炸：绘制上升轨迹和主体
            this.ctx.save();
            // 绘制轨迹
            for (let i = 0; i < this.trail.length; i++) {
                const alpha = i / this.trail.length * 0.6; // 轨迹透明度逐渐降低
                this.ctx.globalAlpha = alpha;
                this.ctx.fillStyle = this.color;
                this.ctx.shadowBlur = 10; // 发光效果
                this.ctx.shadowColor = this.color;
                this.ctx.beginPath();
                this.ctx.arc(this.trail[i].x, this.trail[i].y, 2, 0, Math.PI * 2);
                this.ctx.fill();
            }
            this.ctx.restore();

            // 绘制烟花主体
            this.ctx.save();
            this.ctx.fillStyle = this.color;
            this.ctx.shadowBlur = 15; // 发光效果
            this.ctx.shadowColor = this.color;
            this.ctx.beginPath();
            this.ctx.arc(this.x, this.y, 3, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.restore();
        } else {
            // 已爆炸：绘制粒子
            this.ctx.save();
            for (const particle of this.particles) {
                this.ctx.globalAlpha = particle.alpha;
                this.ctx.fillStyle = particle.color;
                this.ctx.shadowBlur = 8; // 粒子发光效果
                this.ctx.shadowColor = particle.color;
                this.ctx.beginPath();
                this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                this.ctx.fill();

                // 绘制粒子尾迹
                if (particle.trail.length > 1) {
                    this.ctx.beginPath();
                    this.ctx.moveTo(particle.trail[0].x, particle.trail[0].y);
                    for (let j = 1; j < particle.trail.length; j++) {
                        this.ctx.lineTo(particle.trail[j].x, particle.trail[j].y);
                    }
                    this.ctx.strokeStyle = particle.color;
                    this.ctx.lineWidth = particle.size * 0.5;
                    this.ctx.globalAlpha = particle.alpha * 0.3;
                    this.ctx.stroke();
                }
            }
            this.ctx.restore();
        }
    }

    // 更新单个粒子状态
    updateParticle(particle) {
        // 添加当前位置到尾迹
        particle.trail.push({ x: particle.x, y: particle.y });
        if (particle.trail.length > 8) {
            particle.trail.shift();
        }

        // 更新位置
        particle.x += particle.vx;
        particle.y += particle.vy;

        // 应用物理效果
        particle.vy += particle.gravity; // 重力
        particle.vx *= particle.drag; // 空气阻力
        particle.vy *= particle.drag;

        // 透明度衰减
        particle.alpha -= particle.decay;

        // 粒子大小逐渐减小
        particle.size *= 0.995;
    }
}

// 初始化函数
function init() {
    // 获取Canvas元素
    const starsCanvas = document.getElementById('stars');
    const fireworksCanvas = document.getElementById('fireworks');

    // 调整Canvas大小以适应窗口
    function resizeCanvas() {
        starsCanvas.width = window.innerWidth;
        starsCanvas.height = window.innerHeight;
        fireworksCanvas.width = window.innerWidth;
        fireworksCanvas.height = window.innerHeight;
    }

    resizeCanvas();
    // 监听窗口大小变化，重新调整Canvas
    window.addEventListener('resize', resizeCanvas);

    // 创建星空
    const stars = [];
    const starCount = isMobile ? 100 : 200; // 移动端减少星星数量
    for (let i = 0; i < starCount; i++) {
        stars.push(new Star(starsCanvas));
    }

    // 创建烟花
    const fireworks = [];
    const fireworkCount = isMobile ? 5 : 10; // 移动端减少烟花数量
    for (let i = 0; i < fireworkCount; i++) {
        fireworks.push(new Firework(fireworksCanvas));
        // 错开烟花发射时间
        setTimeout(() => {
            fireworks[i].reset();
        }, Math.random() * 5000);
    }

    // 动画循环
    function animate() {
        // 清空画布
        starsCanvas.getContext('2d').clearRect(0, 0, starsCanvas.width, starsCanvas.height);
        fireworksCanvas.getContext('2d').clearRect(0, 0, fireworksCanvas.width, fireworksCanvas.height);

        // 更新和绘制星空
        for (const star of stars) {
            star.update();
            star.draw();
        }

        // 更新和绘制烟花
        for (const firework of fireworks) {
            firework.update();
            firework.draw();
        }

        // 循环调用动画函数
        requestAnimationFrame(animate);
    }

    animate(); // 开始动画循环

    // 点击事件：添加额外烟花
    document.addEventListener('click', (e) => {
        const firework = new Firework(fireworksCanvas);
        firework.x = e.clientX; // 点击位置X坐标
        firework.y = fireworksCanvas.height;
        firework.targetY = e.clientY; // 点击位置Y坐标
        fireworks.push(firework);

        // 限制烟花数量，最多20个
        if (fireworks.length > 20) {
            fireworks.shift();
        }
    });

    // 触摸事件：移动端支持
    document.addEventListener('touchstart', (e) => {
        e.preventDefault();
        const touch = e.touches[0];
        const firework = new Firework(fireworksCanvas);
        firework.x = touch.clientX;
        firework.y = fireworksCanvas.height;
        firework.targetY = touch.clientY;
        fireworks.push(firework);

        if (fireworks.length > 20) {
            fireworks.shift();
        }
    }, { passive: false });

    // ------------------------- 互动功能1：触摸涟漪效果 -------------------------
    const rippleContainer = document.getElementById('ripple-container');

    function createRipple(x, y) {
        const ripple = document.createElement('div');
        ripple.className = 'ripple';
        ripple.style.left = `${x}px`;
        ripple.style.top = `${y}px`;
        ripple.style.width = '100px';
        ripple.style.height = '100px';
        ripple.style.marginLeft = '-50px';
        ripple.style.marginTop = '-50px';
        rippleContainer.appendChild(ripple);

        // 动画结束后移除元素
        setTimeout(() => {
            ripple.remove();
        }, 800);
    }

    // 点击和触摸都触发涟漪
    document.addEventListener('click', (e) => {
        createRipple(e.clientX, e.clientY);
    });

    document.addEventListener('touchstart', (e) => {
        e.preventDefault();
        const touch = e.touches[0];
        createRipple(touch.clientX, touch.clientY);
    }, { passive: false });

    // ------------------------- 互动功能2：随机祝福语 -------------------------
    const wishes = [
        '愿所有美好都如期而至！',
        '今天是你的专属快乐日！',
        '笑口常开，幸福常伴！',
        '愿你的梦想都能实现！',
        '每一天都充满惊喜！',
        '永远保持童心，永远快乐！',
        '愿友谊和爱情永远围绕着你！',
        '健康快乐，万事如意！',
        '今天的你最闪亮！',
        '愿未来的日子更加精彩！'
    ];

    const randomWishElement = document.getElementById('randomWish');

    // 定时更换祝福语
    function changeRandomWish() {
        const randomIndex = Math.floor(Math.random() * wishes.length);
        randomWishElement.textContent = wishes[randomIndex];
    }

    // 初始显示
    changeRandomWish();
    // 每5秒更换一次
    setInterval(changeRandomWish, 5000);

    // ------------------------- 互动功能3：背景音乐控制 -------------------------
    const musicToggle = document.getElementById('musicToggle');
    let isMusicPlaying = false;
    let audioContext = null;

    musicToggle.addEventListener('click', () => {
        if (isMusicPlaying) {
            // 停止音乐播放
            if (audioContext) {
                audioContext.close();
                audioContext = null;
            }
            musicToggle.textContent = '🎵 音乐';
            musicToggle.classList.remove('active');
            isMusicPlaying = false;
        } else {
            // 播放音乐
            musicToggle.textContent = '🔇 静音';
            musicToggle.classList.add('active');
            isMusicPlaying = true;

            // 创建音频上下文并播放生日歌
            audioContext = new (window.AudioContext || window.webkitAudioContext)();

            // 简单的生日歌旋律（C大调）
            const playBirthdayMelody = () => {
                if (!audioContext || audioContext.state === 'closed') return;

                const notes = [
                    { note: 'C4', duration: 0.5 },
                    { note: 'C4', duration: 0.25 },
                    { note: 'D4', duration: 0.75 },
                    { note: 'C4', duration: 0.75 },
                    { note: 'F4', duration: 0.75 },
                    { note: 'E4', duration: 1.5 },
                    { note: 'C4', duration: 0.5 },
                    { note: 'C4', duration: 0.25 },
                    { note: 'D4', duration: 0.75 },
                    { note: 'C4', duration: 0.75 },
                    { note: 'G4', duration: 0.75 },
                    { note: 'F4', duration: 1.5 }
                ];

                // 音符频率映射
                const noteFrequencies = {
                    'C4': 261.63,
                    'D4': 293.66,
                    'E4': 329.63,
                    'F4': 349.23,
                    'G4': 392.00
                };

                // 播放旋律
                let currentTime = audioContext.currentTime;
                notes.forEach(noteData => {
                    if (!audioContext || audioContext.state === 'closed') return;

                    const freq = noteFrequencies[noteData.note];
                    const osc = audioContext.createOscillator();
                    const gNode = audioContext.createGain();

                    osc.connect(gNode);
                    gNode.connect(audioContext.destination);

                    osc.frequency.setValueAtTime(freq, currentTime);
                    gNode.gain.setValueAtTime(0.1, currentTime);
                    gNode.gain.exponentialRampToValueAtTime(0.01, currentTime + noteData.duration);

                    osc.start(currentTime);
                    osc.stop(currentTime + noteData.duration);

                    currentTime += noteData.duration;
                });

                // 循环播放
                setTimeout(playBirthdayMelody, (currentTime - audioContext.currentTime) * 1000);
            };

            playBirthdayMelody();
        }
    });
}

// 页面加载完成后初始化
window.addEventListener('load', init);