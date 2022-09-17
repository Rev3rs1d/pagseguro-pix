/* eslint-disable camelcase */
import axios, { AxiosInstance } from 'axios'
import fs from 'fs'
import https from 'https'

/**
 * Pagseguro Credentials
 */
type PagseguroAuthCrendetials = {
  /**
   * Caminho do certficado`key`
   */
  readonly keyCertificate: string
  /**
   * Caminho do certficado`crt`
   */
  readonly certificate: string
  /**
   * `Client Id` obtido com a equipe de homologação do pagseguro
   */
  readonly clientId: string
  /**
   * `Secret Id` obtido com a equipe de homologação do pagseguro.
   */
  readonly clientSecret: string
}

type Oauth2Params = {
  grant_type: string
  scope: string
}

/**
 * `cob.write`	- Permissão para alteração de cobranças imediatas
 *
 * `cob.read`	- Permissão para consulta de cobranças imediatas
 *
 * `pix.write`	- Permissão para alteração de Pix
 *
 * `pix.read`	- Permissão para consulta de Pix
 *
 * `webhook.write` - Permissão para alteração do webhook
 *
 * `webhook.read`	- Permissão para consulta do webhook
 *
 * `payloadlocation.write` -	Permissão para alteração de payloads
 *
 * `payloadlocation.read`	- Permissão para consulta de payloads
 *
 */
type OauthScopes =
  | 'pix.read'
  | 'pix.write'
  | 'cob.read'
  | 'cob.write'
  | 'webhook.write'
  | 'webhook.write'
  | 'webhook.read'
  | 'payloadlocation.write'
  | 'payloadlocation.read'

export type AditionalInfo = {
  /**
   * Nome do campo
   */
  nome: string
  /**
   * Dados do campo
   */
  valor: string | string
}

export type ChargeStatus =
  | 'ATIVA'
  | 'CONCLUIDA'
  | 'REMOVIDA_PELO_USUARIO_RECEBEDOR'
  | 'REMOVIDA_PELO_PSP'

export type Debtor = {
  /**
   * CPF da pessoa física devedora
   */
  cpf?: string | string
  /** CNPJ da pessoa jurídica devedora
   *
   */
  cnpj?: string | number
  /**
   * CNPJ da pessoa jurídica devedora
   */
  nome?: string
}

export type Calendar = {
  /**
   * Representa o tempo de vida da cobrança, especificado em segundos a partir da data de criação
   */
  expiracao: number | string
  /**
   * Representa o momento em que a cobrança foi criada. Exemplo: 2020-09-09T20:15:00.358Z
   */
  criacao?: string
}

export type ChargeBack = {
  /**
   * ID gerado pelo cliente para representar unicamente uma devolução
   */
  id: string
  /**
   * ReturnIdentification que transita na PACS004
   */
  rtrid: string
  /**
   * Valor a Devolver
   */
  valor: string | number
  /**
   * Horários em que uma devolução foi solicitada e se aplicável, liquidada
   */
  horario: {
    /**
     * Horário no qual a devolução foi solicitada no PSP
     */
    solicitacao: string
    /**
     * Horário no qual a devolução foi liquidada no PSP
     */
    liquidacao: string
  }

  /**
   * Status da devolução
   */
  status: 'EM_PROCESSAMENTO' | 'DEVOLVIDO' | 'NAO_REALIZADO'
  /**
   * Descrição do status da devolução. Exemplos:
   *
   *
   * `REFUND_TRANS_INVALID_REFUND_VALUE_LESS_THAN_ALLOWED`
   *
   * `REFUND_TRANS_INVALID_REFUND_VALUE_GREATER_THAN_ALLOWED`
   *
   * `REFUND_TRANS_INVALID_INSUFFICIENT_BALANCE`
   *
   * `REFUND_TRANS_UNKNOWN_TRANSACTION_EXCEPTION`
   *
   * `REFUND_TRANS_PM_UNSUPPORTED`
   *
   * `PARTIAL_REFUND_EXCEPTION`
   *
   * `REFUND_TRANS_PIN_REPLACEMENT_EXCEPTION`
   */
  motivo: string
}

/**
 * Pix received informations
 */
