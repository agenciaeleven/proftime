import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Shield, ChevronDown } from "lucide-react";

const TERMS_SECTIONS = [
  {
    title: "1. ACEITE",
    content: `Ao acessar a plataforma Proftime, o usuário declara estar ciente de que se trata de uma propriedade intelectual devidamente protegida pela legislação brasileira, incluindo a Lei Geral de Proteção de Dados, a Lei de Direitos Autorais e o Código Penal Brasileiro. Todo o conteúdo disponibilizado, incluindo, mas não se limitando a materiais, métodos, organização, estrutura, funcionalidades, textos, slides e demais elementos da plataforma, é de titularidade exclusiva do Proftime, sendo expressamente vedada qualquer forma de reprodução, cópia, distribuição, compartilhamento, engenharia reversa ou exploração não autorizada.

A tentativa ou prática de cópia, reprodução, compartilhamento ou utilização indevida do conteúdo poderá configurar violação de direitos autorais e demais ilícitos civis, sujeitando o infrator à responsabilização civil, inclusive com obrigação de indenizar por perdas e danos. Sem prejuízo da responsabilidade civil, tais condutas poderão, conforme o caso concreto, ser enquadradas como ilícitos penais, nos termos da legislação brasileira, incluindo o art. 184 do Código Penal, cuja pena pode chegar a até 4 (quatro) anos de reclusão e multa, especialmente quando houver intuito de lucro direto ou indireto.

A plataforma poderá utilizar tecnologias baseadas em inteligência artificial, incluindo ferramentas como o ChatGPT, sendo vedada qualquer tentativa de replicação, extração, engenharia reversa ou uso indevido dos conteúdos e funcionalidades disponibilizados. O descumprimento destas disposições poderá resultar na suspensão ou cancelamento imediato do acesso do usuário, sem direito a reembolso, além da adoção das medidas judiciais cabíveis.

Ao acessar ou utilizar a plataforma, o usuário declara concordância integral. O aceite é registrado com IP, data, hora, user_agent e versão.`
  },
  {
    title: "2. IDENTIFICAÇÃO",
    content: `[INSERIR RAZÃO SOCIAL]
CNPJ: [INSERIR]
Endereço: [INSERIR]
E-mail: [INSERIR]`
  },
  {
    title: "3. OBJETO",
    content: `A plataforma Proftime consiste em ambiente digital que disponibiliza conteúdos educacionais, metodologias, ferramentas tecnológicas e funcionalidades voltadas à otimização de atividades profissionais, podendo incluir recursos baseados em inteligência artificial, automação e análise de dados.

Os serviços prestados possuem natureza digital e são disponibilizados mediante acesso online, não implicando, em hipótese alguma, na transferência de propriedade intelectual ao usuário, mas apenas na concessão de licença limitada, temporária, não exclusiva e intransferível para utilização da plataforma.

A Proftime reserva-se o direito de modificar, atualizar, ampliar ou restringir funcionalidades, conteúdos e serviços, conforme necessidade operacional, técnica ou estratégica, respeitadas as disposições legais aplicáveis.`
  },
  {
    title: "4. PROPRIEDADE INTELECTUAL",
    content: `Todo o conteúdo disponibilizado na plataforma, incluindo, mas não se limitando a textos, materiais, metodologias, estrutura, layout, funcionalidades, códigos, algoritmos, design, identidade visual e demais elementos, é de titularidade exclusiva da Proftime, sendo protegido pela Lei nº 9.610/1998 e demais legislações aplicáveis.

A utilização da plataforma não confere ao usuário qualquer direito de propriedade sobre o conteúdo, mas apenas autorização de uso nos limites estabelecidos nestes Termos.

É expressamente vedado ao usuário:
• copiar, reproduzir, modificar ou distribuir conteúdos da plataforma;
• revender, sublicenciar ou explorar economicamente os materiais;
• realizar engenharia reversa, descompilação ou tentativa de acesso ao código-fonte;
• extrair, replicar ou utilizar a estrutura, lógica ou funcionamento da plataforma para criação de produtos similares.

A violação das disposições acima poderá ensejar responsabilização civil, nos termos dos arts. 186 e 927 do Código Civil, bem como responsabilização penal, nos termos do art. 184 do Código Penal, cuja pena pode chegar a até 4 (quatro) anos de reclusão e multa, quando configurado intuito de lucro.`
  },
  {
    title: "5. CADASTRO, CONTA E RESPONSABILIDADE",
    content: `O acesso à plataforma poderá exigir a realização de cadastro prévio, sendo o usuário responsável pela veracidade, exatidão e atualização das informações fornecidas.

O usuário compromete-se a manter a confidencialidade de suas credenciais de acesso (login e senha), sendo integralmente responsável por todas as atividades realizadas em sua conta.

A conta de acesso é pessoal, individual, intransferível e de uso exclusivo do usuário cadastrado, sendo expressamente vedado o compartilhamento com terceiros, independentemente de vínculo pessoal ou profissional.

A utilização simultânea da mesma conta em dispositivos, localidades ou padrões incompatíveis com o uso individual poderá ser interpretada como indício de compartilhamento indevido, autorizando a plataforma a adotar medidas preventivas e corretivas.`
  },
  {
    title: "6. USO PROIBIDO E CONDUTAS VEDADAS",
    content: `É expressamente vedado ao usuário:

I – compartilhar, ceder, emprestar ou permitir o acesso de terceiros à sua conta;
II – revender, sublicenciar, redistribuir ou explorar comercialmente os conteúdos ou funcionalidades da plataforma;
III – copiar, reproduzir, modificar, adaptar ou criar obras derivadas do conteúdo disponibilizado;
IV – utilizar robôs, scripts, automações ou quaisquer mecanismos que possam comprometer o funcionamento da plataforma;
V – tentar acessar áreas restritas, sistemas, servidores ou bancos de dados sem autorização;
VI – praticar engenharia reversa, descompilação ou tentativa de extração de código ou estrutura do sistema;
VII – explorar falhas, vulnerabilidades ou inconsistências da plataforma para obtenção de vantagem indevida;
VIII – realizar qualquer conduta que viole a legislação vigente ou os presentes Termos.

O descumprimento poderá ensejar: suspensão imediata do acesso; cancelamento definitivo da conta; bloqueio de novos cadastros; responsabilização civil e/ou penal.`
  },
  {
    title: "7. PAGAMENTO E CDC",
    content: `Valores informados previamente.

Direito de arrependimento de 7 dias conforme CDC art. 49:
O consumidor pode desistir do contrato, no prazo de 7 (sete) dias a contar de sua assinatura ou do ato de recebimento do produto ou serviço, sempre que a contratação de fornecimento de produtos e serviços ocorrer fora do estabelecimento comercial.

Parágrafo único: Se o consumidor exercitar o direito de arrependimento, os valores eventualmente pagos serão devolvidos, de imediato, monetariamente atualizados.

Após prazo legal, não há reembolso.`
  },
  {
    title: "8. PROVA DE USO",
    content: `A plataforma registra, de forma contínua, dados relacionados à utilização do serviço, incluindo:
• endereço IP
• data e horário de acesso
• tempo de utilização
• conteúdos acessados ou visualizados
• interações realizadas dentro da plataforma

Tais registros constituem prova de efetiva disponibilização e utilização do serviço, podendo ser utilizados para fins de comprovação de prestação do serviço, defesa em processos administrativos, judiciais e perante instituições financeiras.`
  },
  {
    title: "9. CHARGEBACK E CONTESTAÇÃO DE PAGAMENTO",
    content: `O usuário declara ciência de que a contratação e utilização da plataforma Proftime caracteriza a efetiva disponibilização e prestação do serviço digital contratado.

A plataforma mantém registros técnicos e operacionais detalhados, incluindo logs de acesso, registro de aceite dos Termos, histórico de utilização e registros de autenticação.

A abertura de chargeback ou contestação de pagamento de forma indevida, especialmente após a efetiva utilização da plataforma, poderá ensejar: bloqueio imediato da conta; suspensão ou cancelamento definitivo do acesso; cobrança administrativa dos valores devidos; adoção de medidas judiciais cabíveis.`
  },
  {
    title: "10. SEGURANÇA DA INFORMAÇÃO E PROTEÇÃO DE DADOS",
    content: `A plataforma Proftime adota medidas técnicas, administrativas e organizacionais adequadas para proteção dos dados pessoais, em conformidade com a legislação vigente, especialmente o art. 46 da LGPD.

Medidas adotadas:
• criptografia de dados em trânsito e em repouso;
• controle de acesso baseado em níveis de permissão (RBAC);
• autenticação e gestão segura de sessões;
• registro e monitoramento contínuo de logs;
• mecanismos de detecção e prevenção de acessos não autorizados.`
  },
  {
    title: "11. LGPD – LEI 13.709/2018",
    content: `Tratamento conforme Lei 13.709/2018. Os dados pessoais do usuário são tratados com base nos princípios de finalidade, adequação, necessidade, livre acesso, qualidade dos dados, transparência, segurança, prevenção, não discriminação e responsabilização.

O tratamento de dados pessoais somente é realizado mediante consentimento do titular, para cumprimento de obrigação legal, execução de contrato, exercício regular de direitos ou atendimento a interesses legítimos.

Direitos do titular (art. 18):
• confirmação da existência de tratamento
• acesso aos dados
• correção de dados incompletos ou inexatos
• anonimização, bloqueio ou eliminação de dados
• portabilidade dos dados
• eliminação dos dados pessoais tratados com consentimento
• revogação do consentimento`
  },
  {
    title: "12. RETENÇÃO DE DADOS",
    content: `Os dados pessoais serão armazenados pelo período necessário ao cumprimento das finalidades, observando:

I – enquanto perdurar a relação contratual;
II – pelo tempo necessário ao cumprimento de obrigações legais, regulatórias e fiscais;
III – para o exercício regular de direitos em processos administrativos, judiciais ou arbitrais;
IV – para prevenção de fraudes e proteção do crédito;
V – pelo prazo mínimo de até 5 (cinco) anos, quando necessário.

Após o término do tratamento, os dados serão eliminados ou anonimizados, ressalvadas as hipóteses de conservação previstas na legislação.`
  },
  {
    title: "13. LIMITAÇÃO DE RESPONSABILIDADE",
    content: `Nos termos do art. 944 do Código Civil, a responsabilidade da plataforma fica limitada aos danos diretos comprovados.

Fica expressamente excluída responsabilidade por:
• lucros cessantes
• danos indiretos
• perda de oportunidade
• decisões tomadas com base no conteúdo

O valor máximo de eventual indenização ficará limitado ao montante pago pelo usuário nos últimos 12 meses.`
  },
  {
    title: "14. INDISPONIBILIDADE E MANUTENÇÃO",
    content: `A plataforma poderá apresentar indisponibilidades temporárias decorrentes de manutenções, falhas técnicas, ataques cibernéticos, caso fortuito ou força maior.

A plataforma não garante disponibilidade ininterrupta, comprometendo-se a envidar esforços razoáveis para restabelecimento do serviço no menor tempo possível.

Eventuais indisponibilidades não caracterizam falha na prestação do serviço, não gerando direito a indenização, abatimento ou reembolso, salvo nos casos expressamente previstos em lei.`
  },
  {
    title: "15. INTELIGÊNCIA ARTIFICIAL",
    content: `A plataforma poderá utilizar tecnologias baseadas em inteligência artificial para geração de conteúdos, sugestões e automações.

Os conteúdos gerados por IA possuem caráter meramente auxiliar, podendo apresentar imprecisões ou inconsistências. A utilização das informações é de exclusiva responsabilidade do usuário.

É vedado ao usuário:
• utilizar os conteúdos gerados para fins ilícitos;
• utilizar a plataforma como substituição integral de análise profissional;
• reproduzir, extrair ou explorar comercialmente as funcionalidades baseadas em IA.`
  },
  {
    title: "16. CANCELAMENTO E REEMBOLSO",
    content: `O usuário poderá solicitar cancelamento a qualquer momento, permanecendo com acesso até o término do período pago.

Nos termos do art. 49 do CDC, o usuário poderá exercer o direito de arrependimento no prazo de 7 (sete) dias contados da contratação, com direito ao cancelamento integral e devolução total dos valores pagos.

Após o decurso do prazo legal, o cancelamento não implicará direito a reembolso, considerando-se a disponibilização contínua do serviço contratado.`
  },
  {
    title: "17 a 20. ALTERAÇÕES, SANÇÕES E FORO",
    content: `ALTERAÇÃO DOS TERMOS: A Proftime poderá alterar os Termos a qualquer tempo, informando o usuário com antecedência mínima de 15 dias. A continuidade do uso após as alterações implica aceitação integral.

SANÇÕES: O descumprimento poderá ensejar advertência, suspensão temporária, bloqueio imediato, cancelamento definitivo da conta e medidas administrativas, cíveis e/ou penais.

FORO E LEGISLAÇÃO: Estes Termos são regidos pelas leis da República Federativa do Brasil. Fica eleito o foro do domicílio do consumidor, nos termos do art. 101, inciso I, do Código de Defesa do Consumidor.`
  },
];

