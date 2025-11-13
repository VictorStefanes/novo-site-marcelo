# API Endpoints para Homepage - Documentação

## Visão Geral
Sistema que gerencia os 4 imóveis mais recentes por categoria na homepage.

## Endpoints Necessários

### 1. Mais Procurados
```
GET /api/properties/mais-procurados/recent
```

**Parâmetros de Query:**
- `limit=4` (opcional, padrão 4)
- `order=created_at DESC` (opcional, mais recentes primeiro)

**Resposta:**
```json
{
  "success": true,
  "properties": [
    {
      "id": "IMV_001",
      "codigo": "IMV_001", 
      "titulo": "Apartamento Beira Mar Exclusivo",
      "preco": 1350000,
      "preco_antigo": null,
      "tipo_negocio": "À Venda",
      "quartos": 4,
      "banheiros": 3,
      "vagas": 3,
      "area": 180,
      "bairro": "Ponta Verde",
      "cidade": "Maceió",
      "images": ["url1.jpg", "url2.jpg"],
      "imagem_principal": "url1.jpg",
      "visualizacoes": 500,
      "destaques": ["Vista Mar", "Luxo", "Gourmet"],
      "vista_mar": true,
      "piscina": true,
      "academia": false,
      "created_at": "2025-11-13T10:00:00Z",
      "categoria": "mais-procurados"
    }
  ]
}
```

### 2. Lançamentos
```
GET /api/properties/lancamentos/recent
```

**Resposta Exemplo:**
```json
{
  "success": true,
  "properties": [
    {
      "id": "IMV_002",
      "codigo": "IMV_002",
      "titulo": "Residencial Premium Vista Atlântica", 
      "preco": 850000,
      "preco_antigo": 1000000,
      "desconto": 15,
      "tipo_negocio": "À Venda",
      "quartos": 3,
      "banheiros": 2,
      "vagas": 2,
      "area": 120,
      "bairro": "Pajuçara",
      "cidade": "Maceió",
      "images": ["url1.jpg"],
      "created_at": "2025-11-13T09:00:00Z",
      "categoria": "lancamentos"
    }
  ]
}
```

### 3. Pronto para Morar
```
GET /api/properties/pronto-para-morar/recent
```

**Resposta Exemplo:**
```json
{
  "success": true,
  "properties": [
    {
      "id": "IMV_003",
      "codigo": "IMV_003",
      "titulo": "Casa Moderna Completa",
      "preco": 650000,
      "tipo_negocio": "À Venda",
      "quartos": 3,
      "banheiros": 2,
      "vagas": 2,
      "area": 150,
      "bairro": "Gruta de Lourdes",
      "cidade": "Maceió",
      "images": ["url1.jpg"],
      "created_at": "2025-11-13T08:00:00Z",
      "categoria": "pronto-para-morar"
    }
  ]
}
```

## Integração com Dashboard

### Webhook para Atualizações em Tempo Real
```
POST /api/webhooks/homepage-update
```

**Payload quando novo imóvel é adicionado:**
```json
{
  "event": "property_added",
  "category": "lancamentos",
  "property_id": "IMV_004",
  "timestamp": "2025-11-13T11:00:00Z"
}
```

### JavaScript para Atualização Automática
```javascript
// Quando um imóvel é adicionado no dashboard
function onPropertyAdded(propertyData, category) {
    // Atualiza a homepage automaticamente
    if (window.addHomepageProperty) {
        window.addHomepageProperty(propertyData, category);
    }
}

// Webhook listener (se implementado)
if ('WebSocket' in window) {
    const ws = new WebSocket('ws://localhost:3000/ws');
    ws.onmessage = function(event) {
        const data = JSON.parse(event.data);
        if (data.event === 'property_added') {
            window.updateHomepageProperties(data.category);
        }
    };
}
```

## Campos Obrigatórios por Categoria

### Todos
- `id`, `titulo`, `preco`, `quartos`, `banheiros`, `vagas`, `area`, `bairro`, `created_at`

### Mais Procurados (extras)
- `visualizacoes` (número de visualizações)

### Lançamentos (extras)  
- `desconto` (percentual de desconto)
- `preco_antigo` (preço original se houver desconto)

### Pronto para Morar (extras)
- Nenhum campo extra obrigatório

## Configuração da Base de Dados

### Tabela `properties`
```sql
ALTER TABLE properties ADD COLUMN IF NOT EXISTS visualizacoes INTEGER DEFAULT 0;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS desconto DECIMAL(5,2) DEFAULT 0;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS preco_antigo DECIMAL(12,2) DEFAULT NULL;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS vista_mar BOOLEAN DEFAULT FALSE;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS piscina BOOLEAN DEFAULT FALSE;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS academia BOOLEAN DEFAULT FALSE;

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_properties_category_created ON properties(categoria, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_properties_created_at ON properties(created_at DESC);
```

## Implementação Futura

1. **Cache Redis**: Implementar cache para os 4 imóveis mais recentes
2. **WebSockets**: Atualizações em tempo real
3. **CDN**: Para imagens dos imóveis
4. **Analytics**: Tracking de visualizações e cliques
5. **A/B Testing**: Para otimizar conversão dos cards