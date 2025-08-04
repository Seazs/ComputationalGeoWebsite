class MinkowskiSumDemo {
    constructor() {
        this.canvas = document.getElementById('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.mode = 'A';
        this.shapeA = null;
        this.shapeB = null;
        this.showSum = false;
        this.setupEventListeners();
        this.render();
    }

    setupEventListeners() {
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
        document.querySelectorAll('.shape-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.selectedShapeType = e.target.dataset.shape;
                document.querySelectorAll('.shape-btn').forEach(b => b.classList.remove('selected'));
                e.target.classList.add('selected');
                if (this.mode === 'A') {
                    this.shapeA = this.createShape(this.selectedShapeType, this.canvas.width / 2, this.canvas.height / 2);
                    this.showSum = false;
                    this.render();
                } else {
                    if (!this.shapeA) {
                        alert('Veuillez d\'abord placer la forme A !');
                        return;
                    }
                    // Place B at the same center as A
                    this.shapeB = this.createShape(this.selectedShapeType, this.shapeA.center.x, this.shapeA.center.y);
                    this.showSum = false;
                    this.render();
                }
            });
        });
        document.getElementById('compute-minkowski').addEventListener('click', () => {
            this.toggleSumDisplay();
        });
        document.getElementById('clear-all').addEventListener('click', () => {
            this.clearAll();
        });
    }

    addShape(shapeType, x, y) {
        const shape = this.createShape(shapeType, x, y);
        if (this.mode === 'A') {
            this.shapeA = shape;
        } else {
            this.shapeB = shape;
        }
        this.showSum = false;
        this.render();
    }

    createShape(type, centerX, centerY) {
        // Copy this method from js/main.js
        // ...existing code...
        const size = 80;
        const points = [];
        switch (type) {
            case 'circle':
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

    toggleSumDisplay() {
        if (!this.shapeA || !this.shapeB) {
            alert('Veuillez d\'abord sélectionner les deux formes A et B !');
            return;
        }
        this.showSum = !this.showSum;
        const btn = document.getElementById('compute-minkowski');
        btn.textContent = this.showSum ? 'Masquer Minkowski Sum' : 'Calculer Minkowski Sum';
        btn.style.background = this.showSum ? '#ffa500' : '#28a745';
        this.render();
    }

    clearAll() {
        this.shapeA = null;
        this.shapeB = null;
        this.showSum = false;
        const btn = document.getElementById('compute-minkowski');
        btn.textContent = 'Calculer Minkowski Sum';
        btn.style.background = '#28a745';
        this.render();
    }

    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        if (this.showSum && this.shapeA && this.shapeB) {
            this.renderWithSum();
        } else {
            this.renderShapesOnly();
        }
    }

    renderShapesOnly() {
        if (this.shapeA) {
            this.drawShape(this.shapeA.points, 'rgba(255, 0, 0, 0.3)', '#ff0000', 3);
            this.drawLabel(this.shapeA.center, 'A', '#ff0000');
        }
        if (this.shapeB) {
            this.drawShape(this.shapeB.points, 'rgba(0, 0, 255, 0.3)', '#0000ff', 3);
            this.drawLabel(this.shapeB.center, 'B', '#0000ff');
        }
    }

    renderWithSum() {
        // Draw original shapes
        this.drawShape(this.shapeA.points, 'rgba(255, 0, 0, 0.3)', '#ff0000', 3);
        this.drawShape(this.shapeB.points, 'rgba(0, 0, 255, 0.3)', '#0000ff', 3);

        // Compute and draw Minkowski sum
        const minkowskiPoints = this.computeMinkowskiSum(this.shapeA.points, this.shapeB.points);
        if (minkowskiPoints.length > 2) {
            this.drawShape(minkowskiPoints, 'rgba(255, 165, 0, 0.4)', '#ffa500', 4);
            const center = this.calculateCentroid(minkowskiPoints);
            this.drawLabel(center, 'A⊕B', '#ffa500');
        }
    }

    computeMinkowskiSum(pointsA, pointsB) {
    // Compute the center (use shapeA's center for consistency)
    const center = this.shapeA.center;
    // Compute relative points
    const relA = pointsA.map(p => ({x: p.x - center.x, y: p.y - center.y}));
    const relB = pointsB.map(p => ({x: p.x - center.x, y: p.y - center.y}));
    const sumPoints = [];
    for (let pa of relA) {
        for (let pb of relB) {
            sumPoints.push({
                x: center.x + pa.x + pb.x,
                y: center.y + pa.y + pb.y
            });
        }
    }
    return this.calculateBoundary(sumPoints);
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

    calculateBoundary(points) {
        // Simple convex hull (gift wrapping)
        if (points.length < 3) return points;
        const hull = [];
        let leftmost = 0;
        for (let i = 1; i < points.length; i++) {
            if (points[i].x < points[leftmost].x) leftmost = i;
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

    drawLabel(center, text, color) {
        this.ctx.save();
        this.ctx.fillStyle = color;
        this.ctx.font = 'bold 18px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.beginPath();
        this.ctx.arc(center.x, center.y, 15, 0, 2 * Math.PI);
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        this.ctx.fill();
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
        this.ctx.fillStyle = color;
        this.ctx.fillText(text, center.x, center.y);
        this.ctx.restore();
    }
}

window.addEventListener('load', () => {
    new MinkowskiSumDemo();
});