# Roadmap

- [x] Consultar o esquema completo de `public.briefings` no ambiente Live pelo banco e pela API pública.
- [x] Confirmar que os tipos e o `briefingPayload` já refletem exatamente as colunas reais.
- [x] Recarregar o catálogo da API e validar os 28 campos sem criar ou remover registros.
- [x] Diagnosticar o upload: apenas nome local, bucket privado e nenhuma política de upload.
- [x] Implementar upload real no bucket privado logos e associação pelo caminho em logo_file.
- [x] Testar upload pelo formulário (HTTP 200), recuperação com bytes idênticos e associação em logo_file sem criar ou alterar briefings existentes.
- [ ] Criar login administrativo e autorização segura, sem perfis adicionais.
- [ ] Criar listagem com busca, filtros, ordenação e detalhes na ordem do formulário.
- [ ] Implementar cópia completa, visualização de logos privadas e alteração de status.
- [ ] Testar proteção, login e painel em computador e celular; preservar o formulário público.
