        class HausdorffMiddleDemo {
            constructor() {
                this.canvas = document.getElementById('canvas');
                this.ctx = this.canvas.getContext('2d');
                this.mode = 'A';
                this.previousMode = null;
                this.freeformPoints = [];
                this.shapeA = null;
                this.shapeB = null;
                this.alpha = 0.5;
                this.showMiddle = false;
                
                this.setupEventListeners();
                this.render();
            }

            setupEventListeners() {
                // Mode buttons
                document.getElementById('mode-a').addEventListener('click', () => {
                    this.mode = 'A';
                    document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
                    document.getElementById('mode-a').classList.add('active');
                });

                document.getElementById('mode-b').addEventListener('click', () => {
                    this.mode = 'B';
                    document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
                    document.getElementById('mode-b').classList.add('active');
                });

                // Shape buttons: just select the shape type
                document.querySelectorAll('.shape-btn').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        this.selectedShapeType = e.target.dataset.shape;
                        // Remove .selected from all, then add to the clicked one
                        document.querySelectorAll('.shape-btn').forEach(b => b.classList.remove('selected'));
                        e.target.classList.add('selected');
                    });
                });

                // NEW: Canvas click to place shape
                this.canvas.addEventListener('click', (e) => {
                    if (!this.selectedShapeType) {
                        alert('Veuillez d\'abord choisir une forme !');
                        return;
                    }
                    const rect = this.canvas.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const y = e.clientY - rect.top;

                    if (this.selectedShapeType === 'freeform') {
                        if (this.mode != this.previousMode) {
                            this.freeformPoints = [];
                            this.previousMode = this.mode;
                        }
                            this.freeformPoints.push({x, y}); 
                            const shape = {
                                type: 'freeform',
                                points: [...this.freeformPoints],
                                center: this.freeformPoints[0]
                            };
                            if (this.mode === 'A') {this.shapeA = shape;}
                            else                   {this.shapeB = shape;}
                            this.showMiddle = false;
                            this.render();
                    }
                    else {this.addShape(this.selectedShapeType, x, y);}
                    
                    // this.selectedShapeType = null; // Reset after placing
                });

                // Control buttons
                document.getElementById('compute-middle').addEventListener('click', () => {
                    this.toggleMiddleDisplay();
                });

                document.getElementById('clear-all').addEventListener('click', () => {
                    this.clearAll();
                });

                // Alpha slider
                const alphaSlider = document.getElementById('alpha-slider');
                alphaSlider.addEventListener('input', (e) => {
                    this.alpha = parseFloat(e.target.value);
                    document.getElementById('alpha-value').textContent = `α = ${this.alpha.toFixed(2)}`;
                    if (this.showMiddle) {
                        this.render();
                    }
                });
            }

            addShape(shapeType, x, y) {
                const shape = this.createShape(shapeType, x, y);
                if (this.mode === 'A') {
                    this.shapeA = shape;
                } else {
                    this.shapeB = shape;
                }
                
                this.showMiddle = false;
                this.render();
            }

            createShape(type, centerX, centerY) {
                const size = 80;
                const points = [];
                
                switch (type) {
                    case 'circle':
                        // Approximate circle with many points
                        for (let i = 0; i < 32; i++) {
                            const angle = (i / 32) * 2 * Math.PI;
                            points.push({
                                x: centerX + Math.cos(angle) * size,
                                y: centerY + Math.sin(angle) * size
                            });
                        }
                        break;
                        
                    case 'square':
                        points.push(
                            {x: centerX - size, y: centerY - size},
                            {x: centerX + size, y: centerY - size},
                            {x: centerX + size, y: centerY + size},
                            {x: centerX - size, y: centerY + size}
                        );
                        break;
                        
                    case 'triangle':
                        points.push(
                            {x: centerX, y: centerY - size},
                            {x: centerX + size * 0.866, y: centerY + size * 0.5},
                            {x: centerX - size * 0.866, y: centerY + size * 0.5}
                        );
                        break;
                        
                    case 'diamond':
                        points.push(
                            {x: centerX, y: centerY - size},
                            {x: centerX + size, y: centerY},
                            {x: centerX, y: centerY + size},
                            {x: centerX - size, y: centerY}
                        );
                        break;
                        
                    case 'rectangle':
                        points.push(
                            {x: centerX - size * 1.2, y: centerY - size * 0.7},
                            {x: centerX + size * 1.2, y: centerY - size * 0.7},
                            {x: centerX + size * 1.2, y: centerY + size * 0.7},
                            {x: centerX - size * 1.2, y: centerY + size * 0.7}
                        );
                        break;
                        
                    case 'hexagon':
                        for (let i = 0; i < 6; i++) {
                            const angle = (i / 6) * 2 * Math.PI;
                            points.push({
                                x: centerX + Math.cos(angle) * size,
                                y: centerY + Math.sin(angle) * size
                            });
                        }
                        break;
                }
                
                return {
                    type: type,
                    points: points,
                    center: {x: centerX, y: centerY}
                };
            }

            toggleMiddleDisplay() {
                if (!this.shapeA || !this.shapeB) {
                    alert('Veuillez d\'abord sélectionner les deux formes A et B !');
                    return;
                }
                
                this.showMiddle = !this.showMiddle;
                const btn = document.getElementById('compute-middle');
                btn.textContent = this.showMiddle ? 'Masquer S_α' : 'Calculer S_α';
                btn.style.background = this.showMiddle ? '#ffc107' : '#28a745';
                
                this.render();
            }

            clearAll() {
                this.shapeA = null;
                this.shapeB = null;
                this.showMiddle = false;
                this.freeformPoints = [];
                
                const btn = document.getElementById('compute-middle');
                btn.textContent = 'Calculer S_α';
                btn.style.background = '#28a745';
                
                this.render();
            }

            render() {
                this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
                
                if (this.showMiddle && this.shapeA && this.shapeB) {
                    this.renderWithMiddle();
                } else {
                    this.renderShapesOnly();
                }
            }

            renderShapesOnly() {
                // Draw shape A
                if (this.shapeA) {
                    this.drawShape(this.shapeA.points, 'rgba(255, 0, 0, 0.3)', '#ff0000', 3);
                    this.drawLabel(this.shapeA.center, 'A', '#ff0000');
                }
                
                // Draw shape B
                if (this.shapeB) {
                    this.drawShape(this.shapeB.points, 'rgba(0, 0, 255, 0.3)', '#0000ff', 3);
                    this.drawLabel(this.shapeB.center, 'B', '#0000ff');
                }
            }

            renderWithMiddle() {
                // Calculate the Hausdorff distance and normalize it
                const hausdorffDist = this.calculateHausdorffDistance(this.shapeA.points, this.shapeB.points);
                const normalizedScale = 60; // Fixed scale for better visualization
                
                const radiusA = this.alpha * normalizedScale;
                const radiusB = (1 - this.alpha) * normalizedScale;
                
                // Draw dilated shapes first (background)
                this.drawDilatedShape(this.shapeA.points, radiusA, 'rgba(255, 0, 0, 0.1)', '#ff4444', true);
                this.drawDilatedShape(this.shapeB.points, radiusB, 'rgba(0, 0, 255, 0.1)', '#4444ff', true);
                
                // Draw original shapes
                this.drawShape(this.shapeA.points, 'rgba(255, 0, 0, 0.3)', '#ff0000', 3);
                this.drawShape(this.shapeB.points, 'rgba(0, 0, 255, 0.3)', '#0000ff', 3);
                
                // Calculate and draw the intersection (S_α)
                this.drawIntersection(radiusA, radiusB);
                
                // Draw labels
                this.drawLabel(this.shapeA.center, 'A', '#ff0000');
                this.drawLabel(this.shapeB.center, 'B', '#0000ff');
                
                // Draw info text
                this.ctx.fillStyle = '#333';
                this.ctx.font = '16px Arial';
                this.ctx.fillText(`α = ${this.alpha.toFixed(2)}`, 20, 30);
                this.ctx.fillText(`Rayon A: ${radiusA.toFixed(1)}px`, 20, 50);
                this.ctx.fillText(`Rayon B: ${radiusB.toFixed(1)}px`, 20, 70);
            }

            drawShape(points, fillColor, strokeColor, lineWidth = 2) {
                if (points.length < 2) return;
                
                this.ctx.beginPath();
                this.ctx.moveTo(points[0].x, points[0].y);
                
                for (let i = 1; i < points.length; i++) {
                    this.ctx.lineTo(points[i].x, points[i].y);
                }
                
                this.ctx.closePath();
                this.ctx.fillStyle = fillColor;
                this.ctx.fill();
                this.ctx.strokeStyle = strokeColor;
                this.ctx.lineWidth = lineWidth;
                this.ctx.stroke();
            }

            drawDilatedShape(points, radius, fillColor, strokeColor, dashed = false) {
                if (points.length < 2 || radius <= 0) return;
                
                this.ctx.save();
                
                if (dashed) {
                    this.ctx.setLineDash([8, 4]);
                }
                
                // Draw the dilated shape by drawing circles at each vertex and connecting them
                this.ctx.fillStyle = fillColor;
                this.ctx.strokeStyle = strokeColor;
                this.ctx.lineWidth = 2;
                
                // Create the outer boundary
                this.ctx.beginPath();
                
                // For each edge, calculate the outer parallel line
                const outerPoints = [];
                for (let i = 0; i < points.length; i++) {
                    const curr = points[i];
                    const next = points[(i + 1) % points.length];
                    const prev = points[(i - 1 + points.length) % points.length];
                    
                    // Calculate the outward normal at this vertex
                    const v1 = this.normalize({x: curr.x - prev.x, y: curr.y - prev.y});
                    const v2 = this.normalize({x: next.x - curr.x, y: next.y - curr.y});
                    
                    const normal1 = {x: -v1.y, y: v1.x};
                    const normal2 = {x: -v2.y, y: v2.x};
                    
                    // Average normal (bisector)
                    let avgNormal = {
                        x: (normal1.x + normal2.x) * 0.5,
                        y: (normal1.y + normal2.y) * 0.5
                    };
                    
                    const len = Math.sqrt(avgNormal.x * avgNormal.x + avgNormal.y * avgNormal.y);
                    if (len > 0) {
                        avgNormal.x /= len;
                        avgNormal.y /= len;
                    }
                    
                    // Calculate the distance to move outward
                    const cosHalfAngle = Math.max(0.1, Math.sqrt((1 + v1.x * v2.x + v1.y * v2.y) * 0.5));
                    const offset = radius / cosHalfAngle;
                    
                    outerPoints.push({
                        x: curr.x + avgNormal.x * offset,
                        y: curr.y + avgNormal.y * offset
                    });
                }
                
                // Draw the outer boundary
                if (outerPoints.length > 0) {
                    this.ctx.moveTo(outerPoints[0].x, outerPoints[0].y);
                    for (let i = 1; i < outerPoints.length; i++) {
                        this.ctx.lineTo(outerPoints[i].x, outerPoints[i].y);
                    }
                    this.ctx.closePath();
                    this.ctx.fill();
                    this.ctx.stroke();
                }
                
                this.ctx.restore();
            }

            drawIntersection(radiusA, radiusB) {
                // Sample points on a grid and check if they're in both dilated shapes
                const step = 4;
                const intersectionPoints = [];
                
                for (let x = 0; x < this.canvas.width; x += step) {
                    for (let y = 0; y < this.canvas.height; y += step) {
                        const point = {x, y};
                        
                        const inA = this.isPointInDilatedShape(point, this.shapeA.points, radiusA);
                        const inB = this.isPointInDilatedShape(point, this.shapeB.points, radiusB);
                        
                        if (inA && inB) {
                            intersectionPoints.push(point);
                        }
                    }
                }
                
                // Draw the intersection points
                this.ctx.fillStyle = 'rgba(0, 255, 0, 0.6)';
                for (let point of intersectionPoints) {
                    this.ctx.fillRect(point.x - 1, point.y - 1, 3, 3);
                }
                
                // Draw a boundary around the intersection if there are enough points
                if (intersectionPoints.length > 10) {
                    const boundary = this.calculateBoundary(intersectionPoints);
                    if (boundary.length > 2) {
                        this.drawShape(boundary, 'rgba(0, 255, 0, 0.3)', '#00aa00', 4);
                        
                        // Add label for S_α
                        const center = this.calculateCentroid(boundary);
                        this.drawLabel(center, 'S_α', '#00aa00');
                    }
                }
            }

            isPointInDilatedShape(point, shapePoints, radius) {
                // Check if point is within radius distance of the shape
                return this.distanceToShape(point, shapePoints) <= radius;
            }

            distanceToShape(point, shapePoints) {
                let minDist = Infinity;
                
                for (let i = 0; i < shapePoints.length; i++) {
                    const curr = shapePoints[i];
                    const next = shapePoints[(i + 1) % shapePoints.length];
                    
                    // Distance to vertex
                    const vertexDist = this.distance(point, curr);
                    minDist = Math.min(minDist, vertexDist);
                    
                    // Distance to edge
                    const edgeDist = this.pointToSegmentDistance(point, curr, next);
                    minDist = Math.min(minDist, edgeDist);
                }
                
                return minDist;
            }

            pointToSegmentDistance(point, segStart, segEnd) {
                const A = point.x - segStart.x;
                const B = point.y - segStart.y;
                const C = segEnd.x - segStart.x;
                const D = segEnd.y - segStart.y;
                
                const dot = A * C + B * D;
                const lenSq = C * C + D * D;
                
                if (lenSq === 0) return this.distance(point, segStart);
                
                let param = dot / lenSq;
                param = Math.max(0, Math.min(1, param));
                
                const closestPoint = {
                    x: segStart.x + param * C,
                    y: segStart.y + param * D
                };
                
                return this.distance(point, closestPoint);
            }

            calculateBoundary(points) {
                if (points.length < 3) return points;
                
                // Simple convex hull using gift wrapping
                const hull = [];
                let leftmost = 0;
                
                for (let i = 1; i < points.length; i++) {
                    if (points[i].x < points[leftmost].x) {
                        leftmost = i;
                    }
                }
                
                let current = leftmost;
                do {
                    hull.push(points[current]);
                    let next = 0;
                    
                    for (let i = 1; i < points.length; i++) {
                        if (next === current || this.crossProduct(points[current], points[i], points[next]) > 0) {
                            next = i;
                        }
                    }
                    
                    current = next;
                } while (current !== leftmost && hull.length < points.length);
                
                return hull;
            }

            crossProduct(p1, p2, p3) {
                return (p2.x - p1.x) * (p3.y - p1.y) - (p2.y - p1.y) * (p3.x - p1.x);
            }

            calculateCentroid(points) {
                let x = 0, y = 0;
                for (let point of points) {
                    x += point.x;
                    y += point.y;
                }
                return {x: x / points.length, y: y / points.length};
            }

            calculateHausdorffDistance(pointsA, pointsB) {
                let maxDistAB = 0;
                let maxDistBA = 0;
                
                // Distance from A to B
                for (let pointA of pointsA) {
                    let minDist = Infinity;
                    for (let pointB of pointsB) {
                        minDist = Math.min(minDist, this.distance(pointA, pointB));
                    }
                    maxDistAB = Math.max(maxDistAB, minDist);
                }
                
                // Distance from B to A
                for (let pointB of pointsB) {
                    let minDist = Infinity;
                    for (let pointA of pointsA) {
                        minDist = Math.min(minDist, this.distance(pointA, pointB));
                    }
                    maxDistBA = Math.max(maxDistBA, minDist);
                }
                
                return Math.max(maxDistAB, maxDistBA);
            }

            distance(p1, p2) {
                return Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);
            }

            normalize(vector) {
                const length = Math.sqrt(vector.x * vector.x + vector.y * vector.y);
                if (length === 0) return {x: 0, y: 0};
                return {x: vector.x / length, y: vector.y / length};
            }

            drawLabel(center, text, color) {
                this.ctx.save();
                this.ctx.fillStyle = color;
                this.ctx.font = 'bold 18px Arial';
                this.ctx.textAlign = 'center';
                this.ctx.textBaseline = 'middle';
                
                // Draw background circle
                this.ctx.beginPath();
                this.ctx.arc(center.x, center.y, 15, 0, 2 * Math.PI);
                this.ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
                this.ctx.fill();
                this.ctx.strokeStyle = color;
                this.ctx.lineWidth = 2;
                this.ctx.stroke();
                
                // Draw text
                this.ctx.fillStyle = color;
                this.ctx.fillText(text, center.x, center.y);
                this.ctx.restore();
            }
        }

        // Initialize the demo when the page loads
        window.addEventListener('load', () => {
            new HausdorffMiddleDemo();
        });