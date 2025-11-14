/* ========================================
   SISTEMA DE UPLOAD DE IMAGENS COMPLETO
   Solução para upload, preview e remoção
======================================== */

class ImageUploadSystem {
    constructor() {
        this.selectedImages = [];
        this.maxImages = 10;
        this.maxFileSize = 5 * 1024 * 1024; // 5MB
        this.allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        this.init();
    }

    init() {
        console.log('🖼️ Inicializando sistema de upload de imagens...');
        
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupImageUpload());
        } else {
            this.setupImageUpload();
        }
    }

    setupImageUpload() {
        const fileInput = document.getElementById('images');
        const dropZone = document.querySelector('.file-input-help');
        const previewContainer = document.getElementById('imagePreview');

        if (!fileInput || !previewContainer) {
            console.warn('⚠️ Elementos de upload não encontrados');
            return;
        }

        // Event listeners para o input de arquivo
        fileInput.addEventListener('change', (e) => this.handleFileSelect(e));

        // Clique na área de upload abre o seletor de arquivos
        if (dropZone) {
            dropZone.addEventListener('click', () => {
                fileInput.click();
            });
            dropZone.style.cursor = 'pointer';
        }

        // Drag and drop
        if (dropZone) {
            dropZone.addEventListener('dragover', (e) => this.handleDragOver(e));
            dropZone.addEventListener('dragleave', (e) => this.handleDragLeave(e));
            dropZone.addEventListener('drop', (e) => this.handleDrop(e));
        }

        // Limpar imagens quando modal for fechado
        const modal = document.getElementById('propertyModal');
        if (modal) {
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                        if (modal.style.display === 'none' || modal.style.display === '') {
                            this.clearAllImages();
                        }
                    }
                });
            });
            observer.observe(modal, { attributes: true });
        }

        console.log('✅ Sistema de upload configurado');
    }

    handleFileSelect(event) {
        const files = Array.from(event.target.files);
        console.log('📁 Arquivos selecionados:', files.length);
        this.processFiles(files);
    }

    handleDragOver(event) {
        event.preventDefault();
        event.stopPropagation();
        event.currentTarget.classList.add('drag-over');
    }

    handleDragLeave(event) {
        event.preventDefault();
        event.stopPropagation();
        event.currentTarget.classList.remove('drag-over');
    }

    handleDrop(event) {
        event.preventDefault();
        event.stopPropagation();
        event.currentTarget.classList.remove('drag-over');
        
        const files = Array.from(event.dataTransfer.files);
        console.log('📂 Arquivos arrastados:', files.length);
        this.processFiles(files);
    }

    processFiles(files) {
        // Filtrar apenas imagens válidas
        const validFiles = files.filter(file => this.validateFile(file));
        
        if (validFiles.length === 0) {
            alert('❌ Nenhum arquivo válido selecionado. Use JPG, PNG ou WebP (máx. 5MB cada).');
            return;
        }

        // Verificar limite total
        const totalImages = this.selectedImages.length + validFiles.length;
        if (totalImages > this.maxImages) {
            alert(`❌ Máximo de ${this.maxImages} imagens permitido. Você tentou adicionar ${validFiles.length}, mas já tem ${this.selectedImages.length}.`);
            return;
        }

        // Processar cada arquivo
        validFiles.forEach(file => this.addImage(file));
        
        // Limpar input para permitir selecionar o mesmo arquivo novamente se necessário
        const fileInput = document.getElementById('images');
        if (fileInput) fileInput.value = '';
    }

    validateFile(file) {
        // Verificar tipo
        if (!this.allowedTypes.includes(file.type)) {
            console.warn('❌ Tipo de arquivo não permitido:', file.type);
            return false;
        }

        // Verificar tamanho
        if (file.size > this.maxFileSize) {
            console.warn('❌ Arquivo muito grande:', file.size);
            alert(`❌ Arquivo "${file.name}" é muito grande. Máximo: 5MB`);
            return false;
        }

        // Verificar se já existe (evitar duplicatas)
        const isDuplicate = this.selectedImages.some(img => 
            img.name === file.name && img.size === file.size
        );

        if (isDuplicate) {
            console.warn('❌ Arquivo duplicado:', file.name);
            alert(`❌ A imagem "${file.name}" já foi adicionada.`);
            return false;
        }

        return true;
    }

    async addImage(file) {
        try {
            // Criar URL de preview
            const previewUrl = URL.createObjectURL(file);
            
            // Criar objeto de imagem
            const imageObj = {
                id: Date.now() + Math.random(), // ID único
                file: file,
                name: file.name,
                size: file.size,
                previewUrl: previewUrl,
                uploaded: false
            };

            // Adicionar à lista
            this.selectedImages.push(imageObj);
            
            // Atualizar preview
            this.updatePreview();
            
            console.log('✅ Imagem adicionada:', file.name);

        } catch (error) {
            console.error('❌ Erro ao adicionar imagem:', error);
            alert('❌ Erro ao processar imagem: ' + file.name);
        }
    }

    removeImage(imageId) {
        const index = this.selectedImages.findIndex(img => img.id === imageId);
        
        if (index !== -1) {
            const image = this.selectedImages[index];
            
            // Revogar URL de preview para liberar memória
            URL.revokeObjectURL(image.previewUrl);
            
            // Remover da lista
            this.selectedImages.splice(index, 1);
            
            // Atualizar preview
            this.updatePreview();
            
            console.log('🗑️ Imagem removida:', image.name);
        }
    }

    updatePreview() {
        const container = document.getElementById('imagePreview');
        if (!container) return;

        if (this.selectedImages.length === 0) {
            container.innerHTML = '';
            return;
        }

        const html = this.selectedImages.map(image => `
            <div class="image-preview-item" data-image-id="${image.id}">
                <div class="image-preview-wrapper">
                    <img src="${image.previewUrl}" alt="${image.name}" class="preview-image">
                    <div class="image-overlay">
                        <button type="button" class="remove-image-btn" onclick="window.imageUploadSystem.removeImage(${image.id})" title="Remover imagem">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="image-info">
                    <span class="image-name">${image.name}</span>
                    <span class="image-size">${this.formatFileSize(image.size)}</span>
                </div>
            </div>
        `).join('');

        container.innerHTML = `
            <div class="images-grid">
                ${html}
            </div>
            <div class="images-summary">
                <span class="images-count">${this.selectedImages.length} de ${this.maxImages} imagens</span>
                <button type="button" class="clear-all-images-btn" onclick="window.imageUploadSystem.clearAllImages()">
                    <i class="fas fa-trash-alt"></i> Limpar Todas
                </button>
            </div>
        `;
    }

    clearAllImages() {
        // Revogar todas as URLs de preview
        this.selectedImages.forEach(image => {
            URL.revokeObjectURL(image.previewUrl);
        });

        // Limpar lista
        this.selectedImages = [];
        
        // Atualizar preview
        this.updatePreview();
        
        // Limpar input
        const fileInput = document.getElementById('images');
        if (fileInput) fileInput.value = '';
        
        console.log('🧹 Todas as imagens removidas');
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // Método para obter imagens para envio
    getImagesForUpload() {
        return this.selectedImages.map(img => ({
            id: img.id,
            name: img.name,
            file: img.file
        }));
    }

    // Método para converter imagens para base64 (se necessário)
    async convertImagesToBase64() {
        const base64Images = [];
        
        for (const image of this.selectedImages) {
            try {
                const base64 = await this.fileToBase64(image.file);
                base64Images.push({
                    id: image.id,
                    name: image.name,
                    data: base64,
                    type: image.file.type
                });
            } catch (error) {
                console.error('❌ Erro ao converter imagem:', image.name, error);
            }
        }
        
        return base64Images;
    }

    fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
        });
    }

    // Método de teste
    test() {
        console.log('🧪 Testando sistema de upload...');
        console.log('📊 Imagens selecionadas:', this.selectedImages.length);
        console.log('📋 Lista de imagens:', this.selectedImages.map(img => ({
            name: img.name,
            size: this.formatFileSize(img.size)
        })));
    }
}

