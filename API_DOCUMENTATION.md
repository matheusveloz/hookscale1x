# API Documentation

Documentação completa dos endpoints da API do HookScale.

## Endpoints

### 1. Upload de Vídeos

**POST** `/api/upload`

Faz upload de vídeos de hooks e bodies para o Vercel Blob e cria um job de processamento.

#### Request
- **Content-Type**: `multipart/form-data`
- **Body**:
  - `hooks`: File[] - Arquivos de vídeo hook (.mp4)
  - `bodies`: File[] - Arquivos de vídeo body (.mp4)

#### Response
```json
{
  "jobId": "uuid",
  "totalCombinations": 100,
  "message": "Upload successful"
}
```

#### Validações
- Apenas arquivos .mp4
- Tamanho máximo: 100MB por arquivo (configurável)
- Pelo menos 1 hook e 1 body

---

### 2. Detalhes do Job

**GET** `/api/job?id={jobId}`

Retorna informações sobre um job e suas combinações.

#### Query Parameters
- `id` (required): UUID do job

#### Response
```json
{
  "job": {
    "id": "uuid",
    "name": "Job 09/01/2026",
    "status": "pending|processing|completed|failed",
    "total_combinations": 100,
    "processed_count": 0,
    "created_at": "2026-01-09T10:00:00Z",
    "updated_at": "2026-01-09T10:00:00Z"
  },
  "combinations": [
    {
      "id": "uuid",
      "job_id": "uuid",
      "hook_id": "uuid",
      "body_id": "uuid",
      "output_filename": "hook01_body01.mp4",
      "blob_url": "https://...",
      "status": "pending|processing|completed|failed",
      "error": null,
      "created_at": "2026-01-09T10:00:00Z"
    }
  ]
}
```

---

### 3. Processar Combinações (SSE)

**POST** `/api/process`

Inicia o processamento das combinações de um job e retorna um stream SSE com progresso em tempo real.

#### Request
```json
{
  "jobId": "uuid"
}
```

#### Response
**Content-Type**: `text/event-stream`

Stream de eventos no formato:
```
data: {"status":"processing","progress":10,"total":100,"currentFile":"hook01_body01.mp4","percentage":10}

data: {"status":"processing","progress":20,"total":100,"currentFile":"hook01_body02.mp4","percentage":20}

data: {"status":"completed","progress":100,"total":100,"message":"Processamento concluído!"}
```

#### Eventos SSE

**Durante processamento:**
```json
{
  "status": "processing",
  "progress": 32,
  "total": 100,
  "currentFile": "hook01_body05.mp4",
  "percentage": 32
}
```

**Ao completar:**
```json
{
  "status": "completed",
  "progress": 100,
  "total": 100,
  "message": "Processamento concluído!"
}
```

**Em caso de erro:**
```json
{
  "status": "failed",
  "error": "Error message"
}
```

---

### 4. Download Individual

**GET** `/api/download?id={combinationId}`

Faz download de um vídeo processado específico.

#### Query Parameters
- `id` (required): UUID da combinação

#### Response
- **Success**: Redirect 302 para URL do Blob
- **Error**: JSON com mensagem de erro

---

### 5. Download em Lote (ZIP)

**GET** `/api/download-zip?jobId={jobId}`

Gera e faz download de um arquivo ZIP contendo todos os vídeos processados de um job.

#### Query Parameters
- `jobId` (required): UUID do job

#### Response
- **Content-Type**: `application/zip`
- **Content-Disposition**: `attachment; filename="hookscale-job-{jobId}.zip"`

Stream do arquivo ZIP sendo gerado em tempo real.

---

## Códigos de Status

### Success
- `200` - OK
- `302` - Redirect (download)

### Client Errors
- `400` - Bad Request (validação falhou)
- `404` - Not Found (recurso não encontrado)

### Server Errors
- `500` - Internal Server Error

---

## Estrutura do Banco de Dados

### Table: jobs
```sql
id: UUID (PK)
name: VARCHAR(255)
status: VARCHAR(50) -- pending, processing, completed, failed
total_combinations: INTEGER
processed_count: INTEGER
created_at: TIMESTAMP
updated_at: TIMESTAMP
```

### Table: videos
```sql
id: UUID (PK)
job_id: UUID (FK -> jobs.id)
type: VARCHAR(10) -- hook, body
filename: VARCHAR(255)
blob_url: TEXT
duration: FLOAT
file_size: INTEGER
uploaded_at: TIMESTAMP
```

### Table: combinations
```sql
id: UUID (PK)
job_id: UUID (FK -> jobs.id)
hook_id: UUID (FK -> videos.id)
body_id: UUID (FK -> videos.id)
output_filename: VARCHAR(255)
blob_url: TEXT
status: VARCHAR(50) -- pending, processing, completed, failed
error: TEXT
created_at: TIMESTAMP
```

---

## Fluxo Completo

```
1. Cliente faz upload de vídeos
   POST /api/upload → jobId

2. Cliente navega para página do job
   GET /api/job?id={jobId} → job details

3. Cliente inicia processamento
   POST /api/process → SSE stream
   
4. Cliente recebe atualizações em tempo real
   SSE events com progresso

5. Ao completar, cliente pode baixar
   GET /api/download?id={combinationId}
   GET /api/download-zip?jobId={jobId}
```

---

## Limites e Restrições

### Vercel Hobby
- Timeout: 10 segundos
- Memória: 1024 MB
- Não recomendado para este projeto

### Vercel Pro (Recomendado)
- Timeout: 300 segundos (5 minutos)
- Memória: 3008 MB
- `/tmp` storage: 512 MB

### Rate Limits
- Depende do plano da Vercel
- Recomenda-se implementar throttling no cliente

---

## Exemplos de Uso

### Upload com fetch
```javascript
const formData = new FormData();
hookFiles.forEach(file => formData.append('hooks', file));
bodyFiles.forEach(file => formData.append('bodies', file));

const response = await fetch('/api/upload', {
  method: 'POST',
  body: formData
});

const { jobId } = await response.json();
```

### Conectar ao SSE
```javascript
const eventSource = new EventSource(`/api/process?jobId=${jobId}`);

eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log(`Progress: ${data.percentage}%`);
  
  if (data.status === 'completed') {
    eventSource.close();
  }
};
```

### Download em lote
```javascript
window.open(`/api/download-zip?jobId=${jobId}`, '_blank');
```
