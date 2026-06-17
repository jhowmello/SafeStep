# 🚧 SafeStep

Aplicativo mobile desenvolvido em **React Native (Expo)** com foco em **Segurança do Trabalho**, especialmente nas normas **NR-10** e **NR-35**.

O SafeStep garante que técnicos realizem **checklists obrigatórios de segurança** antes de iniciar atividades de risco, reduzindo acidentes e aumentando a conformidade operacional.

---

## 📱 Sobre o Projeto

O SafeStep atua como uma camada de validação em tempo real, exigindo que o usuário confirme:

- Uso correto de EPIs
- Condições de segurança do ambiente
- Validação de certificações (CA)

Ao final, o sistema gera um **log de conformidade**, permitindo rastreabilidade e controle.

---

## 🎯 Objetivo

Minimizar riscos em atividades críticas, como:

- Trabalhos em altura
- Manutenção elétrica
- Instalação de fibra óptica

---

## 👥 Público-Alvo

- Técnicos de campo (eletricistas, instaladores, manutenção)
- Gestores de segurança do trabalho
- Empresas que seguem normas NR-10 e NR-35

---

## 🏗️ Arquitetura

- **Frontend:** React Native (Expo)
- **Navegação:** React Navigation (Stack + Tabs)
- **HTTP Client:** Axios
- **Backend (simulado):** JSON Server (API REST)

---

## ⚙️ Funcionalidades

- 📋 Listagem de ordens de serviço
- ✅ Checklist obrigatório de segurança
- 🪖 Validação de EPIs (CA)
- 📊 Geração de log de conformidade
- ⚡ Performance otimizada com FlatList
- 📡 Simulação de funcionamento offline

---

## 📂 Estrutura do Projeto

```
safestep/
│
├── src/
│   ├── components/      # Componentes reutilizáveis
│   ├── screens/         # Telas do app
│   ├── navigation/      # Configuração de rotas
│   ├── services/        # API (Axios)
│   ├── hooks/           # Hooks personalizados
│
├── db.json              # Banco de dados fake (JSON Server)
├── App.js               # Entry point
└── README.md
```

---

## 🔄 Fluxo do Aplicativo

```
Login
  ↓
Home (Tabs)
  ├── Ordens de Serviço
  │       ↓
  │   Checklist
  │       ↓
  │   Resultado (Aprovado/Reprovado)
  │
  └── Perfil
```

---

## 🗄️ Modelo de Dados (Exemplo)

```json
{
  "tecnicos": [
    {
      "id": 1,
      "nome": "João Silva",
      "matricula": "TEC123"
    }
  ],
  "epis": [
    {
      "id": 1,
      "nome": "Capacete",
      "ca": "12345"
    }
  ],
  "ordensServico": [
    {
      "id": 1,
      "descricao": "Instalação de fibra óptica",
      "local": "Poste 45",
      "tecnicoId": 1,
      "episObrigatorios": [1]
    }
  ]
}
```

---

## 🚀 Como Rodar o Projeto

### 1. Pré-requisitos

- Node.js instalado
- Expo CLI
- App **Expo Go** no celular

---

### 2. Clonar o repositório

```bash
git clone https://github.com/seu-usuario/safestep.git
cd safestep
```

---

### 3. Instalar dependências

```bash
npm install
```

---

### 4. Rodar o backend (JSON Server)

Instale o JSON Server:

```bash
npm install -g json-server
```

Execute:

```bash
json-server --watch db.json --host 0.0.0.0 --port 3000
```

---

### 5. Configurar API

No arquivo de serviço:

```javascript
const api = axios.create({
  baseURL: "http://SEU_IP:3000",
});
```

---

### 6. Rodar o app

```bash
npx expo start
```

---

## 🔌 Variáveis de Ambiente

Crie um arquivo `.env`:

```
API_URL=http://SEU_IP:3000
```

---

## 🧠 Tecnologias Utilizadas

- React Native
- Expo
- React Navigation
- Axios
- JSON Server

---

## 🌐 Possível Evolução (IoT)

O SafeStep pode ser integrado com dispositivos IoT para validação automática de segurança.

### Exemplo:

- Sensor no cinto de segurança (linha de vida)
- Comunicação via Bluetooth (BLE)
- Liberação do checklist apenas se o equipamento estiver conectado

### Tecnologias sugeridas:

- BLE (Bluetooth Low Energy)
- ESP32
- React Native BLE

---

## 📊 Benefícios

- Redução de acidentes
- Aumento da conformidade
- Rastreabilidade de operações
- Prevenção de falhas humanas

---

## 📌 Status do Projeto

🚧 Em desenvolvimento (Projeto acadêmico)

---

## 👨‍💻 Autor

Desenvolvido por **João Gregorio**

---

## 📄 Licença

Este projeto é de uso acadêmico.
