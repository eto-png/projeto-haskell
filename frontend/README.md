# Review Guardian

{

  "project": {

    "name": "LocalSEO Sentinel",

    "version": "0.1.0-mvp",

    "description": "Dashboard de monitoramento, resposta com IA e gestão de reputação no Google Meu Negócio para pequenos negócios e prestadores de serviço.",

    "tech_stack": {

      "frontend": "React, Tailwind CSS, Lucide Icons, Shadcn UI",

      "backend": {

        "language": "Haskell",

        "framework": "Servant",

        "server": "Warp",

        "serialization": "Aeson",

        "api_base_url": "http://localhost:8080/api/v1"

      }

    }

  },

  "theme": {

    "colors": {

      "primary": "#0f172a",

      "accent_emerald": "#10b981",

      "warning_amber": "#f59e0b",

      "danger_red": "#ef4444",

      "background": "#f8fafc",

      "card_bg": "#ffffff"

    },

    "typography": "Inter, sans-serif"

  },

  "layout": {

    "header": {

      "title": "LocalSEO Sentinel",

      "subtitle": "Gestão de Reputação & Google Meu Negócio",

      "metrics_bar": [

        {

          "label": "Nota Média Google",

          "value": "4.8 ★",

          "color": "emerald"

        },

        {

          "label": "Avaliações no Mês",

          "value": "24",

          "color": "slate"

        },

        {

          "label": "Pendentes de Resposta",

          "value": "3",

          "color": "amber"

        }

      ]

    },

    "tabs": [

      {

        "id": "reviews_feed",

        "label": "Feed de Avaliações",

        "icon": "MessageSquare",

        "components": [

          {

            "name": "ReviewCard",

            "props": {

              "fields": ["reviewId", "authorName", "rating", "comment", "createdAt", "isAnswered"],

              "badge": "Análise de Sentimento (Positivo / Neutro / Crítico)",

              "actions": ["Gerar Resposta com IA", "Marcar como Respondido"]

            }

          }

        ]

      },

      {

        "id": "whatsapp_collector",

        "label": "Solicitar Reviews (WhatsApp)",

        "icon": "Share2",

        "components": [

          {

            "name": "QuickInviteForm",

            "inputs": [

              { "name": "clientName", "type": "text", "placeholder": "Nome do Cliente" },

              { "name": "clientPhone", "type": "tel", "placeholder": "(00) 00000-0000" }

            ],

            "action": "Gerar Link & Abrir WhatsApp Web"

          }

        ]

      },

      {

        "id": "fake_review_dispute",

        "label": "Contestar Avaliação Falsa",

        "icon": "ShieldAlert",

        "components": [

          {

            "name": "DisputeGenerator",

            "inputs": [

              { "name": "reviewText", "type": "textarea", "placeholder": "Cole a avaliação suspeita aqui..." }

            ],

            "action": "Gerar Minuta de Remoção para o Google"

          }

        ]

      }

    ],

    "modals": [

      {

        "id": "ai_reply_modal",

        "title": "Assistente de Resposta com IA (Haskell API)",

        "inputs": [

          {

            "name": "tone",

            "type": "select",

            "options": ["Agradecido & SEO Local", "Profissional & Contenção de Danos", "Pedido de Desculpas"]

          }

        ],

        "outputs": [

          { "name": "suggestedReply", "type": "textarea", "readOnly": false },

          { "name": "includeSeoKeywords", "type": "tags_list" }

        ],

        "actions": ["Copiar Resposta", "Enviar via API"]

      }

    ]

  },

  "api_contracts": {

    "notes": "O frontend React deve consumir estes endpoints fornecidos pelo servidor Haskell Servant em http://localhost:8080",

    "endpoints": [

      {

        "method": "GET",

        "path": "/api/v1/reviews",

        "description": "Lista todas as avaliações recebidas do Google Meu Negócio.",

        "response_schema": [

          {

            "reviewId": "String",

            "authorName": "String",

            "rating": "Int",

            "comment": "String",

            "createdAt": "String",

            "isAnswered": "Bool"

          }

        ]

      },

      {

        "method": "POST",

        "path": "/api/v1/generate-reply",

        "description": "Envia a avaliação para o backend Haskell processar a sugestão de resposta tipo-segura.",

        "request_body": {

          "reviewText": "String",

          "starRating": "Int",

          "tone": "String"

        },

        "response_schema": {

          "suggestedReply": "String",

          "includeSeoKeywords": ["String"]

        }

      }

    ]

  }

}

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/db53aa66-dca7-59ce-919b-a59bc5632afa).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