export type PixReceivedInfo = {
  /**
   * O parâmetro, obrigatório, representa o ID fim a fim da transação que transita na PACS002, PACS004 e PACS008. O e2eid fica disponível após uma cobrança estar concluída e você pode encontrá-lo no response da consulta da cobrança get/cob.
   */
  endToEndId: string
  /**
   * O parâmetro, obrigatório, representa o identificador único da cobrança
   */
  txid: string
  /*
   * Representa o valor do PIX
   */
  valor: string
  /**
   * Horário em que o Pix foi processado no PSP
   */
  horario: string
  /**
   * Representa quem efetivamente quem realizou o pagamento, podendo ser diferente do vendedor. Um CPF pode ser o devedor de uma cobrança, mas pode acontecer de outro CPF realizar o pagamento
   */
  pagador?: Debtor
  cpf?: Debtor['cpf']
  cnpj?: Debtor['cnpj']
  nome?: Debtor['nome']
  /**
   * Informações livres do pagador
   */
  infopagador?: string
  /**
   * Organiza informações de devoluções vinculadas à cobrança
   */
  devolucoes?: ChargeBack[]
}

/**
 * Charge object
 *
 * @see https://documenter.getpostman.com/view/10863174/TVetc6HV#3322de97-b3cc-453a-81a7-b3c2e34c8016
 */
export type FullCharge = {
  /**
   * O campo txid, obrigatório, representa uma cobrança e é único por CPF/CNPJ do usuário recebedor. O objetivo desse campo é ser um elemento que possibilite ao usuário recebedor a funcionalidade de conciliação de pagamentos. O txid é criado exclusivamente pelo usuário recebedor e está sob sua responsabilidade
   */
  txid: string
  /**
   * Organiza informações a respeito de controle de tempo da cobrança, sua data de criação e expiração
   */
  calendario?: Calendar
  /**
   * Identificam o devedor, ou seja, a pessoa ou a instituição a quem a cobrança está endereçada. Não identifica, necessariamente, quem irá efetivamente realizar o pagamento. Um CPF pode ser o devedor de uma cobrança, mas pode acontecer de outro CPF realizar o pagamento
   */
  devedor?: Debtor
  /**
   * Os campos que indicam valores monetários obedecem a especificação onde o separador decimal é o caracter ponto (.), não é aplicável utilizar separador de milhar. Exemplos: “1.00”, “123.99”, “123456789.23” \
   */
  valor: {
    /**
     * Representa o valor original total da cobrança
     */
    original: string
  }
  /**
   * O campo chave, determina a chave Pix registrada no DICT que será utilizada para endereçar a cobrança. Para fins de teste, em ambiente de Sandbox, qualquer chave é válida. A chave (CPF, CPNPJ, eMail, telefone, chave aleatória) pode ser cadastrada na área logada da sua conta PagSeguro, app ou web.
   */
  chave: string
  /**
   * O campo solicitacaoPagador, determina um texto a ser apresentado ao pagador para que ele possa digitar uma informação correlata, em formato livre, a ser enviada ao recebedor
   */
  solicitacaoPagador?: string
  /**
   * Organiza informações adicionais que, se utilizadas, devem ser apresentadas ao usuário pagador
   */
  infoAdicionais?: AditionalInfo[]
  /**
   * Revisão da cobrança, sempre começa em zero e varia em acréscimos de 1 a cada alteração dos dados da cobrança
   */
  revisao: number
  /**
   * Representa a localização do payload de cobrança
   */
  location: string
  /**
   * Representa o status de uma cobrança
   *
   * `ATIVA:` _Cobrança criada._
   *
   * `CONCLUIDA:` _Indica que a cobrança foi paga e não pode aceitar outro pagamento. Importante destacar que o estado CONCLUÍDA refere-se à cobrança gerada e não à liquidação da obrigação em si_
   *
   * `REMOVIDA_PELO_USUARIO_RECEBEDOR:` _obrança removida pelo requisitante, usuário recebedor._
   *
   * `REMOVIDA_PELO_PSP:` _Cobrança removida pela Pagseguro._
   */
  status: ChargeStatus
  /**
   * Organiza informações dos recebimentos vinculados à uma cobrança
   */
  pix?: PixReceivedInfo
  /**
   * Payload do pix
   */
  pixCopiaECola: string
  /**
   * Imagem do Qr Code
   */
  urlImagemQrCode: string
}

