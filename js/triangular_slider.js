class TriangularSlider {
            constructor() {
                this.triangle = document.getElementById('triangle');
                this.cursor = document.getElementById('cursor');
                this.valueA = document.getElementById('valueA');
                this.valueB = document.getElementById('valueB');
                this.valueC = document.getElementById('valueC');
                this.sum = document.getElementById('sum');
                
                this.isDragging = false;
                this.triangleRect = null;
                
                // Position initiale au centre
                this.cursorX = 0.5;
                this.cursorY = 2/3; // Centre du triangle équilatéral
                
                this.init();
            }
            
            init() {
                // Use pointer events instead of mouse/touch events
                this.cursor.addEventListener('pointerdown', this.startDrag.bind(this));
                this.triangle.addEventListener('click', this.handleClick.bind(this));
                document.addEventListener('pointermove', this.handleDrag.bind(this));
                document.addEventListener('pointerup', this.stopDrag.bind(this));
                document.addEventListener('pointercancel', this.stopDrag.bind(this));
                
                // Remove old touch events as they're no longer needed
                // Keep resize event
                window.addEventListener('resize', this.updateRect.bind(this));
                
                this.updateRect();
                this.updatePosition();
                this.updateValues();
            }
            
            updateRect() {
                this.triangleRect = this.triangle.getBoundingClientRect();
            }
            
            startDrag(e) {
                e.preventDefault();
                this.isDragging = true;
                if (e.target.setPointerCapture) {
                    e.target.setPointerCapture(e.pointerId);
                }
                this.updateRect();
            }
            
            stopDrag() {
                this.isDragging = false;
            }
            
            handleClick(e) {
                if (!this.isDragging) {
                    this.updateRect();
                    this.updateCursorFromEvent(e);
                }
            }
            
            handleTouch(e) {
                e.preventDefault();
                this.updateRect();
                this.updateCursorFromEvent(e.touches[0]);
            }
            
            handleDrag(e) {
                if (!this.isDragging) return;
                e.preventDefault();
                
                const clientX = e.clientX || (e.touches && e.touches[0].clientX);
                const clientY = e.clientY || (e.touches && e.touches[0].clientY);
                
                if (clientX !== undefined && clientY !== undefined) {
                    requestAnimationFrame(() => {
                        this.updateCursorFromEvent({ clientX, clientY });
                    });
                }
            }
            
            updateCursorFromEvent(e) {
                const rect = this.triangleRect;
                const x = (e.clientX - rect.left) / rect.width;
                const y = (e.clientY - rect.top) / rect.height;
                
                // Contraindre à l'intérieur du triangle
                const constrainedPos = this.constrainToTriangle(x, y);
                this.cursorX = constrainedPos.x;
                this.cursorY = constrainedPos.y;
                
                this.updatePosition();
                this.updateValues();
            }
            
            constrainToTriangle(x, y) {
                // Définir les sommets du triangle (coordonnées normalisées)
                const vertices = [
                    { x: 0.5, y: 0 },    // Sommet A (haut)
                    { x: 0, y: 1 },      // Sommet B (bas gauche)
                    { x: 1, y: 1 }       // Sommet C (bas droite)
                ];
                
                // Vérifier si le point est à l'intérieur du triangle
                if (this.isInsideTriangle(x, y, vertices)) {
                    return { x, y };
                }
                
                // Si à l'extérieur, projeter sur l'arête la plus proche
                return this.projectToTriangle(x, y, vertices);
            }
            
            isInsideTriangle(x, y, vertices) {
                const [v0, v1, v2] = vertices;
                
                const denom = (v1.y - v2.y) * (v0.x - v2.x) + (v2.x - v1.x) * (v0.y - v2.y);
                const a = ((v1.y - v2.y) * (x - v2.x) + (v2.x - v1.x) * (y - v2.y)) / denom;
                const b = ((v2.y - v0.y) * (x - v2.x) + (v0.x - v2.x) * (y - v2.y)) / denom;
                const c = 1 - a - b;
                
                return a >= 0 && b >= 0 && c >= 0;
            }
            
            projectToTriangle(x, y, vertices) {
                const [v0, v1, v2] = vertices;
                const edges = [
                    [v0, v1], [v1, v2], [v2, v0]
                ];
                
                let minDist = Infinity;
                let closestPoint = { x, y };
                
                edges.forEach(([p1, p2]) => {
                    const projected = this.projectPointToSegment(x, y, p1, p2);
                    const dist = Math.pow(projected.x - x, 2) + Math.pow(projected.y - y, 2);
                    
                    if (dist < minDist) {
                        minDist = dist;
                        closestPoint = projected;
                    }
                });
                
                return closestPoint;
            }
            
            projectPointToSegment(px, py, p1, p2) {
                const dx = p2.x - p1.x;
                const dy = p2.y - p1.y;
                
                if (dx === 0 && dy === 0) return p1;
                
                const t = Math.max(0, Math.min(1, ((px - p1.x) * dx + (py - p1.y) * dy) / (dx * dx + dy * dy)));
                
                return {
                    x: p1.x + t * dx,
                    y: p1.y + t * dy
                };
            }
            
            updatePosition() {
                const rect = this.triangleRect || this.triangle.getBoundingClientRect();
                const pixelX = this.cursorX * rect.width;
                const pixelY = this.cursorY * rect.height;
                
                this.cursor.style.left = `${pixelX}px`;
                this.cursor.style.top = `${pixelY}px`;
            }
            
            updateValues() {
                // Convertir les coordonnées en coordonnées barycentriques
                const barycentric = this.cartesianToBarycentric(this.cursorX, this.cursorY);
                
                // Mettre à jour l'affichage
                this.valueA.textContent = barycentric.a.toFixed(2);
                this.valueB.textContent = barycentric.b.toFixed(2);
                this.valueC.textContent = barycentric.c.toFixed(2);
                this.sum.textContent = (barycentric.a + barycentric.b + barycentric.c).toFixed(3);
                
                // Déclencher un événement personnalisé avec les valeurs
                const event = new CustomEvent('triangularSliderChange', {
                    detail: {
                        a: barycentric.a,
                        b: barycentric.b,
                        c: barycentric.c
                    }
                });
                document.dispatchEvent(event);
            }
            
            cartesianToBarycentric(x, y) {
                // Sommets du triangle en coordonnées normalisées
                const v0 = { x: 0.5, y: 0 };    // A (haut)
                const v1 = { x: 0, y: 1 };      // B (bas gauche)
                const v2 = { x: 1, y: 1 };      // C (bas droite)
                
                // Calcul des coordonnées barycentriques
                const denom = (v1.y - v2.y) * (v0.x - v2.x) + (v2.x - v1.x) * (v0.y - v2.y);
                const a = ((v1.y - v2.y) * (x - v2.x) + (v2.x - v1.x) * (y - v2.y)) / denom;
                const b = ((v2.y - v0.y) * (x - v2.x) + (v0.x - v2.x) * (y - v2.y)) / denom;
                const c = 1 - a - b;
                
                // Normaliser pour s'assurer que la somme = 1
                const sum = a + b + c;
                return {
                    a: Math.max(0, a / sum),
                    b: Math.max(0, b / sum),
                    c: Math.max(0, c / sum)
                };
            }
            
            // Méthode publique pour définir les valeurs programmatiquement
            setValues(a, b, c, normalize = true) {
                if (normalize) {
                    // Normalize only when using the slider (default behavior)
                    const sum = a + b + c;
                    a = a / sum;
                    b = b / sum;
                    c = c / sum;
                }
                
                // Convert to cartesian coordinates
                const cartesian = this.barycentricToCartesian(a, b, c);
                this.cursorX = cartesian.x;
                this.cursorY = cartesian.y;

                
                // Update display
                this.valueA.textContent = a.toFixed(2);
                this.valueB.textContent = b.toFixed(2);
                this.valueC.textContent = c.toFixed(2);
                this.sum.textContent = (a + b + c).toFixed(2);
                
                // Trigger event with the actual values
                const event = new CustomEvent('triangularSliderChange', {
                    detail: { a, b, c }
                });
                document.dispatchEvent(event);
            }
            
            barycentricToCartesian(a, b, c) {
                // Sommets du triangle
                const v0 = { x: 0.5, y: 0 };
                const v1 = { x: 0, y: 1 };
                const v2 = { x: 1, y: 1 };
                
                return {
                    x: a * v0.x + b * v1.x + c * v2.x,
                    y: a * v0.y + b * v1.y + c * v2.y
                };
            }
            
            // Méthode pour obtenir les valeurs actuelles
            getValues() {
                const barycentric = this.cartesianToBarycentric(this.cursorX, this.cursorY);
                return {
                    a: barycentric.a,
                    b: barycentric.b,
                    c: barycentric.c
                };
            }
        }

