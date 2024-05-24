# BigSteam

BigSteam é um ecommerce de jogos baseado na Steam que permite aos usuários visualizar uma lista de jogos, adicionar ou remover jogos de um carrinho virtual, aplicar descontos e finalizar a compra. O backend foi desenvolvido utilizando NestJS, Prisma e SQLite.

## 🚀 Começando

Estas instruções permitirão que você obtenha uma cópia do projeto em funcionamento na sua máquina local para fins de desenvolvimento e teste.

### 📋 Pré-requisitos

Você precisará ter o Node.js e npm (ou yarn) instalados na sua máquina.

- [Node.js](https://nodejs.org/)
- [npm](https://www.npmjs.com/) ou [yarn](https://yarnpkg.com/)

### 🔧 Instalação

1. Clone o repositório para a sua máquina local:

```bash
git clone https://github.com/Dev-Henrique-Almeida/BigSteam
```

2. Navegue até o diretório do projeto:

```bash
cd BigSteam
```
3. Instale as dependências do projeto:

```bash
npm install
```

4. Configure o banco de dados:
```bash
npx prisma migrate dev
```

5. Inicie o servidor de desenvolvimento:
```bash
npm run start:dev
```
### 🛠️ Como Usar

1 - Ao clonar o projeto e acessar o postman com o arquivo que esta localizado:
```bash
-> src/storage/postman
```
2 - O usuário deve criar uma conta com role sendo "ADMIN" para a criação de produtos, e um outro usuário com role "USER", para a criação de pedidos.
3 - Ao criar um usuário ADMIN, o mesmo deve logar com essa conta, e pode estar criando pedidos, onde tem um endpoint com alguns produtos já pré-inseridos para teste.
4 - Seguindo, deve-se logar com a conta com "USER", e adicionar os produtos ao carrinho, da seguinte forma:
```bash
Exemplo com apenas 1 produtos, com quantidade escolhida como 1:
{
  "productId":[1],
  "quantity": [1]
}

Exemplo com 3 produtos, com quantidade escolhidas:
{
  "productId":[1, 2, 3],
  "quantity": [1, 3, 4]
}
```
5 - Por fim, é só seguir para a criação de um pedido.

### 🛠️ Funcionalidades

#### Produtos
- Visualize uma lista de produtos disponíveis.
- Visualize os detalhes de um produto.
- Visualize a imagem de um produto.
- Adicione novos jogos ao sistema (somente para administradores).
- Atualize as informações dos jogos existentes (somente para administradores).
- Remova jogos do sistema (somente para administradores).

#### Carrinho de Compras
- Adicione jogos ao carrinho.
- Visualize os jogos adicionados ao seu carrinho.
- Aumente ou diminua a quantidade de cada jogo no carrinho.
- Remova jogos do carrinho.
- Visualize o valor total dos jogos no carrinho.
- Limpe todos os itens do carrinho.

#### Pedidos
- Finalize a compra dos jogos no carrinho.
- Visualize a lista de pedidos realizados.
- Veja os detalhes de cada pedido, incluindo os jogos comprados, preços e quantidade.
- Limpe todos os pedidos do usuário.

#### Usuários
- Cadastro de novos usuários.
- Login de usuários existentes.
- Diferentes níveis de acesso: Administradores podem gerenciar produtos, os quais tem como roles:"ADMIN", enquanto usuários comuns podem apenas comprar e visualizar jogos, tendo como roles:"USER".
- Cada usuário possui um carrinho de compras individual.
- Os administradores têm privilégios adicionais para adicionar, atualizar e remover produtos.

### 📂 Estrutura do Projeto
O projeto segue a seguinte estrutura de pastas:

```bash
src/
├── auth/               # Autenticação e autorização
├── cart/               # Gerenciamento do carrinho de compras
├── common/             # Exceções e middlewares comuns
├── orders/             # Gerenciamento de pedidos
├── prisma/             # Configurações do Prisma
├── products/           # Gerenciamento de produtos
├── users/              # Gerenciamento de usuários
└── storage/            # Pasta onde possui o importe para todos os endpoints no postman, onde basta abrir o postman e importar esse arquivo

```

### 📝 Endpoints

#### Autenticação
- **POST /auth/register** - Registrar um novo usuário.
- **POST /auth/login** - Login de um usuário.
  
#### Produtos
- **POST /products** - Adicionar um novo produto (somente ADMIN).
- **POST /products/all** - Adicionar múltiplos produtos (somente ADMIN).
- **GET /products** - Listar todos os produtos.
- **GET /products/:id** - Obter detalhes de um produto.
- **GET /products/:id/image** - Obter a imagem de um produto.
- **PUT /products/:id** - Atualizar um produto (somente ADMIN).
- **DELETE /products/:id** - Remover um produto (somente ADMIN).
- **DELETE /products/all** - Remover todos os produtos (somente ADMIN).

#### Carrinho
- **POST /cart/add** - Adicionar um item ao carrinho.
- **GET /cart** - Visualizar o carrinho.
- **DELETE /cart/clear** - Limpar o carrinho.
  
### Pedidos
- **POST /orders/create** - Criar um pedido.
- **GET /orders** - Visualizar todos os pedidos.
- **DELETE /orders/clear** - Limpar todos os pedidos.

### ✒️ Autor
[Henrique de Almeida Silva - Dev-Henrique-Almeida](https://github.com/Dev-Henrique-Almeida)
