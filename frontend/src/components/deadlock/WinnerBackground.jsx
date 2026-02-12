import React, { useEffect, useRef } from 'react';

const WinnerBackground = () => {
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

        // Minimal Victory Embers (Golden Sparks)
        const particles = [];
        const particleCount = 30; // Very minimal

        class VictorySpark {
            constructor() {
                this.init();
            }

            init() {
                this.x = Math.random() * canvas.width;
                this.y = canvas.height + Math.random() * 100;
                this.size = Math.random() * 2 + 1;
                this.speedY = -(Math.random() * 0.8 + 0.2); // Slower upward drift
                this.speedX = (Math.random() - 0.5) * 0.5;
                // Vibrant Green colors
                this.opacity = Math.random() * 0.6 + 0.2;
                this.color = `rgba(0, 255, 65, ${this.opacity})`; // Green
                this.life = Math.random() * 100 + 100;
            }

            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fillStyle = this.color;

                // Add a soft glow
                ctx.shadowBlur = 10;
                ctx.shadowColor = 'rgba(0, 255, 65, 0.8)'; // Green glow

                ctx.fill();
            }

            update() {
                this.y += this.speedY;
                this.x += this.speedX;

                // Swaying motion
                this.x += Math.sin(this.y * 0.01) * 0.2;

                if (this.y < -20) {
                    this.init();
                }
            }
        }

        for (let i = 0; i < particleCount; i++) {
            particles.push(new VictorySpark());
        }

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Soft overall glow
            const gradient = ctx.createRadialGradient(
                canvas.width / 2, canvas.height, 0,
                canvas.width / 2, canvas.height, canvas.height * 1.5
            );
            gradient.addColorStop(0, 'rgba(0, 255, 65, 0.05)');
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
            className="winner-background-canvas"
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                zIndex: 5, // Above grid, below content
                pointerEvents: 'none',
                background: 'transparent'
            }}
        />
    );
};

export default WinnerBackground;
