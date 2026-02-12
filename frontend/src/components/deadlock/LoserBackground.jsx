import React, { useEffect, useRef } from 'react';

const LoserBackground = () => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let animationFrameId;

        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();

        // Minimal Loser Embers (Red/Crimson Sparks)
        const particles = [];
        const particleCount = 40; // Increased slightly for better glow

        class LoserSpark {
            constructor() {
                this.init();
            }

            init() {
                this.x = Math.random() * canvas.width;
                this.y = canvas.height + Math.random() * 100;
                this.size = Math.random() * 2 + 0.5; // Slightly larger for better glow
                this.speedY = -(Math.random() * 0.5 + 0.1);
                this.speedX = (Math.random() - 0.5) * 0.3;
                // Desaturated Red/Gray colors for "severed" feel
                this.opacity = Math.random() * 0.5 + 0.2; // Increased opacity
                this.color = `rgba(255, 42, 42, ${this.opacity})`; // Cyber Red
                this.life = Math.random() * 100 + 100;
            }

            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fillStyle = this.color;

                // Brighter glow
                ctx.shadowBlur = 15; // Increased
                ctx.shadowColor = 'rgba(255, 0, 0, 0.8)'; // More intense

                ctx.fill();
            }

            update() {
                this.y += this.speedY;
                this.x += this.speedX;

                // Very slight sway
                this.x += Math.sin(this.y * 0.005) * 0.1;

                if (this.y < -20) {
                    this.init();
                }
            }
        }

        for (let i = 0; i < particleCount; i++) {
            particles.push(new LoserSpark());
        }

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Stronger red radial background tint
            const gradient = ctx.createRadialGradient(
                canvas.width / 2, canvas.height, 0,
                canvas.width / 2, canvas.height, canvas.height * 1.5
            );
            gradient.addColorStop(0, 'rgba(255, 0, 0, 0.08)'); // Increased
            gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            particles.forEach(p => {
                p.update();
                p.draw();
            });

            animationFrameId = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="loser-background-canvas"
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                zIndex: 5,
                pointerEvents: 'none',
                background: 'transparent'
            }}
        />
    );
};

export default LoserBackground;
