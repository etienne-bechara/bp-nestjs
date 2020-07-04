## NestJS & MikroORM Boilerplate

### Objetivo

Este é um boilerplate opinado, baseado em NestJS e MikroORM com intuito de prover iniciação rápida de projetos tradicionais em Node.js.

---

## Guia Rápido

### Utilização

1. Clone o repositório, e renomeie o `remote` de origem como `boilerplate`:

```shell
git clone https://github.com/etienne-bechara/nestjs-boilerplate.git
git remote rename origin boilerplate
```

2. [Opcional] Adicione o repositório do seu projeto como `origin`

```shell
git remote add orign https://github.com/eu/meu-projeto.git
```

3. Crie uma cópia do arquivo `.sample.env` como `.env`.

4. [Opcional] Configure o arquivo `.env` para sua aplicação.

5. Execute `npm run dev` para subir a aplicação.

Envie uma requisição `GET` para `localhost:8080`, o retorno a seguir indica que a aplicação subiu com sucesso:

```json
{
    "error": 404,
    "message": "Cannot GET /",
    "details": {}
}
```

### Atualização

Futuramente, se quiser atualizar o boilerplate para a última versão, execute:

```shell
npm run update:boilerplate
```

Caso tenha alterado arquivos no diretório `/source/core` talvez seja necessário resolver conflitos de merge.

### Dependências

Todas os pacotes que este projeto utiliza estão configurados com a versão exata.

Para realizar atualização dos mesmos, execute um dos scripts a seguir de acordo com o nível de versão que deseja subir.

Siga o padrão Semantic Versioning: `${major}.${minor}.${patch}`

```shell
npm run update:patch
npm run update:minor
npm run update:major
```


## Componentes

### Frameworks

Documentação | Reponsabilidades | Observação 
---|---|---
[NestJS](https://docs.nestjs.com/) | • Injeção de Dependências<br>• Inicialização do Servidor (Express)<br>• Middlewares e Fluxos de Validação<br>• Filtro Global de Exceções | Irá carregar automaticamente todos os arquivos nomeados como `*.module.ts`.
[MikroORM](https://mikro-orm.io/docs/installation) | • Abstração de Banco de Dados como Entidades<br>• Geração e Execução de Migrations | **Opcional**<br>Habilite configurando as variáveis `ORM_*` no `.env`.
[Sentry](https://www.npmjs.com/package/@sentry/node) | • Monitoramento em Tempo Real<br>• Rastreio de Exceções | **Opcional**<br>Habilite configurando a variável `LOGGER_SENTRY_DSN` no `.env`.<br>Por padrão apenas erros em ambientes de homologação ou produção serão enviados para a plataforma.
[Redis](https://www.npmjs.com/package/redis) | • Armazenamento de Dados do Tipo Chave/Valor<br>• Compartilhamento de Alta Performance em Serviços Distribuídos | **Opcional**<br>Habilite configurando as variáveis `REDIS_*` no `.env`.

### Bibliotecas

Documentação | Reponsabilidades | Utilização 
---|---|---
[Axios](https://www.npmjs.com/package/axios)    | • Requisições HTTP(s) externas | Foi criado um wrapper em torno da bilblioteca para padronização de exceções.<br>Injete o serviço `HttpsService` na classe que deseja utilizar.
[Class Validator](https://www.npmjs.com/package/class-validator) | • Decorators para Validação de Objetos | Dentro da classe, antes da propriedade, utilize um ou mais dos decorators do pacote.<br>No caso dos controllers a validação é aplicada automaticamente.
[Class Transformer](https://www.npmjs.com/package/class-transformer) | • Conversão de Objetos para Classes<br>• Conversão de Tipagem de Propriedades | Utilize um dos métodos do pacote em conjunto com os decorators fornecidos.<br>Em geral, não será necessário ao menos que altere algo a nível de boilerplate.
[Moment](https://www.npmjs.com/package/moment) | • Parsing e Formatação de Datas | Inicialize através de `moment()` ou `moment(stringDate)`, e siga os métodos conforme documentação.
[Request IP](https://www.npmjs.com/package/moment) | • Detecção de IPs de Origem | Automaticamente aplicado na propriedade `req.metadata.ip` via `AppLoggerMiddleware`.
---