export default function TermsOfUseModal({ open, onAccept }) {
  const [expanded, setExpanded] = useState(null);
  const [showFull, setShowFull] = useState(false);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 40, scale: 0.95 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="fixed bottom-5 right-5 z-[9999] w-80 rounded-2xl border border-white/[0.1] shadow-2xl overflow-hidden flex flex-col"
          style={{ background: "#0d1728", maxHeight: "80vh" }}
        >
          {/* Header */}
          <div className="px-4 pt-4 pb-3 border-b border-white/[0.07] shrink-0"
            style={{ background: "linear-gradient(135deg, #0d1a30 0%, #0f172a 100%)" }}>
            <div className="flex items-center gap-2.5 mb-2.5">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: "linear-gradient(135deg, #3b82f620, #8b5cf620)", border: "1px solid #3b82f640" }}>
                <Shield className="w-4 h-4 text-blue-400" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white">Termos de Uso – Proftime</h2>
                <p className="text-[11px] text-slate-500 mt-0.5">Leia e aceite para continuar</p>
              </div>
            </div>

            {/* Summary */}
            <div className="rounded-xl p-3 border border-blue-500/20 text-[11px] text-slate-400 leading-relaxed"
              style={{ background: "#0a1525" }}>
              Ao usar a plataforma você concorda com a proteção da propriedade intelectual, política de privacidade (LGPD) e condições de pagamento. Aceite registrado com IP, data e hora.
            </div>
          </div>

          {/* Content toggle */}
          <div className="px-4 py-2 border-b border-white/[0.05] shrink-0">
            <button
              onClick={() => setShowFull(s => !s)}
              className="flex items-center gap-1.5 text-[11px] text-blue-400 hover:text-blue-300 transition-colors font-medium"
            >
              <ChevronDown className={`w-3 h-3 transition-transform ${showFull ? "rotate-180" : ""}`} />
              {showFull ? "Ocultar termos completos" : "Ler termos completos"}
            </button>
          </div>

          {/* Full terms (expandable) */}
          <AnimatePresence>
            {showFull && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-y-auto"
                style={{ maxHeight: "35vh" }}
              >
                <div className="px-4 py-3 space-y-1">
                  {TERMS_SECTIONS.map((section, i) => (
                    <div key={i} className="rounded-xl overflow-hidden border border-white/[0.05]">
                      <button
                        onClick={() => setExpanded(expanded === i ? null : i)}
                        className="w-full flex items-center justify-between px-3 py-2.5 text-left hover:bg-white/[0.03] transition-colors"
                      >
                        <span className="text-[11px] font-semibold text-slate-300">{section.title}</span>
                        <ChevronDown className={`w-3 h-3 text-slate-600 transition-transform shrink-0 ml-2 ${expanded === i ? "rotate-180" : ""}`} />
                      </button>
                      <AnimatePresence>
                        {expanded === i && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <div className="px-3 pb-3 text-[11px] text-slate-500 leading-relaxed whitespace-pre-line border-t border-white/[0.04] pt-2.5">
                              {section.content}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Footer */}
          <div className="px-4 py-4 border-t border-white/[0.07] shrink-0 space-y-2.5"
            style={{ background: "#090e1a" }}>
            <p className="text-[10px] text-slate-600 text-center leading-relaxed">
              Ao clicar em <strong className="text-slate-500">"Aceitar e Continuar"</strong>, você declara ter lido e concordar com os Termos e a LGPD da Proftime.
            </p>
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={onAccept}
              className="w-full h-10 rounded-xl text-white font-semibold text-xs flex items-center justify-center gap-2"
              style={{ background: "linear-gradient(135deg, #2563eb, #4f46e5)", boxShadow: "0 0 20px #3b82f625" }}
            >
              <Shield className="w-3.5 h-3.5" />
              Aceitar e Continuar
            </motion.button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}