/**
 * Partial charge object
 */
type PartialCharge = Omit<FullCharge, 'pix'>

/**
 * Create charge parameters
 */
type CreateChargeParams = Omit<
  PartialCharge,
  | 'revisao'
  | 'status'
  | 'location'
  | 'txid'
  | 'pixCopiaECola'
  | 'urlImagemQrCode'
>

/**
 * Cancell/Revise charge parameters
 */
type ReviseChargeParams = Omit<
  Partial<PartialCharge>,
  | 'revisao'
  | 'location'
  | 'txid'
  | 'calendario'
  | 'chave'
  | 'infoAdicionais'
  | 'pixCopiaECola'
  | 'urlImagemQrCode'
>

/**
 * Dates for filter list or charges
 */
type QueryParams = {
  txid?: FullCharge['txid']

  /**
   * Data inicio - `ISO string`
   *
   * ```
   * new Date(...).toISOString()
   *
   * ```
   *
   */
  inicio: string

  /**
   * Data fim - `ISO string`
   *
   * ```
   * new Date(...).toISOString()
   *
   * ```
   *
   */
  fim: string
  cpf?: Debtor['cpf']
  nome?: Debtor['nome']
  cnpj?: Debtor['cnpj']
  status?: ChargeStatus
}

/**
 * Refund charge request params
 */
type RefundChargeParams = Pick<PixReceivedInfo, 'endToEndId' | 'valor'> &
  Pick<ChargeBack, 'id'>

/**
 * Get Refund request params
 */
type GetRefundParams = Pick<PixReceivedInfo, 'endToEndId'> &
  Pick<ChargeBack, 'id'>

/**
 * Charge refund response
 */
type RefundChargeResponse = Partial<Omit<ChargeBack, 'motivo'>>

/**
 * Get received pix list params
 */
type GetReceivedPixListParams = Omit<QueryParams, 'status' | 'txid' | 'nome'>

/**
 * Get charge list params
 */
type GetChargeListParams = Omit<QueryParams, 'nome'>

/**
 * Get received pix list response
 */

type GetReceivedPixListResponse<
  QueryArgument extends GetReceivedPixListParams
> = {
  parametros: {
    paginacao: {
      paginaAtual: number
      itensPorPagina: number
      quantidadeDePaginas: number
      quantidadeTotalDeItens: number
    }
  } & QueryArgument
  pix: PixReceivedInfo[] | []
}

/**
 * Webhook details
 */
type WebhookDetails = {
  webhookUrl: string
  chave: string
  criacao: string
}
/**
 * Api client options
 */
type ApiClientConfigs = {
  credentials: PagseguroAuthCrendetials

  /**
   *  Habilita o modo sandbox. Padrão: `false`, as credenciais e certificados, devem estar de acordo com o modo utilizado.
   */
  sandboxMode?: boolean
  timeout?: number
}

/**
 * Pagseguro Oauth2 response
 */
type Oauth2Response = {
  access_token: string
  token_type: string
  expires_in: number
  refresh_token: string
  scope: string
}
/**
 * Convert query object to url params
 *
 * @param query query object
 */
function createQueryParams(query: object) {
  return Object.entries(query)
    .map(([property, value]) => `${property}=${value}`)
    .join('&')
}

/**
 * Pagseguro Client
 */
export class Client {
  #credentials: PagseguroAuthCrendetials

  #baseUrl: string

  #apiIstance: AxiosInstance

  #chargeRevision: number

  /**
   * Cria uma nova instância do cliente
   *
   * ```
   * const client = new Client({
   *  credentials: {
   *    ...
   *  },
   *   timeout: 5000
   * })
   *```
   *
   * // Em modo sandbox
   *
   * ```
   * const client = new Client({
   *  credentials: {
   *    ...
   *  },
   *   timeout: 5000,
   *   sandboxMode: true
   * })
   *```
   * @param configs Configurações da API
   */