// Inicializar sistema globalmente
window.imageUploadSystem = new ImageUploadSystem();

// Adicionar estilos CSS dinamicamente
const imageUploadStyles = `
<style id="image-upload-styles">
.image-preview-container {
    margin-top: 15px;
}

.images-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 15px;
    margin-bottom: 15px;
}

.image-preview-item {
    border: 2px solid #e1e8ed;
    border-radius: 8px;
    overflow: hidden;
    background: #f8f9fa;
    transition: all 0.3s ease;
}

.image-preview-item:hover {
    border-color: #d4af37;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.image-preview-wrapper {
    position: relative;
    aspect-ratio: 1;
    overflow: hidden;
}

.preview-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
}

.image-preview-item:hover .preview-image {
    transform: scale(1.05);
}

.image-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0,0,0,0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.3s ease;
}

.image-preview-item:hover .image-overlay {
    opacity: 1;
}

.remove-image-btn {
    background: #dc3545;
    color: white;
    border: none;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s ease;
    font-size: 14px;
}

.remove-image-btn:hover {
    background: #c82333;
    transform: scale(1.1);
}

.image-info {
    padding: 8px;
    text-align: center;
}

.image-name {
    display: block;
    font-size: 12px;
    font-weight: 500;
    color: #333;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin-bottom: 2px;
}

.image-size {
    display: block;
    font-size: 10px;
    color: #666;
}

.images-summary {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 0;
    border-top: 1px solid #e1e8ed;
}

.images-count {
    font-size: 14px;
    color: #666;
    font-weight: 500;
}

.clear-all-images-btn {
    background: #6c757d;
    color: white;
    border: none;
    border-radius: 4px;
    padding: 6px 12px;
    cursor: pointer;
    transition: all 0.3s ease;
    font-size: 12px;
}

.clear-all-images-btn:hover {
    background: #5a6268;
}

.file-input-help.drag-over {
    border-color: #d4af37;
    background: #fefdf8;
    transform: scale(1.02);
}

/* Responsivo */
@media (max-width: 768px) {
    .images-grid {
        grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
        gap: 10px;
    }
    
    .images-summary {
        flex-direction: column;
        gap: 10px;
        text-align: center;
    }
}
</style>
`;

// Adicionar estilos ao head
document.head.insertAdjacentHTML('beforeend', imageUploadStyles);

console.log('🖼️ Sistema de upload de imagens carregado!');
console.log('💡 Comandos de teste:');
console.log('  - window.imageUploadSystem.test() - Ver status');
console.log('  - window.imageUploadSystem.clearAllImages() - Limpar tudo');