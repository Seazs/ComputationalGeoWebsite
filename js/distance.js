
        const canvas = document.getElementById('canvas');
        const ctx = canvas.getContext('2d');
        
        let shapeA = [];
        let shapeB = [];
        let animationState = {
            isRunning: false,
            currentPoint: 0,
            direction: 'AtoB', // 'AtoB' or 'BtoA'
            distances: [],
            maxDistanceAtoB: 0,
            maxDistanceBtoA: 0,
            hausdorffDistance: 0
        };
        
        // Generate random shapes
        function generateShapes() {
            shapeA = generateRandomShape(200, 300, 100, 5);
            shapeB = generateRandomShape(500, 300, 80, 7);
            resetAnimation();
            draw();
        }
        
        function generateRandomShape(centerX, centerY, radius, numPoints) {
            const points = [];
            for (let i = 0; i < numPoints; i++) {
                const angle = (i / numPoints) * 2 * Math.PI;
                const r = radius + (Math.random() - 0.5) * radius * 0.4;
                const x = centerX + Math.cos(angle) * r;
                const y = centerY + Math.sin(angle) * r;
                points.push({x, y});
            }
            return points;
        }
        
        // Calculate distance between two points
        function distance(p1, p2) {
            return Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);
        }
        
        // Find closest point in set B to point p
        function findClosestPoint(p, setB) {
            let minDist = Infinity;
            let closestPoint = null;
            
            for (const point of setB) {
                const dist = distance(p, point);
                if (dist < minDist) {
                    minDist = dist;
                    closestPoint = point;
                }
            }
            
            return {point: closestPoint, distance: minDist};
        }
        
        // Draw everything
        function draw() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Draw shapes
            drawShape(shapeA, '#ff6b6b', 'Shape A');
            drawShape(shapeB, '#4834d4', 'Shape B');
            
            // Draw animation state
            if (animationState.isRunning || animationState.distances.length > 0) {
                drawAnimationState();
            }
        }
        
        function drawShape(shape, color, label) {
            // Draw shape outline
            ctx.strokeStyle = color;
            ctx.lineWidth = 3;
            ctx.beginPath();
            for (let i = 0; i < shape.length; i++) {
                const point = shape[i];
                if (i === 0) {
                    ctx.moveTo(point.x, point.y);
                } else {
                    ctx.lineTo(point.x, point.y);
                }
            }
            ctx.closePath();
            ctx.stroke();
            
            // Draw points
            ctx.fillStyle = color;
            for (const point of shape) {
                ctx.beginPath();
                ctx.arc(point.x, point.y, 4, 0, 2 * Math.PI);
                ctx.fill();
            }
        }
        
        function drawAnimationState() {
            const currentShape = animationState.direction === 'AtoB' ? shapeA : shapeB;
            const targetShape = animationState.direction === 'AtoB' ? shapeB : shapeA;
            
            if (animationState.currentPoint < currentShape.length) {
                const currentP = currentShape[animationState.currentPoint];
                const closest = findClosestPoint(currentP, targetShape);
                
                // Highlight current point
                ctx.fillStyle = '#feca57';
                ctx.beginPath();
                ctx.arc(currentP.x, currentP.y, 8, 0, 2 * Math.PI);
                ctx.fill();
                
                // Highlight closest point
                ctx.fillStyle = '#00d2d3';
                ctx.beginPath();
                ctx.arc(closest.point.x, closest.point.y, 8, 0, 2 * Math.PI);
                ctx.fill();
                
                // Draw distance line
                ctx.strokeStyle = '#feca57';
                ctx.lineWidth = 2;
                ctx.setLineDash([5, 5]);
                ctx.beginPath();
                ctx.moveTo(currentP.x, currentP.y);
                ctx.lineTo(closest.point.x, closest.point.y);
                ctx.stroke();
                ctx.setLineDash([]);
                
                // Draw distance text
                const midX = (currentP.x + closest.point.x) / 2;
                const midY = (currentP.y + closest.point.y) / 2;
                ctx.fillStyle = '#000000ff';
                ctx.font = '14px Arial';
                ctx.textAlign = 'center';
                ctx.fillText(closest.distance.toFixed(1), midX, midY - 10);
            }
        }
        
        function updateInfo() {
            const stepInfo = document.getElementById('stepInfo');
            const distanceInfo = document.getElementById('distanceInfo');
            const finalResult = document.getElementById('finalResult');
            
            if (!animationState.isRunning && animationState.distances.length === 0) {
                stepInfo.textContent = "Click 'Start Animation' to begin the Hausdorff distance calculation";
                distanceInfo.textContent = "";
                finalResult.innerHTML = "";
                return;
            }
            
            const currentShape = animationState.direction === 'AtoB' ? 'A' : 'B';
            const targetShape = animationState.direction === 'AtoB' ? 'B' : 'A';
            
            if (animationState.currentPoint < (animationState.direction === 'AtoB' ? shapeA.length : shapeB.length)) {
                stepInfo.textContent = `Step ${animationState.currentPoint + 1}: Finding closest point in Shape ${targetShape} to point ${animationState.currentPoint + 1} of Shape ${currentShape}`;
                
                const currentP = animationState.direction === 'AtoB' ? shapeA[animationState.currentPoint] : shapeB[animationState.currentPoint];
                const targetSet = animationState.direction === 'AtoB' ? shapeB : shapeA;
                const closest = findClosestPoint(currentP, targetSet);
                
                distanceInfo.textContent = `Distance: ${closest.distance.toFixed(2)}`;
            } else if (animationState.direction === 'AtoB' && animationState.maxDistanceBtoA === 0) {
                stepInfo.textContent = `Completed Shape A → B. Max distance: ${animationState.maxDistanceAtoB.toFixed(2)}. Now calculating Shape B → A...`;
                distanceInfo.textContent = "";
            } else {
                stepInfo.textContent = "Calculation complete!";
                distanceInfo.textContent = `Max distance A→B: ${animationState.maxDistanceAtoB.toFixed(2)}, Max distance B→A: ${animationState.maxDistanceBtoA.toFixed(2)}`;
                finalResult.innerHTML = `<div class="final-result">Hausdorff Distance: ${animationState.hausdorffDistance.toFixed(2)}</div>`;
            }
        }
        
        function startAnimation() {
            if (!animationState.isRunning) {
                animationState.isRunning = true;
                animate();
            }
        }
        
        function pauseAnimation() {
            animationState.isRunning = false;
        }
        
        function resetAnimation() {
            animationState = {
                isRunning: false,
                currentPoint: 0,
                direction: 'AtoB',
                distances: [],
                maxDistanceAtoB: 0,
                maxDistanceBtoA: 0,
                hausdorffDistance: 0
            };
            updateInfo();
            draw();
        }
        
        function animate() {
            if (!animationState.isRunning) return;
            
            const currentShape = animationState.direction === 'AtoB' ? shapeA : shapeB;
            const targetShape = animationState.direction === 'AtoB' ? shapeB : shapeA;
            
            if (animationState.currentPoint < currentShape.length) {
                const currentP = currentShape[animationState.currentPoint];
                const closest = findClosestPoint(currentP, targetShape);
                
                if (animationState.direction === 'AtoB') {
                    animationState.maxDistanceAtoB = Math.max(animationState.maxDistanceAtoB, closest.distance);
                } else {
                    animationState.maxDistanceBtoA = Math.max(animationState.maxDistanceBtoA, closest.distance);
                }
                
                draw();
                updateInfo();
                
                animationState.currentPoint++;
                setTimeout(animate, 2500); // 1 second delay between steps
            } else if (animationState.direction === 'AtoB') {
                // Switch to B to A
                animationState.direction = 'BtoA';
                animationState.currentPoint = 0;
                setTimeout(animate, 2500); // 2 second pause between directions
            } else {
                // Animation complete
                animationState.hausdorffDistance = Math.max(animationState.maxDistanceAtoB, animationState.maxDistanceBtoA);
                animationState.isRunning = false;
                updateInfo();
            }
        }
        
        // Initialize
        generateShapes();