  constructor(public readonly configs: ApiClientConfigs) {
    const productionUrl = 'https://secure.api.pagseguro.com'
    const sandboxUrl = 'https://secure.sandbox.api.pagseguro.com'

    this.#credentials = configs.credentials
    this.#baseUrl = configs?.sandboxMode ? sandboxUrl : productionUrl
    this.#chargeRevision = 0
    this.configs = configs
  }

  /**
   * Realiza autenticação do cliente.
   * Este método é obrigatório antes de qualquer outro método que necessite de autorização.
   * ```
   *  // Autenticando
   *
   * await client.auth(['pix.write', 'pix.read', 'cob.write', 'cob.read'])
   *
   * // Depois de criar e autenticar o cliente, você pode usar os outros métodos.
   *
   * await client.createCharge({
   *    ...
   * })
   * ```
   *
   * @param scopes Escopos do cliente
   */
  async auth(scopes: OauthScopes[]) {
    const body: Oauth2Params = {
      grant_type: 'client_credentials',
      scope: scopes.join(' '),
    }
    const basicAuthToken = Buffer.from(
      `${this.#credentials.clientId}:${this.#credentials.clientSecret}`
    ).toString('base64')

    const httpsAgent = new https.Agent({
      rejectUnauthorized: false,
      cert: fs.readFileSync(this.#credentials.certificate),
      key: fs.readFileSync(this.#credentials.keyCertificate),
    })

    const getBearerToken = () =>
      axios.post(`${this.#baseUrl}/pix/oauth2`, body, {
        headers: {
          Authorization: `Basic ${basicAuthToken}`,
          'Content-Type': 'application/json',
        },
        httpsAgent,
      })

    const oauthRequest = await getBearerToken()
    const authorization: Oauth2Response = oauthRequest.data

    const apiInstance = axios.create({
      baseURL: this.#baseUrl,
      httpsAgent,
      timeout: this.configs.timeout ?? 3000,
      headers: {
        Authorization: `Bearer ${authorization.access_token}`,
        'Content-Type': 'application/json',
      },
    })

    this.#apiIstance = apiInstance

    return this
  }

  /**
   * Cria uma cobrança imediata.
   *
   * @param txid Representa uma cobrança e é único por CPF/CNPJ do usuário recebedor. O objetivo desse campo é ser um elemento que possibilite ao usuário recebedor a funcionalidade de conciliação de pagamentos. O txid é criado exclusivamente pelo usuário recebedor e está sob sua responsabilidade
   * @param charge Objeto cobrança
   */
  async createCharge(txid: string, charge: CreateChargeParams) {
    const response = await this.#apiIstance.put(
      `/instant-payments/cob/${txid}`,
      charge
    )
    const chargeCreated: PartialCharge = response.data
    return chargeCreated
  }

  /**
   * Consulta uma cobrança através de um determinado txid. As cobranças estão sujeitas a alterações, e no momento da busca é importante se atentar a isso. Por exemplo:
   * Uma cobrança imediata criada, sem edições posteriores, fica com a revisão "0", caso seja editada, assumiria a revisão "1".
   *
   * Caso o parâmetro `revision` não seja utilizado, seu valor sera definido com base nas cobranças anteriores.
   *
   * @param txid Id/txid da Cbrança
   * @param revision Revisão do pagamento
   */
  async getCharge(txid: string, revision?: number) {
    const response = await this.#apiIstance.get(
      `/instant-payments/cob/${txid}?revisao=${
        revision ?? this.#chargeRevision
      }`
    )
    const charge: PartialCharge = response.data
    return charge
  }

