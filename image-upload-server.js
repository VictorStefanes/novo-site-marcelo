/* ========================================
   SISTEMA DE UPLOAD DE IMAGENS DEFINITIVO
   Armazenamento real no servidor
======================================== */

const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp'); // Para redimensionamento
const crypto = require('crypto');

// Configurar diretório de uploads
const uploadsDir = path.join(__dirname, 'uploads', 'properties');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configurar multer para upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        // Gerar nome único
        const uniqueName = crypto.randomUUID() + path.extname(file.originalname);
        cb(null, uniqueName);
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
        files: 10 // máximo 10 arquivos
    },
    fileFilter: (req, file, cb) => {
        // Verificar tipo de arquivo
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Tipo de arquivo não permitido. Use JPG, PNG ou WebP.'));
        }
    }
});

class ImageManager {
    constructor() {
        this.uploadsPath = uploadsDir;
        this.baseUrl = '/uploads/properties/';
    }

    // Processar e otimizar imagem
    async processImage(filePath, options = {}) {
        const {
            width = 800,
            height = 600,
            quality = 85,
            format = 'jpeg'
        } = options;

        try {
            const processedPath = filePath.replace(path.extname(filePath), `_processed${path.extname(filePath)}`);
            
            await sharp(filePath)
                .resize(width, height, { 
                    fit: 'cover',
                    position: 'center'
                })
                .jpeg({ quality })
                .toFile(processedPath);

            // Remover arquivo original
            fs.unlinkSync(filePath);

            return processedPath;
        } catch (error) {
            console.error('Erro ao processar imagem:', error);
            return filePath; // Retornar original se processamento falhar
        }
    }

    // Criar thumbnail
    async createThumbnail(filePath) {
        try {
            const thumbnailPath = filePath.replace(path.extname(filePath), `_thumb${path.extname(filePath)}`);
            
            await sharp(filePath)
                .resize(300, 225, { 
                    fit: 'cover',
                    position: 'center'
                })
                .jpeg({ quality: 80 })
                .toFile(thumbnailPath);

            return thumbnailPath;
        } catch (error) {
            console.error('Erro ao criar thumbnail:', error);
            return null;
        }
    }

    // Obter URL da imagem
    getImageUrl(filename) {
        return this.baseUrl + filename;
    }

    // Remover imagem
    removeImage(filename) {
        try {
            const fullPath = path.join(this.uploadsPath, filename);
            if (fs.existsSync(fullPath)) {
                fs.unlinkSync(fullPath);
            }

            // Remover thumbnail se existir
            const thumbPath = fullPath.replace(path.extname(fullPath), `_thumb${path.extname(fullPath)}`);
            if (fs.existsSync(thumbPath)) {
                fs.unlinkSync(thumbPath);
            }

            return true;
        } catch (error) {
            console.error('Erro ao remover imagem:', error);
            return false;
        }
    }

    // Validar imagem
    async validateImage(filePath) {
        try {
            const metadata = await sharp(filePath).metadata();
            return {
                valid: true,
                width: metadata.width,
                height: metadata.height,
                format: metadata.format,
                size: fs.statSync(filePath).size
            };
        } catch (error) {
            return { valid: false, error: error.message };
        }
    }
}

// Instanciar gerenciador
const imageManager = new ImageManager();

// Rota para upload de imagens
const handleImageUpload = (req, res) => {
    upload.array('images', 10)(req, res, async (err) => {
        if (err) {
            console.error('Erro no upload:', err);
            return res.status(400).json({
                success: false,
                message: err.message
            });
        }

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Nenhuma imagem foi enviada'
            });
        }

        try {
            const processedImages = [];

            for (const file of req.files) {
                // Validar imagem
                const validation = await imageManager.validateImage(file.path);
                if (!validation.valid) {
                    // Remover arquivo inválido
                    fs.unlinkSync(file.path);
                    continue;
                }

                // Processar e otimizar
                const processedPath = await imageManager.processImage(file.path);
                const thumbnailPath = await imageManager.createThumbnail(processedPath);

                const filename = path.basename(processedPath);
                const thumbnailFilename = thumbnailPath ? path.basename(thumbnailPath) : null;

                processedImages.push({
                    id: crypto.randomUUID(),
                    filename: filename,
                    thumbnail: thumbnailFilename,
                    url: imageManager.getImageUrl(filename),
                    thumbnailUrl: thumbnailFilename ? imageManager.getImageUrl(thumbnailFilename) : null,
                    originalName: file.originalname,
                    size: fs.statSync(processedPath).size,
                    dimensions: {
                        width: validation.width,
                        height: validation.height
                    }
                });
            }

            res.json({
                success: true,
                message: `${processedImages.length} imagem(ns) processada(s) com sucesso`,
                images: processedImages
            });

        } catch (error) {
            console.error('Erro ao processar imagens:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno ao processar imagens'
            });
        }
    });
};

// Rota para remover imagem
const handleImageDelete = (req, res) => {
    const { filename } = req.params;
    
    if (!filename) {
        return res.status(400).json({
            success: false,
            message: 'Nome do arquivo não fornecido'
        });
    }

    const removed = imageManager.removeImage(filename);
    
    if (removed) {
        res.json({
            success: true,
            message: 'Imagem removida com sucesso'
        });
    } else {
        res.status(404).json({
            success: false,
            message: 'Imagem não encontrada'
        });
    }
};

// Rota para servir imagens estáticas
const setupStaticImages = (app) => {
    app.use('/uploads/properties', express.static(uploadsDir));
};

module.exports = {
    ImageManager,
    imageManager,
    handleImageUpload,
    handleImageDelete,
    setupStaticImages,
    upload
};