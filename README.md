Modulo não oficial da [API pix](https://dev.pagseguro.uol.com.br/reference/pix-intro) do pagseguro.

## Instalação

npm:

```bash
npm install pagseguro-pix
```

yarn:

```bash
yarn add pagseguro-pix
```

## Uso

```ts
const { Client } = require('pagseguro-pix')

const client = new Client({
  credentials: {
    keyCertificate: `caminho do arquivo .key`,
    certificate: `caminho do arquivo .pem`,
    clientId: 'credencial Client ID',
    clientSecret: 'credencial Client Secret',
  },
})

const example = async () => {
  await client.auth(['pix.write', 'pix.read', 'cob.write', 'cob.read'])

  const txId = '123BAJDH1JASHJVKAE123KEJAUUJ745'

  await client.createCharge(txId, {
    calendario: {
      expiracao: '3600',
    },
    devedor: {
      cpf: '41444444444',
      nome: 'Exemplo',
    },
    valor: {
      original: '1.20',
    },
    chave: '73fa7d23-4d83-4f44-b4eb-9eeec083b1ee',
    solicitacaoPagador: 'Serviço realizado.',
    infoAdicionais: [
      {
        nome: 'Campo 1',
        valor: 'Informação Adicional1 do PSP-Recebedor',
      },
      {
        nome: 'Campo 2',
        valor: 'Informação Adicional2 do PSP-Recebedor',
      },
    ],
  })
}

example()
```

Para detalhes de como obter as credenciais sandbox e produção, consulte os links abaixo:

[Manual de referência](https://dev.pagseguro.uol.com.br/reference/pix-intro)

[Manual de referência, versão postman](https://documenter.getpostman.com/view/10863174/TVetc6HV#3322de97-b3cc-453a-81a7-b3c2e34c8016)