  /**
   * Consulta uma lista de cobranças através de parâmetros data inicio, data fim, txid, status, cpf e cnpj.
   *
   * @param query query params
   */
  async getChargeList(query: GetChargeListParams) {
    const params = createQueryParams(query)
    const response = await this.#apiIstance.get(
      `/instant-payments/cob?${params}`
    )
    const chargeList: PartialCharge[] = response.data
    return chargeList
  }

  /**
   * Atualiza ou cancela uma cobrança.
   *
   * @param txid PIX id/txid
   * @param update Objeto de revisão
   */
  async reviseCharge(txid: string, update: ReviseChargeParams) {
    const response = await this.#apiIstance.patch(
      `/instant-payments/cob/${txid}`,
      update
    )
    this.#chargeRevision += 1

    const chargeUpdated: PartialCharge = response.data
    return chargeUpdated
  }

  /**
   * Recupera um payload que representa a cobrança
   *
   * @param location URL gerada na criação da cobrança e acessada no momento que o usuário pagador efetua a leitura de um QR Code dinâmico gerado pelo recebedor.
   */
  async recoveryCharge(location: string) {
    const response = await this.#apiIstance.request({
      url: `https://${location}`,
      method: 'get',
    })
    const chargePayload: string = response.data
    return chargePayload
  }

  /**
   * Solicita uma devolução total ou parcial através de um e2eid do Pix e do ID da devolução. A devolução pode ser solicitada em até 90 dias após o recebimento do Pix
   * O ID da devolução é único e criado exclusivamente pelo usuário recebedor e está sob sua responsabilidade.
   * É possível realizar várias devoluções até que complete o saldo da cobrança.
   * Para simular o cenário de devolução NÃO REALIZADA basta informar um valor superior ao valor da cobrança.
   *
   * @param refundParams Parâmetros necessários para a devolução da cobrança.
   */
  async requestRefundCharge(refundParams: RefundChargeParams) {
    const response = await this.#apiIstance.put(
      `/instant-payments/pix/${refundParams.endToEndId}/devolucao/${refundParams.id}`,
      {
        valor: refundParams.valor,
      }
    )
    const chargeRefund: RefundChargeResponse = response.data
    return chargeRefund
  }

  /**
   * Consulta um reembolso solicitado.
   *
   * @param refundParams Parâmetros da consulta
   */
  async consultChargeRefund(refundParams: GetRefundParams) {
    const response = await this.#apiIstance.get(
      `/instant-payments/pix/${refundParams.endToEndId}/devolucao/${refundParams.id}`
    )
    const chargeRefund: RefundChargeResponse = response.data
    return chargeRefund
  }

  /**
   * Consulta um Pix através de um End to End ID.
   *
   * @param endToEndId endToEndId
   */
  async getReceivedPix(endToEndId: string) {
    const response = await this.#apiIstance.get(
      `/instant-payments/pix/${endToEndId}`
    )
    const chargeRefund: PixReceivedInfo = response.data
    return chargeRefund
  }

  /**
   * Consulta uma lista de PIX recebidos através dos parâmetros: Data inicio, data fim, se existe uma devolução ou não, cpf e cnpj.
   *
   * @param query Parâmetros da consulta
   */
  async getReceivedPixList<Query extends GetReceivedPixListParams>(
    query: Query
  ) {
    const params = createQueryParams(query)
    const response = await this.#apiIstance.get(
      `/instant-payments/pix/?${params}`
    )
    const chargeRefund: Promise<GetReceivedPixListResponse<Query>> =
      response.data
    return chargeRefund
  }

  /**
   * Configura um webhook PIX
   *
   * @param key Chave pix
   * @param webhookUrl URL que ira receber as notificações
   */
  async configureWebhook(key: string, webhookUrl: string) {
    const response = await this.#apiIstance.put(
      `/instant-payments/webhook/${key}`,
      {
        webhookUrl,
      }
    )
    const webhook: null = response.data
    return webhook
  }

  /**
   * Consulta um webhook PIX
   *
   * @param key Chave pix
   */
  async getWebhook(key: string) {
    const response = await this.#apiIstance.get(
      `/instant-payments/webhook/${key}`
    )
    const webhookDetails: WebhookDetails = response.data
    return webhookDetails
  }

  /**
   * Cancela um webhook
   *
   * @param key Chave pix
   */
  async cancellWebhook(key: string) {
    const response = await this.#apiIstance.delete(
      `/instant-payments/webhook/${key}`
    )
    const webhookCancelled: null = response.data
    return webhookCancelled
  }

  /**
   * Paga uma cobranca PIX
   * Este método funciona apenas no modo sandbox.
   *
   * @param txid PIX id/txid
   */

  async payPix(txid: string) {
    if (!this.configs.sandboxMode)
      throw new Error('This method work only in sandbox mode')

    const response = await this.#apiIstance.post(`/pix/pay/${txid}`, {
      status: 'PAID',
      tx_id: '',
    })
    const pixPaid: Promise<null> = response.data
    return pixPaid
  }
}
