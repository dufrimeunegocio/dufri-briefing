# Roadmap

- [x] Consultar o esquema completo de `public.briefings` no ambiente Live pelo banco e pela API pública.
- [x] Confirmar que os tipos e o `briefingPayload` já refletem exatamente as colunas reais.
- [x] Recarregar o catálogo da API e validar os 28 campos sem criar ou remover registros.
- [x] Diagnosticar o upload: apenas nome local, bucket privado e nenhuma política de upload.
- [x] Implementar upload real no bucket privado logos e associação pelo caminho em logo_file.
- [ ] Testar upload pelo formulário e recuperação do arquivo armazenado sem alterar briefings existentes.
