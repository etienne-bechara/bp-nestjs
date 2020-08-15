# NestJS & MikroORM Boilerplate

Um boilerplate opinado, baseado em NestJS e MikroORM com intuito de prover iniciação rápida de projetos em Node.js.

- [Utilização](#utilização)
  * [Depuração](#depuraçãoo)
  * [Boilerplate](#boilerplate)
  * [Dependências](#dependências)
- [Componentes](#componentes)
  * [Frameworks](#frameworks)
  * [Utilitários](#utilitários)
- [Domain](#domain)
- [Settings](#settings)
  * [Variáveis de Ambiente](#variáveis-de-ambiente)
  * [Opções do Serviço](#opções-do-serviço)
- [Entity](#entity)
- [Modules](#modules)
- [Controllers](#controllers)
- [DTO](#dto)
- [Providers](#providers)
- [Middlewares](#middlewares)
- [Interceptors](#interceptors)
- [Filters](#filters)
- [Testes](#testes)
- [Migrations](#migrations)
- [Drafts](#drafts)
  * [API](#api)
  * [CRUD](#crud)


## Utilização

1\. Clone o repositório, e renomeie o `remote` de origem como `boilerplate`:

```shell
git clone https://github.com/etienne-bechara/nestjs-boilerplate.git
git remote rename origin boilerplate
```

2\. [Opcional] Adicione o repositório do seu projeto como `origin`

```shell
git remote add orign https://github.com/eu/meu-projeto.git
```

3\. Crie uma cópia do arquivo `.sample.env` como `.env`.

4\. [Opcional] Customize o arquivo `.env` para sua aplicação.

5\. Execute `npm start` para subir a aplicação.

Envie uma requisição `GET` para `localhost:8080`, o retorno a seguir indica que a aplicação subiu com sucesso:

```json
{
    "error": 404,
    "message": "Cannot GET /",
    "details": {}
}
```

### Depuração

Por padrão, a aplicação irá expor um sessão de debug na porta `9229`.

Ao utilizar a ferramenta `VSCode` como IDE de desevolvimento, basta executar `npm start` e pressionar `F5` para conectar o debugger.

Você pode criar os `breakpoint` diretamente no arquivo `.ts` que eles serão automaticamente mapeados pelos `.js` em execução.

### Boilerplate

Futuramente, para atualizar o boilerplate para a última versão, execute:

```shell
npm run update:boilerplate
```

Caso tenha alterado arquivos na raiz ou no diretório `/source/core` provavelmente será necessário resolver conflitos de merge antes que possa commitar as alterações.

### Dependências

Todas os pacotes que este projeto utiliza estão configurados com a versão exata.

Para realizar atualização dos mesmos, execute um dos scripts a seguir de acordo com o nível de versão que deseja subir.

Siga o padrão Semantic Versioning: `{major}.{minor}.{patch}`

```shell
npm run update:patch
npm run update:minor
npm run update:major
```



## Componentes

Vários dos frameworks que este projeto é composto são opcionais e podem ser facilmente excluídos para economia de memória RAM durante execução.


### Frameworks

Documentação | Reponsabilidades | Observação 
---|---|---
[NestJS](https://docs.nestjs.com/) | • Injeção de Dependências<br>• Inicialização do Servidor (Express)<br>• Middlewares e Fluxos de Validação<br>• Filtro Global de Exceções | Irá carregar automaticamente todos os arquivos nomeados como `*.module.ts`.
[Jest](https://jestjs.io/docs/en/getting-started) | • Testes Unitários<br>• Testes E2E | Instalado apenas em ambiente de desenvolvimento.<br>Crie os arquivos de teste no padrão `*.spec.ts`.
[Sentry](https://www.npmjs.com/package/@sentry/node) | • Monitoramento em Tempo Real<br>• Rastreio de Exceções | **Opcional**<br>Habilite configurando a variável `LOGGER_SENTRY_DSN` no `.env`.<br>Não é possível remover o logger (seu consumo em execução é insignificante).
[MikroORM](https://mikro-orm.io/docs/installation) | • Abstração de Banco de Dados como Entidades<br>• Geração e Execução de Migrations | **Opcional**<br>Habilite configurando as variáveis `ORM_*` no `.env`.<br>Para excluir remova a pasta `/core/orm`.
[Redis](https://www.npmjs.com/package/redis) | • Armazenamento de Dados do Tipo Chave/Valor<br>• Compartilhamento de Alta Performance em Serviços Distribuídos | **Opcional**<br>Habilite configurando as variáveis `REDIS_*` no `.env`.<br>Para excluir remova a pasta `/core/redis`.
[Nodemailer](https://nodemailer.com/about/) | • Envio Automatizado de E-mails | **Opcional**<br>Habilite configurando as variáveis `MAILER_*` no `.env`.<br>Para excluir remova a pasta `/core/mailer`.
[RapidAPI](https://rapidapi.com/) | • Acesso a centenas de APIs prontas<br>• Validação de e-mail e domínio | **Opcional**<br>Habilite configurando a variável `RAPID_API_KEY` no `.env`.<br>Para excluir remova a pasta `/core/rapid-api`.

### Utilitários

Documentação | Reponsabilidades | Utilização 
---|---|---
[Axios](https://www.npmjs.com/package/axios)    | • Requisições HTTP(s) externas | Foi criado um wrapper em torno da bilblioteca para padronização de exceções.<br>Injete o serviço `HttpsService` na classe que deseja utilizar.
[Class Validator](https://www.npmjs.com/package/class-validator) | • Decorators para Validação de Objetos | Dentro da classe, antes da propriedade, utilize um ou mais dos decorators do pacote.<br>No caso dos controllers a validação é aplicada automaticamente.
[Class Transformer](https://www.npmjs.com/package/class-transformer) | • Conversão de Objetos para Classes<br>• Conversão de Tipo de Propriedades | Utilize um dos métodos do pacote em conjunto com os decorators fornecidos.<br>Em geral, não será necessário ao menos que altere algo a nível de boilerplate.
[Moment](https://www.npmjs.com/package/moment) | • Parsing e Formatação de Datas | Inicialize através de `moment()` ou `moment(stringDate)`, e siga os métodos conforme documentação.



## Domain

É o conjunto de todos os componentes que definem um módulo do projeto.

Por exemplo, os usuários, as empresas, a autenticação, a API XPTO externa, etc.

O domínio é representado por uma pasta dentro do diretório `/source`.

Os inclusos no boilerplate estão dentro de `/source/core` para melhor organização.



## Settings

Cada domínio, pode ter uma grupo de configurações definidas em um arquivo `*.settings.ts`.

Ao criar um serviço que extenda a class `AppProvider` (detalhes adiante), é possível obter as recém criadas configurações através do método `this.getSettings()`.

Exemplo:

```ts
export class MailerService extends AppProvider {
  private settings: MailerSettings = this.getSettings();
}
```

As configurações são divididas em duas categorias:

### Variáveis de Ambiente

- Possuem informações sensíveis ou que variam de accordo com o ambiente.
- São declaradas em modelo chave/valor dentro do arquivo `.env` na raiz do projeto.
- Todas são inicializadas como `string`.
- Utilize o decorator `@Transform()` da lib `class-transformer` para convertê-las de tipo.
- Devem ser declaradas sem valor padrão.

Exemplo:

```ts
export class AppSettings {

  @IsIn(['DEVELOPMENT', 'STAGING', 'PRODUCTION'])
  public NODE_ENV: 'DEVELOPMENT' | 'STAGING' | 'PRODUCTION';

  @Transform((v) => parseInt(v))
  @IsNumber()
  public PORT: number;

  @IsOptional()
  @IsString() @IsNotEmpty()
  public APP_AUTHORIZATION: string;

}
```

### Opções do Serviço

- Não possuem informações sensíveis e são idênticas em qualquer ambiente.
- São declaradas dentro do próprio arquivo `*.settings.ts`.
- Devem ser inicializadas com valor padrão.

Exemplo:

```ts
export class AppSettings {

  public APP_TIMEOUT: number = 2 * 60 * 1000;

  public APP_CORS_OPTIONS: CorsOptions | boolean = {
    origin: '*',
    methods: 'GET, POST, PUT, DELETE',
    allowedHeaders: 'Content-Type, Accept',
  };

  public APP_VALIDATION_RULES: ValidationPipeOptions = {
    whitelist: true,
    forbidNonWhitelisted: true,
  };

}
```



## Entity

> Conceito aplicável apenas se utilizado o ORM

Define uma entidade da modelagem de dados, em um banco relacional, podemos considerar como uma tabela.

São definidas pelos arquivos `*.entity.ts` utilizando decorators para configurar tipo das propriedades e relacionamentos.

Refira-se a [Mikro ORM - Decorators Reference](https://mikro-orm.io/docs/decorators/) para todas as opções.


### Predefinidos

Classe | Arquivo | Descrição
---|---|---
OrmIdEntity | `ormid.entity.ts` | Extenda essa classe para já incluir uma coluna UUID primária.
OrmTimestampEntity | `ormtimestamp.entity.ts` | Extenda essa classe para já incluir colunas UUID primária, data de criação e data de atualização.

### Exemplos

```ts
@Entity({ collection: 'user' })
export class UserEntity { 
// utilize extends OrmTimestampEntity acima para simplificar

  @PrimaryKey()
  public id: string = v4();

  @Property()
  @Unique()
  public name!: string;

  @ManyToOne()
  public team!: TeamEntity;

  @Index()
  @Property({ columnType: 'timestamp', onUpdate: () => new Date() })
  public updated: Date = new Date();

  @Index()
  @Property({ columnType: 'timestamp' })
  public created: Date = new Date();

}
```



## Modules

Unifica todos os componentes de um domínio em um arquivo `*.module.ts` que será lido e carregado pela aplicação.

Novas classes de módulos devem ser decoradas com `@Module()` e serão carregadas automaticamente quando o serviço iniciar.

A criação de qualquer componente descrito a seguir, sem integrá-lo em um módulo, implicará no mesmo não ter efeito algum.

Refira-se a [Nest JS - Modules](https://docs.nestjs.com/modules) para mais informações.

### Predefinidos

Classe | Arquivo | Descrição
---|---|---
AppModule | `app.module.ts` | Ponto de entrada da aplicação, carrega todos os outros módulos.
HttpsModule | `https.module.ts` | Carrega o serviço abstraído de requisições HTTP(s) baseado em Axios.
MailerModule | `mailer.module.ts` | Carrega o serviço opcional de envio de e-mails via SMTP.
OrmModule | `orm.module.ts` | Carrega a camada opcional de abstração para armazenamento em banco de dados.
RedisModule | `redis.module.ts` | Carrega o serviço opcional para armazenamento chave/valor de alta performance.



### Exemplos

```ts
@Module({
  controllers: [ UserController ],
  providers: [ UserService ],
  exports: [ UserService ],
})
export class UserModule { }
```



## Controllers

São responsáveis por receber as requisições HTTP, aplicar validações, e redirecionar os dados para o respectivo serviço de manipulação.

Os controllers seguem o padrão `*.controller.ts`, e devem ser criados dentro da pasta de seu respectivo domínio e importados na propriedade `controllers` do módulo correspondente.

Para definir um controller utilize o decorator `@Controller('domain_name')`.

Sendo que `domain_name` será a rota base ao executar requisições HTTP.

Refira-se a [Nest JS - Controllers](https://docs.nestjs.com/controllers) para mais informações.

### Predefinidos

Classe | Arquivo | Descrição
---|---|---
OrmController | `ormcontroller.ts` | Extenda essa classe para já criar métodos GET, GET:id, POST, PUT, PUT:id, e DELETE:id.<br>Aplicável apenas se o ORM estiver habilitado.

### Exemplos

Customizado:

```ts
@Controller('user')
export class UserController {

  public constructor(private readonly userService: UserService) { }

  @Get(':id')
  public async getUser(@Param('id') id: string): Promise<UserData> {
    return this.userService.readUser(id);
  }
  
}
```

Basedo em um serviço de ORM:

```ts
@Controller('user')
export class UserController extends OrmController<UserEntity> {

  public constructor(private readonly userService: UserService) {
    super(userService);

    this.options = {
      dto: {
        read: UserReadDto,
        create: UserCreateDto,
        update: UserUpdateDto,
      },
    };

  }

}
```


## DTO

Data Transfer Objects definem a estrutura de como os dados são transferidos.

Ao criar controllers que recebem dados, você pode injetá-los em argumentos via decorators `@Body()`, `@Query()` e `@Param()`.

Uma vez que definir o tipo deste argumentos como uma classe DTO decorada com opções da biblioteca `class-validator`, suas requisições serão automaticamente validadas.

Crie-os em pastas `*.dto` em arquivos sobre a que método se referem, por exemplo `*.create.dto.ts` ou `*.update.dto.ts`.

Refira-se a [Nest JS - Auto Validation](https://docs.nestjs.com/techniques/validation#auto-validation) para mais informações.

Lista completa de decorators disponíveis em [Class Validator - Decorator Reference](https://github.com/typestack/class-validator#validation-decorators).

### Exemplos

DTO para criação de usuário:

```ts
export class UserCreateDto {

  @IsString() @IsNotEmpty()
  public name: string;

  @IsNumber() @Min(1)
  public age: string;

}
```

Definição de tipo no controller:

```ts
@Controller('user')
export class UserController {

  public constructor(private readonly userService: UserService) { }

  @Post()
  // O fato de definirmos UserCreateDto a seguir irá validar a requisição automaticamente
  public async postUser(@Body() body: UserCreateDto): Promise<UserData> {
    return this.userService.createUser(body);
  }
  
}
```



## Providers

Serviços são componentes que executam um ou mais dentre extração, transformação e carregamento de dados.

A instanciação de suas classes são gerenciadas pela injeção de depências do framwork, por isso devem ser decorados com `@Injectable()`.

Eles podem ter vários tipos includindo Middlewares, Interceptors, Filters, etc, explicados mais adiante.

Para o serviço principal do seu domínio, utilize o padrão `*.service.ts` de nomenclatura e importe-o na propriedade `providers` do módulo respectivo.

Caso deseje que outros módulos tenha acesso ao seu serviço, é necessário exportá-lo na propriedade `exports`

Refira-se a [Nest JS - Providers](https://docs.nestjs.com/providers) para mais informações.


### Predefinidos

Classe | Arquivo | Descrição
---|---|---
AppProvider | `abstract.provider.ts` | Extenda essa classe para já ter acesso ao logger, variáveis de ambiente e método de retry.
OrmService | `ormservice.ts` | Extenda essa classe para já ter acesso a métodos de manipulação de dados via ORM com gerenciamento de exeções nas queries.
HttpsService | `https.service.ts` | Wrapper sobre o Axios para padronizar exceções HTTP e adicionar amenidades.
LoggerService | `logger.service.ts` | Disponível via AppProvider, realiza integração com Sentry e imprime no console durante desenvolvimento.
MailerService | `mailer.service.ts` | Wrapper sobre o Nodemailer para envio automatizado de e-mails.
RedisService | `redis.service.ts` | Wrapper sobre o redis para ler e persistir dados chave/valor em cloud.

### Exemplos

Customizado:

```ts
@Injectable()
export class UserService extends AppProvider {

  /** Implemente seus métodos */

  public async userHello(): Promise<void> {
    this.logger.debug('hello world');
  }

}
```

Baseado em serviço ORM:

```ts
@Injectable()
export class UserService extends OrmService<UserEntity> {

  public constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: EntityRepository<UserEntity>,
  ) {
    super(userRepository, {
      uniqueKey: [ 'name' ],
      populate: [ 'team' ],
    });
  }

}
```

## Middlewares

Executam procedimentos logo que uma requisição HTTP entra e antes de chegar nos interceptors ou controllers.

Devem ser decoradas com `@Injectable()`, implementar `NestMiddleware` e serem aplicadas via `consumer` a nível de módulo.

Refira-se a [Nest JS - Middleware](https://docs.nestjs.com/middleware) para mais informações.

### Predefinidos

Classe | Arquivo | Descrição
---|---|---
AppAuthMiddleware | `app.auth.middleware.ts` | Compara o header `Authorization` com o valor definido em `APP_AUTHORIZATION` e falha se diferente.

### Exemplos

Implementação:
```ts
@Injectable()
export class AppAuthMiddleware extends AppProvider implements NestMiddleware {

  public use(req: AppRequest, res: AppResponse, next: ()=> void): void {

    const authorization = req.headers.authorization;
    if (!authorization && this.settings.APP_AUTHORIZATION) {
      throw new UnauthorizedException('missing authorization header');
    }

    if (authorization !== this.settings.APP_AUTHORIZATION) {
      throw new UnauthorizedException('invalid authorization header');
    }

    next();
  }

}
```

Importação:

```ts
export class AppModule {

  public configure(consumer: MiddlewareConsumer): void {
    consumer
      .apply(
        // Aplique quantos quiser em ordem
        AppAuthMiddleware,
      )
      // Você pode escolher as rotas com:
      // .forRoutes({ method, path }, { method, path });
      .forRoutes('*');
  }

}
```



## Interceptors

Permitem que manipule dados de uma mesma requisição antes de ela atingir um controller bem como após ser tratada por ele.

Úteis caso precise rastrear a trajetória de uma requisição ou aplicar de maneira unifica algo durante seu retorno.

Seguem o padrão `*.interceptor.ts`, e devem ser decorados por `Injectable()` bem como importados no respectivo módulo.

Também devem implementar a classe `NestInterceptor` e retornar um `Observable` o que permite rastrear a requisição e utilizar métodos `rxjs` em seu témino.

Refira-se a [Nest JS - Interceptors](https://docs.nestjs.com/interceptors) para mais informações.

### Predefinidos

Classe | Arquivo | Descrição
---|---|---
AppLoggerInterceptor | `app.logger.interceptor.ts` | Extrai o IP da requisição bem faz o log da entrada e saída da requisição.
AbstractEntityInterceptor | `ormentity.interceptor.ts` | Executa o método `toJSON()` das entidades antes de retorná-las. Aplicável apenas se utilizado o ORM.

### Exemplo

Implementação:

```ts
@Injectable()
export class AppLoggerInterceptor extends AppProvider implements NestInterceptor {

  public intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req: AppRequest = context.switchToHttp().getRequest();

    this.logger.server(`Incoming ${req.url}`);

    return next
      .handle()
      .pipe(
        // Utilize dentro do .pipe qualquer método rxjs
        finalize(() => {
          const res: AppResponse = context.switchToHttp().getResponse();
          this.logger.server(`Finished ${req.url} with status ${res.statusCode}`);
        }),
      );
  }

}
```

Importação:

```ts
@Module({
  providers: [
    { provide: APP_INTERCEPTOR, useClass: AppLoggerInterceptor },
  ],
})
export class AppModule { }
```


## Filters

Filtros são decorados com `@Catch()` e servem o propósito de capturar execeções durante execução do contexto.

Neste boilerplate utilizamos um a nível global para padronização de retorno HTTP, mas eles podem ser individualizados a nível de módulo.

Refira-se a [Nest JS - Exception Filters](https://docs.nestjs.com/exception-filters) para mais informações.

### Predefinidos

Classe | Arquivo | Descrição
---|---|---
AppFilter | `app.filter.ts` | Padroniza o retorno HTTP em caso de exceções.



## Testes

Os testes são baseados no framework Jest, todavia para total isolamento nas execuções, o NestJS provê um pacote para compilação individual de módulos temporários `@nestjs/testing`.

Para usufruir desta funcionalidade, configure seus testes com um método `beforeEach()` implementando `createTestingModule()` conforme exemplo a seguir:

```ts
import { Test } from '@nestjs/testing';
import { HttpsModule } from '../https/https.module';
import { HttpsService } from '../https/https.service';
import { RapidApiService } from './rapid-api.service';

describe('RapidApiService', () => {
  let rapidApiService: RapidApiService;

  beforeEach(async() => {
    const testModule = await Test.createTestingModule({
      imports: [ HttpsModule ],
      providers: [ RapidApiService, HttpsService ],
    }).compile();

    rapidApiService = testModule.get(RapidApiService);
  });

  describe('checkEmailDomain', () => {

    it('should flag e-mail as valid', async() => {
      expect(await rapidApiService.checkEmailDomain('john.doe@gmail.com'))
        .toMatchObject({ valid: true, block: false, disposable: false });
    });

    /* Write more tests here */

  });
});
```

Agora basta executar `npm run test` e todos os testes descritos em arquivos `*.spec.ts` serão aplicados.



## Migrations

>Para utilizar migrations com versionamento e rollback refira-se a documentação oficial: [Mikro ORM - Migrations](https://mikro-orm.io/docs/migrations/)

Este boilerplate permite sincronizar a modelagem atual com as entidades definidas nos arquivos `*.entity.ts`.

Por padrão, é possível possuir até três ambientes configurados em arquivos `.env` separados sendo:

```bash
.env              # Desenvolvimento
.env.staging      # Homologação
.env.production   # Produção
```

Para realizar a migração de sincronismo execute:

```bash
npm run orm:sync:dev  # Utiliza arquivo .env
npm run orm:sync:stg  # Utiliza arquivo .env.staging
npm run orm:sync:prd  # Utiliza arquivo .env.production
```

Caso prefira apenas visualizar a migração e não executá-la, substitua o script `orm:sync` por `orm:dump`. As queries serão impressas no console.



## Drafts

Criar serviços, controllers e DTOs de algo repetitivo pode ser bastante tedioso, sendo assim foi desenvolvido uma maneira mais simples para realizar estas implementações.

### API

Cria todos os arquivos recomendados para implementação de um serviço de API externo.

Dado um domínio de sua escolha, por exemplo: `gmaps`, execute o script:

```
npm run draft:api -- -n gmaps
```

A seguinte estrutura de arquivos será criada dentro de `/source`:

```
gmaps
|- gmaps.dto
   | - index.ts
|- gmaps.interface
   | - index.ts
|- gmaps.service.ts
|- gmaps.settings.ts
```

Agora, por padrão, as variáveis de ambiente `GMAPS_HOST` e `GMAPS_AUTH` serão mandatórias. Você pode configurar a validação no arquivo `gmaps.settings.ts`.

A estratégia de autenticação do modelo é colocar o `*_AUTH` no header `Authorization`. Dependendo do serviço será necessário modificar.



### CRUD

Cria todos os arquivos recomendados para implementação de uma entidade com métodos HTTP de GET, GET:id, POST, PUT, PUT:id, e DELETE:id.

Dado um domínio de sua escolha, por exemplo: `user`, execute o script:

```
npm run draft:crud -- -n user
```

A seguinte estrutura de arquivos será criada dentro de `/source`:

```
user
|- user.dto
   | - index.ts
   | - user.create.dto.ts
   | - user.read.dto.ts
   | - user.update.dto.ts
|- user.controller.ts
|- user.entity.ts
|- user.module.ts
|- user.service.ts
```

Agora é só definir a entidade em `user.entity.ts` e configurar a validação dos dtos que todos os métodos estarão implementados.
